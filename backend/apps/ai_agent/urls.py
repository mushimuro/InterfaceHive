from django.urls import path
from .views import GenerateFromRepoView, GenerateFromIdeaView

urlpatterns = [
    path('generate-from-repo/', GenerateFromRepoView.as_view(), name='generate-from-repo'),
    path('generate-from-idea/', GenerateFromIdeaView.as_view(), name='generate-from-idea'),
]
