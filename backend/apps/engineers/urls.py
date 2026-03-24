from rest_framework.routers import DefaultRouter
from .views import EngineerViewSet

router = DefaultRouter()
router.register("engineer", EngineerViewSet)

urlpatterns = router.urls
