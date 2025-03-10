from django.db import models
from django.conf import settings

class Collection(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='collection_images/', blank=True, null=True)
    qr_code = models.ImageField(upload_to='collection_qrcodes/', blank=True, null=True)
    is_shared = models.BooleanField(default=False)  # เพิ่มฟิลด์นี้
    topMessage = models.CharField(max_length=255, blank=True, null=True)
    bottomMessage = models.CharField(max_length=255, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)  # ใช้ is_approved แทน status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

