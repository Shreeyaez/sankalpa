from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("priority-levels", PriorityLevelViewSet)
router.register("project-types", ProjectTypeViewSet)
router.register("road-types", RoadTypeViewSet)
router.register("delay-types", DelayTypeViewSet)
router.register("alert-types", AlertTypeViewSet)
router.register("budget-sources", BudgetSourceViewSet)
router.register("fiscal-years", FiscalYearViewSet)

urlpatterns = router.urls
