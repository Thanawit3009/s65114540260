from rest_framework import serializers
from .models import Collection

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = [
            'id',
            'name',
            'description',
            'image',
            'qr_code',  # เปลี่ยนจาก qrCode เป็น qr_code
            'topMessage',
            'bottomMessage',
            'is_approved',  # ใช้ is_approved แทน status
            'created_at',
            'updated_at',
        ]
