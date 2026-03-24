from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("measurement-book", MeasurementBookViewSet)
router.register("materials", MaterialViewSet)
router.register("abstract-record", AbstractCostViewSet)

urlpatterns = router.urls
