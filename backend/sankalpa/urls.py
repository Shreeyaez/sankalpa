from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    path("api/lookups/", include("apps.lookups.urls")),
    path("api/locations/", include("apps.locations.urls")),
    path("api/engineers/", include("apps.engineers.urls")),
    path("api/chairpersons/", include("apps.chairpersons.urls")),
    path("api/contractors/", include("apps.contractors.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/roads/", include("apps.roads.urls")),
    path("api/milestones/", include("apps.milestones.urls")),
    path("api/logs/", include("apps.logs.urls")),
    path("api/alerts/", include("apps.alerts.urls")),
    path("api/audit/", include("apps.audit.urls")),
    path("api/finance/", include("apps.finance.urls")),
    path("api/financepersons/", include("apps.financepersons.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)