from django.db import models
from apps.projects.models import Project


class MeasurementBook(models.Model):
    STATUS_CHOICES = (
        ("DRAFT",    "Draft"),
        ("PENDING",  "Pending"),
        ("VERIFIED", "Verified"),
    )
    CATEGORY_CHOICES = (
        ("EARTHWORK", "Earthwork"),
        ("PAVEMENT",  "Pavement"),
        ("CONCRETE",  "Concrete"),
        ("DRAINAGE",  "Drainage"),
    )

    project      = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="measurement_books")
    date         = models.DateField()
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default="DRAFT")
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "measurement_books"
        ordering = ["-date"]

    def __str__(self):
        return f"MB-{self.id:04d} | {self.project.project_code} | {self.date}"


class MeasurementItem(models.Model):
    measurement_book = models.ForeignKey(MeasurementBook, on_delete=models.CASCADE, related_name="items")
    description      = models.CharField(max_length=300)
    nos              = models.IntegerField(default=1)
    length           = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    breadth          = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    height           = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    quantity         = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    unit             = models.CharField(max_length=20, default="m³")
    rate             = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount           = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = "measurement_items"


class Material(models.Model):
    STATUS_CHOICES = (
        ("PENDING",   "Pending"),
        ("ORDERED",   "Ordered"),
        ("DELIVERED", "Delivered"),
    )

    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="materials")
    date        = models.DateField()
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "materials"
        ordering = ["-date"]

    def __str__(self):
        return f"MAT-{self.id:04d} | {self.project.project_code} | {self.date}"


class MaterialItem(models.Model):
    material       = models.ForeignKey(Material, on_delete=models.CASCADE, related_name="items")
    material_name  = models.CharField(max_length=200)
    specification  = models.CharField(max_length=300, blank=True)
    unit           = models.CharField(max_length=20, default="bags")
    quantity       = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unit_rate      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount   = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = "material_items"


class AbstractCost(models.Model):
    STATUS_CHOICES = (
        ("DRAFT",    "Draft"),
        ("PENDING",  "Pending"),
        ("APPROVED", "Approved"),
    )

    project             = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="abstract_costs")
    date                = models.DateField()
    status              = models.CharField(max_length=10, choices=STATUS_CHOICES, default="DRAFT")
    subtotal            = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    vat_amount          = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    contingency_amount  = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    grand_total         = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # ← auto-calculated
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "abstract_costs"
        ordering = ["-date"]

    def __str__(self):
        return f"AC-{self.id:04d} | {self.project.project_code} | {self.date}"


class AbstractCostItem(models.Model):
    abstract_cost = models.ForeignKey(AbstractCost, on_delete=models.CASCADE, related_name="items")
    description   = models.CharField(max_length=300)
    unit          = models.CharField(max_length=20, default="m³")
    quantity      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    rate          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount        = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = "abstract_cost_items"