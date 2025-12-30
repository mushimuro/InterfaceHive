from django.urls import path
from apps.credits.views import (
    UserCreditBalanceView,
    UserCreditLedgerView,
    UserPublicCreditsView,
)

urlpatterns = [
    # Authenticated user's credit info
    path('me/balance/', UserCreditBalanceView.as_view(), name='my-credit-balance'),
    path('me/ledger/', UserCreditLedgerView.as_view(), name='my-credit-ledger'),
    
    # Public user credit info
    path('users/<uuid:user_id>/', UserPublicCreditsView.as_view(), name='user-public-credits'),
]

