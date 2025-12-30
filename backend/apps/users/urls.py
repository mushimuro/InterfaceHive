"""
URL routing for user authentication endpoints.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    
    # JWT Token Management
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User Profile
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('<uuid:user_id>/', views.PublicUserProfileView.as_view(), name='public-profile'),
]

