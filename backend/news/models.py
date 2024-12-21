from django.db import models

class News(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='news_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True)  # กำหนดสถานะข่าว: สาธารณะหรือไม่

    def __str__(self):
        return self.title
