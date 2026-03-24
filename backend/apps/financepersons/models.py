from django.db import models
from apps.accounts.models import Account


class Financeperson(models.Model):
    """
    Financeperson profile linked to an Account.
    """

    account = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        related_name="financeperson_profile"
    )

    class Meta:
        db_table = "financepersons"
        verbose_name = "Financeperson"
        verbose_name_plural = "Financepersons"

    def __str__(self):
        return self.account.full_name
