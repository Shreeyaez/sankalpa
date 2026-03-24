from rest_framework.routers import DefaultRouter
from .views import ChairpersonViewSet

router = DefaultRouter()
router.register("chairperson", ChairpersonViewSet)

urlpatterns = router.urls
