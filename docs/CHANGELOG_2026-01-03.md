# Changelog - January 3, 2026

## Bug Fix: Post Thought Not Saving in Ideas & Thoughts

### Problem

When users tried to post a thought under **Projects > Implementation > Ideas & Thoughts**, clicking "Post Thought" failed with a **400 Bad Request** error. The thought was not being saved.

### Root Cause

The `ProjectNoteSerializer` in `backend/apps/projects/serializers.py` had the `project` field listed in `fields` but NOT in `read_only_fields`. This caused the serializer to expect a `project` value in the request body.

However, the frontend only sends:
```json
{ "content": "user's thought text" }
```

The `project` ID is taken from the URL path (`/projects/<project_id>/notes/`), not from the request body. Since `project` was required but not provided, validation failed.

### Solution

Added `project` to the `read_only_fields` in `ProjectNoteSerializer`.

### File Changed

**`backend/apps/projects/serializers.py`** (line 319)

#### Before:
```python
class ProjectNoteSerializer(serializers.ModelSerializer):
    """Serializer for private project notes."""
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ProjectNote
        fields = [
            'id',
            'project',
            'user',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
```

#### After:
```python
class ProjectNoteSerializer(serializers.ModelSerializer):
    """Serializer for private project notes."""
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ProjectNote
        fields = [
            'id',
            'project',
            'user',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'project', 'user', 'created_at', 'updated_at']
```

### Verification

Tested using Playwright:
1. Logged in as Test User
2. Navigated to a project's Implementation tab
3. Typed a thought in the textarea
4. Clicked "Post Thought"
5. Thought was successfully saved and displayed in the Ideas & Thoughts section
