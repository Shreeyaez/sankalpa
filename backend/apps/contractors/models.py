from django.db import models


class Contractor(models.Model):
    """
    Contractor entity responsible for executing projects.
    """

    # --- Contractor Basic Info ---
    contractor_name = models.CharField(
        max_length=200
    )

    address = models.TextField(
        null=True,
        blank=True
    )

    registration_no = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    latest_renewal_date = models.DateField(
        null=True,
        blank=True
    )

    email = models.EmailField(
        null=True,
        blank=True
    )

    CONTRACTOR_TYPE_CHOICES = (
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    )

    contractor_type = models.CharField(
        max_length=1,
        choices=CONTRACTOR_TYPE_CHOICES,
        null=True,
        blank=True
    )

    pan_vat_no = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    contact_number = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    # --- Firm / Company Details ---
    company_name = models.CharField(
        max_length=200,
        null=True,
        blank=True
    )

    company_phone = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    company_email = models.EmailField(
        null=True,
        blank=True
    )

    company_address = models.TextField(
        null=True,
        blank=True
    )

    municipality = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )

    district = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )

    # --- Documents ---
    registration_certificate = models.FileField(
        upload_to="contractors/registration_certificates/",
        null=True,
        blank=True
    )

    pan_vat_certificate = models.FileField(
        upload_to="contractors/pan_vat_certificates/",
        null=True,
        blank=True
    )

    # --- Status ---
    suchidarta_flagged = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        db_table = "contractors"
        ordering = ["contractor_name"]
        verbose_name = "Contractor"
        verbose_name_plural = "Contractors"

    def __str__(self):
        return self.contractor_name
