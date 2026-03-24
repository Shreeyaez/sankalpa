from django.db import models


class Location(models.Model):
    """
    Location details for projects (Ward 16 – Kathmandu by default).
    """

    ward_no = models.PositiveIntegerField(
        default=16,
        help_text="Ward number"
    )

    municipality = models.CharField(
        max_length=100,
        default="Kathmandu"
    )

    district = models.CharField(
        max_length=100,
        default="Kathmandu"
    )

    province = models.CharField(
        max_length=100,
        default="Bagmati"
    )

    place_or_street = models.CharField(
        max_length=200
    )

    class Meta:
        db_table = "locations"
        ordering = ["ward_no", "place_or_street"]
        verbose_name = "Location"
        verbose_name_plural = "Locations"

    def __str__(self):
        return f"Ward {self.ward_no}, {self.place_or_street}"
