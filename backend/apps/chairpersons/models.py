from django.db import models
from apps.accounts.models import Account


class Chairperson(models.Model):
    """
    Chairperson profile linked to an Account.
    """

    account = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        related_name="chairperson_profile"
    )

    term_start = models.DateField(
        null=True,
        blank=True
    )

    term_end = models.DateField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = "chairpersons"
        verbose_name = "Chairperson"
        verbose_name_plural = "Chairpersons"

    def __str__(self):
        return self.account.full_name
