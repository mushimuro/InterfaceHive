"""
Celery tasks for user-related asynchronous operations.

Handles email sending, verification, and scheduled cleanup tasks.
"""
import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, user_id, verification_token):
    """
    Send email verification link to user.
    
    Args:
        user_id: UUID of the user
        verification_token: Unique verification token
    
    Retries up to 3 times with 60 second delay on failure.
    """
    from apps.users.models import User
    
    try:
        user = User.objects.get(id=user_id)
        
        # Build verification URL
        frontend_url = settings.FRONTEND_URL
        verification_url = f"{frontend_url}/auth/verify-email?token={verification_token}"
        
        # Email content
        subject = "Verify your InterfaceHive account"
        message = f"""
Hello {user.display_name},

Welcome to InterfaceHive! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The InterfaceHive Team
        """
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
        }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Welcome to InterfaceHive!</h2>
        <p>Hello {user.display_name},</p>
        <p>Thank you for creating an account. Please verify your email address to get started:</p>
        <a href="{verification_url}" class="button">Verify Email Address</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{verification_url}</p>
        <p>This link will expire in 24 hours.</p>
        <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The InterfaceHive Team</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Verification email sent to {user.email}")
        return f"Email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return f"User {user_id} not found"
    
    except Exception as exc:
        logger.error(f"Failed to send verification email to user {user_id}: {exc}")
        # Retry the task
        raise self.retry(exc=exc)


@shared_task
def send_contribution_notification(contribution_id, notification_type):
    """
    Send email notification about contribution status changes.
    
    Args:
        contribution_id: UUID of the contribution
        notification_type: 'submitted', 'accepted', or 'declined'
    """
    from apps.contributions.models import Contribution
    
    try:
        contribution = Contribution.objects.select_related(
            'project', 'contributor', 'project__host_user'
        ).get(id=contribution_id)
        
        frontend_url = settings.FRONTEND_URL
        project_url = f"{frontend_url}/projects/{contribution.project.id}"
        
        if notification_type == 'submitted':
            # Notify project host
            recipient = contribution.project.host_user
            subject = f"New contribution submitted to '{contribution.project.title}'"
            message = f"""
Hello {recipient.display_name},

{contribution.contributor.display_name} has submitted a contribution to your project "{contribution.project.title}".

View the contribution: {project_url}

Best regards,
The InterfaceHive Team
            """
        
        elif notification_type == 'accepted':
            # Notify contributor
            recipient = contribution.contributor
            subject = f"Your contribution to '{contribution.project.title}' was accepted!"
            message = f"""
Hello {recipient.display_name},

Congratulations! Your contribution to "{contribution.project.title}" has been accepted.

You've earned 1 credit! View your profile: {frontend_url}/profile/{recipient.id}

Best regards,
The InterfaceHive Team
            """
        
        elif notification_type == 'declined':
            # Notify contributor
            recipient = contribution.contributor
            subject = f"Update on your contribution to '{contribution.project.title}'"
            message = f"""
Hello {recipient.display_name},

Thank you for your contribution to "{contribution.project.title}".

Unfortunately, the project host has decided not to accept this contribution at this time.

You can view other projects: {frontend_url}/projects

Best regards,
The InterfaceHive Team
            """
        
        else:
            logger.error(f"Unknown notification type: {notification_type}")
            return
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        
        logger.info(f"Notification '{notification_type}' sent for contribution {contribution_id}")
        
    except Contribution.DoesNotExist:
        logger.error(f"Contribution {contribution_id} not found")
    except Exception as exc:
        logger.error(f"Failed to send notification for contribution {contribution_id}: {exc}")


@shared_task
def cleanup_unverified_users():
    """
    Delete user accounts that haven't verified email within 7 days.
    
    Scheduled to run daily via Celery Beat.
    """
    from apps.users.models import User
    
    cutoff_date = timezone.now() - timedelta(days=7)
    
    unverified_users = User.objects.filter(
        email_verified=False,
        created_at__lt=cutoff_date,
        is_deleted=False
    )
    
    count = unverified_users.count()
    unverified_users.delete()
    
    logger.info(f"Cleaned up {count} unverified user accounts")
    return f"Deleted {count} unverified accounts"


@shared_task
def anonymize_deleted_users():
    """
    Anonymize user data for accounts marked for deletion after 30 days.
    
    GDPR compliance: Users can request deletion, data is anonymized after 30 days.
    Scheduled to run daily via Celery Beat.
    """
    from apps.users.models import User
    
    cutoff_date = timezone.now() - timedelta(days=30)
    
    users_to_anonymize = User.objects.filter(
        is_deleted=True,
        deletion_requested_at__lt=cutoff_date,
        data_anonymized_at__isnull=True
    )
    
    count = 0
    for user in users_to_anonymize:
        user.anonymize()
        count += 1
    
    logger.info(f"Anonymized {count} deleted user accounts")
    return f"Anonymized {count} accounts"

