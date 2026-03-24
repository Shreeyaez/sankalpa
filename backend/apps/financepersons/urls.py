from rest_framework.routers import DefaultRouter
from .views import FinancepersonViewSet

router = DefaultRouter()
router.register("financeperson", FinancepersonViewSet)

urlpatterns = router.urls
