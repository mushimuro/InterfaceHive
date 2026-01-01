from rest_framework import serializers
from django.utils import timezone
from apps.contributions.models import Contribution
from apps.users.serializers import UserProfileSerializer
from apps.projects.models import Project


class ContributionSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying contributions with full contributor and project details.
    """
    contributor = UserProfileSerializer(source='contributor_user', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    decided_by_name = serializers.CharField(source='decided_by_user.display_name', read_only=True, allow_null=True)
    links = serializers.JSONField(source='links_json', required=False, allow_null=True)
    attachments = serializers.JSONField(source='attachments_json', required=False, allow_null=True)

    class Meta:
        model = Contribution
        fields = (
            'id', 'project', 'project_title', 'contributor', 'title', 'body',
            'links', 'attachments', 'status', 'decided_by_user', 'decided_by_name',
            'decided_at', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'contributor', 'status', 'decided_by_user', 'decided_at', 'created_at', 'updated_at')


class ContributionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new contributions with validation.
    """
    links = serializers.ListField(
        child=serializers.URLField(max_length=500),
        required=False,
        allow_empty=True,
        max_length=10,
        help_text="List of URLs (max 10)"
    )
    attachments = serializers.ListField(
        child=serializers.URLField(max_length=500),
        required=False,
        allow_empty=True,
        max_length=5,
        help_text="List of attachment URLs (max 5)"
    )

    class Meta:
        model = Contribution
        fields = ('id', 'project', 'title', 'body', 'links', 'attachments', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_project(self, value):
        """
        Validate that the project exists and is open for contributions.
        """
        if not value:
            raise serializers.ValidationError("Project is required.")
        
        if value.status != 'open':
            raise serializers.ValidationError("This project is not accepting contributions. Project status must be OPEN.")
        
        return value

    def validate(self, data):
        """
        Validate that the contributor is not the project host and hasn't already contributed.
        """
        request = self.context.get('request')
        project = data.get('project')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("You must be authenticated to submit a contribution.")
        
        # Check if user is the project host
        if project.host_user == request.user:
            raise serializers.ValidationError("You cannot submit a contribution to your own project.")
        
        # Check if user has already submitted a contribution to this project
        existing_contribution = Contribution.objects.filter(
            project=project,
            contributor_user=request.user
        ).exists()
        
        if existing_contribution:
            raise serializers.ValidationError("You have already submitted a contribution to this project.")
        
        # Validate body length (min 20, max 5000 characters)
        body = data.get('body', '')
        if len(body) < 20:
            raise serializers.ValidationError({"body": "Contribution body must be at least 20 characters."})
        if len(body) > 5000:
            raise serializers.ValidationError({"body": "Contribution body must not exceed 5000 characters."})
        
        return data

    def create(self, validated_data):
        """
        Create a new contribution and set the contributor from the request user.
        """
        # Extract links and attachments, convert to JSON
        links = validated_data.pop('links', [])
        attachments = validated_data.pop('attachments', [])
        
        contribution = Contribution.objects.create(
            contributor_user=self.context['request'].user,
            links_json=links,
            attachments_json=attachments,
            **validated_data
        )
        return contribution


class ContributionDecisionSerializer(serializers.Serializer):
    """
    Serializer for accepting or declining contributions.
    """
    decision = serializers.ChoiceField(choices=['accepted', 'declined'], required=True)
    feedback = serializers.CharField(required=False, allow_blank=True, max_length=1000)

    def validate(self, data):
        """
        Validate that the contribution can be decided upon.
        """
        contribution = self.context.get('contribution')
        request = self.context.get('request')
        
        if not contribution:
            raise serializers.ValidationError("Contribution not found.")
        
        if contribution.status != 'PENDING':
            raise serializers.ValidationError(f"This contribution has already been {contribution.status.lower()}.")
        
        if contribution.project.host_user != request.user:
            raise serializers.ValidationError("Only the project host can accept or decline contributions.")
        
        return data

