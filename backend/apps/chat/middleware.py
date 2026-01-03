import logging
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

class JWTAuthMiddleware:
    """
    Custom JWT authentication middleware for Channels.
    Expects token in the query string: ws://.../?token=<token>
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token.payload.get('user_id')
                user = await get_user(user_id)
                if user:
                    scope['user'] = user
                    logger.debug(f"JWTAuthMiddleware: Authenticated user {user.email}")
                else:
                    logger.warning(f"JWTAuthMiddleware: User with ID {user_id} not found")
                    from django.contrib.auth.models import AnonymousUser
                    scope['user'] = AnonymousUser()
            except Exception as e:
                logger.error(f"JWTAuthMiddleware: Token validation failed: {str(e)}")
                from django.contrib.auth.models import AnonymousUser
                scope['user'] = AnonymousUser()
        else:
            logger.debug("JWTAuthMiddleware: No token provided in query string")
            from django.contrib.auth.models import AnonymousUser
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)
