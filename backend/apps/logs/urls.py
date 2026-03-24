from rest_framework.routers import DefaultRouter
from .views import WeeklyLogViewSet, DelayLogViewSet

router = DefaultRouter()
router.register("weekly-logs", WeeklyLogViewSet, basename="weekly-logs")
router.register("delay-logs", DelayLogViewSet, basename="delay-logs")

urlpatterns = router.urls
