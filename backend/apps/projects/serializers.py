from rest_framework import serializers
from .models import Project,PastProjectRecord
from apps.contractors.serializers import ContractorSerializer
from apps.engineers.serializers import EngineerSerializer
from apps.chairpersons.serializers import ChairpersonSerializer
from apps.lookups.serializers import BudgetSourceSerializer, FiscalYearSerializer


class ProjectSerializer(serializers.ModelSerializer):
    # Match the field names used in frontend
    contractor_details = ContractorSerializer(source='contractor', read_only=True)
    assigned_engineer_details = EngineerSerializer(source='assigned_engineer', read_only=True)
    chairperson_details = ChairpersonSerializer(source='chairperson', read_only=True)
    budget_source_details = BudgetSourceSerializer(source='budget_source', read_only=True)
    fiscal_year_details = FiscalYearSerializer(source='fiscal_year', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'project_code',
            'project_name',
            'project_description',
            'priority',
            'ward_no',
            'municipality',
            'district',
            'province',
            'location',
            'total_approved_budget',
            'budget_source',
            'budget_source_details',
            'fiscal_year',
            'fiscal_year_details',
            'assigned_engineer',
            'assigned_engineer_details',  # Changed from engineer_details
            'chairperson',
            'chairperson_details',
            'contractor',
            'contractor_details',
            'contractor_contact_person',
            'proposed_date',
            'approved_date',
            'planned_start_date',
            'planned_completion_date',
            'planned_duration_days',
            'created_at',
            'status',
            'project_document',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'contractor_details',
            'assigned_engineer_details',
            'chairperson_details',
            'budget_source_details',
            'fiscal_year_details',
        ]
class PastProjectRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PastProjectRecord
        fields = ["id", "file", "uploaded_at"]
        read_only_fields = ["uploaded_at"]

    def validate_file(self, value):
        allowed_extensions = [".xlsx", ".xls"]
        ext = value.name.lower().split(".")[-1]
        if f".{ext}" not in allowed_extensions:
            raise serializers.ValidationError(
                "Only Excel files (.xlsx, .xls) are allowed."
            )
        return value