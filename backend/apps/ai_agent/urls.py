from django.urls import path
from .views import GenerateFromRepoView, GenerateFromIdeaView, GenerateRandomProjectView

urlpatterns = [
    path('generate-from-repo/', GenerateFromRepoView.as_view(), name='generate-from-repo'),
    path('generate-from-idea/', GenerateFromIdeaView.as_view(), name='generate-from-idea'),
    path('generate-random/', GenerateRandomProjectView.as_view(), name='generate-random'),
]
