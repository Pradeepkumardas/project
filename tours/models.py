from django.db import models

# Create your models here.
from django.db import models


class Booking(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return self.full_name