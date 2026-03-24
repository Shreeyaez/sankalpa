from rest_framework import serializers
from django.db import transaction
from .models import (
    MeasurementBook, MeasurementItem,
    Material, MaterialItem,
    AbstractCost, AbstractCostItem,
)


# ─── MEASUREMENT BOOK ─────────────────────────────────────────────────────────

class MeasurementItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementItem
        exclude = ("measurement_book",)


class MeasurementBookSerializer(serializers.ModelSerializer):
    items = MeasurementItemSerializer(many=True)
    # Auto-calculated - read only, computed from items
    total_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model = MeasurementBook
        fields = "__all__"

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        measurement = MeasurementBook.objects.create(**validated_data)

        total = 0
        for item in items_data:
            mi = MeasurementItem.objects.create(
                measurement_book=measurement,
                **item
            )
            total += float(mi.amount or 0)

        # Save computed total
        measurement.total_amount = total
        measurement.save(update_fields=["total_amount"])

        return measurement

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        # Update header fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            # Delete old items and recreate
            instance.items.all().delete()

            total = 0
            for item in items_data:
                mi = MeasurementItem.objects.create(
                    measurement_book=instance,
                    **item
                )
                total += float(mi.amount or 0)

            instance.total_amount = total
            instance.save(update_fields=["total_amount"])

        return instance


# ─── MATERIAL ─────────────────────────────────────────────────────────────────

class MaterialItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialItem
        exclude = ("material",)


class MaterialSerializer(serializers.ModelSerializer):
    items = MaterialItemSerializer(many=True)
    grand_total = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model = Material
        fields = "__all__"

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one material item is required.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        material = Material.objects.create(**validated_data)

        grand_total = 0
        for item in items_data:
            mi = MaterialItem.objects.create(material=material, **item)
            grand_total += float(mi.total_amount or 0)

        material.grand_total = grand_total
        material.save(update_fields=["grand_total"])

        return material

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()

            grand_total = 0
            for item in items_data:
                mi = MaterialItem.objects.create(material=instance, **item)
                grand_total += float(mi.total_amount or 0)

            instance.grand_total = grand_total
            instance.save(update_fields=["grand_total"])

        return instance


# ─── ABSTRACT COST ────────────────────────────────────────────────────────────

class AbstractCostItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AbstractCostItem
        exclude = ("abstract_cost",)


class AbstractCostSerializer(serializers.ModelSerializer):
    items = AbstractCostItemSerializer(many=True)
    subtotal = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )
    vat_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )
    contingency_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )
    grand_total = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model = AbstractCost
        fields = "__all__"

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one abstract cost item is required.")
        return value

    def _compute_totals(self, subtotal):
        vat         = round(subtotal * 0.13, 2)
        contingency = round(subtotal * 0.04, 2)
        grand_total = round(subtotal + vat + contingency, 2)
        return vat, contingency, grand_total

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        abstract = AbstractCost.objects.create(**validated_data)

        subtotal = 0
        for item in items_data:
            ai = AbstractCostItem.objects.create(abstract_cost=abstract, **item)
            subtotal += float(ai.amount or 0)

        vat, contingency, grand_total = self._compute_totals(subtotal)
        abstract.subtotal           = subtotal
        abstract.vat_amount         = vat
        abstract.contingency_amount = contingency
        abstract.grand_total        = grand_total
        abstract.save(update_fields=["subtotal", "vat_amount", "contingency_amount", "grand_total"])

        return abstract

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()

            subtotal = 0
            for item in items_data:
                ai = AbstractCostItem.objects.create(abstract_cost=instance, **item)
                subtotal += float(ai.amount or 0)

            vat, contingency, grand_total = self._compute_totals(subtotal)
            instance.subtotal           = subtotal
            instance.vat_amount         = vat
            instance.contingency_amount = contingency
            instance.grand_total        = grand_total
            instance.save(update_fields=["subtotal", "vat_amount", "contingency_amount", "grand_total"])

        return instance