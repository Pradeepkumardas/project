from django.urls import path
from tours import views
from tours.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('destinations/', views.destinations, name='destinations'),
    path('tours/', views.tours, name='tours'),
    path('cart/', views.cart, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('london/', views.london, name='london'),
    path('vtours/', views.vtours, name='vtours'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
]
