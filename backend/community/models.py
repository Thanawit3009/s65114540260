from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'  # ใช้ email เป็นฟิลด์สำหรับเข้าสู่ระบบ
    REQUIRED_FIELDS = ['username']


class Post(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ชี้ไปที่โมเดลผู้ใช้ที่กำหนดเอง
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)  # หัวข้อโพสต์
    content = models.TextField()  # เนื้อหาโพสต์
    image = models.ImageField(upload_to='images/', null=True, blank=True)  # อัปโหลดรูป
    image_url = models.URLField(blank=True, null=True)  # ลิงก์รูปภาพ
    created_at = models.DateTimeField(auto_now_add=True)  # เวลาที่สร้างโพสต์

    def __str__(self):
        return self.title

