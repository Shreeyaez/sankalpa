from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet,PastProjectRecordViewSet

router = DefaultRouter()
router.register("project", ProjectViewSet, basename="project")
router.register("past-project-records", PastProjectRecordViewSet)

urlpatterns = router.urls
