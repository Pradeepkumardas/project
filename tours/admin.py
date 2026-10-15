from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.admin.forms import AdminAuthenticationForm
from .models import Booking


class NoAutofillAdminLoginForm(AdminAuthenticationForm):
    """Admin login form that stops the browser from auto-filling saved credentials."""

    def __init__(self, request=None, *args, **kwargs):
        super().__init__(request, *args, **kwargs)
        # Remove the attributes browsers use to detect & auto-fill a saved login:
        # no autofocus and no autocomplete="username" on the username field.
        self.fields["username"].widget.attrs.update({
            "autocomplete": "off",
            "autofocus": False,  # Django omits attributes set to False/None
        })
        # Tell the browser this is not an "existing password" login field.
        self.fields["password"].widget.attrs.update({
            "autocomplete": "new-password",
        })


class TheTripMitraAdminSite(AdminSite):
    login_form = NoAutofillAdminLoginForm


admin_site = TheTripMitraAdminSite(name="thetripmitra_admin")


@admin.register(Booking, site=admin_site)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone', 'created_at')
    search_fields = ('full_name', 'email', 'phone')
    list_filter = ('created_at',)

