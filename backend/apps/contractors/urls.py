from rest_framework.routers import DefaultRouter
from .views import ContractorViewSet

router = DefaultRouter()
router.register("contractor", ContractorViewSet)

urlpatterns = router.urls
