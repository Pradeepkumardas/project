import re

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from .models import Booking

# Real-world input rules: Indian mobile numbers are exactly 10 digits and
# card numbers are exactly 16 digits (spaces only added for display).
PHONE_RE = re.compile(r"^\d{10}$")
CARD_RE = re.compile(r"^\d{16}$")

def home(request):
    return render(request, 'tours/index.html')

def about(request):
    return render(request, 'tours/about.html')

def contact(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        message = request.POST.get("message")
        messages.success(request, f"Thank you {name}! We received your message and will contact you soon.")
        return redirect('contact')
    return render(request, 'tours/contact.html')

def destinations(request):
    return render(request, 'tours/destinations.html')

def tours(request):
    return render(request, 'tours/tours.html')

@login_required
def cart(request):
    return render(request, 'tours/cart.html')

@login_required
def checkout(request):
    if request.method == "POST":
        full_name = request.POST.get("full_name")
        email = request.POST.get("email")
        phone = (request.POST.get("phone") or "").strip()
        card_number = (request.POST.get("card_number") or "").replace(" ", "").strip()

        if not (full_name and email and phone):
            messages.error(request, "Please fill in all required traveler details.")
        elif not PHONE_RE.match(phone):
            messages.error(request, "Please enter a valid 10-digit mobile number.")
        elif not CARD_RE.match(card_number):
            messages.error(request, "Please enter a valid 16-digit card number.")
        else:
            # Always tie the booking to the logged-in account email so it
            # reliably appears on that user's dashboard (case-insensitive match).
            if request.user.is_authenticated:
                email = request.user.email
            booking = Booking.objects.create(
                full_name=full_name,
                email=(email or "").strip(),
                phone=phone
            )
            bookings = Booking.objects.all().order_by('-created_at')
            return render(request, "tours/checkout.html", {'booking': booking, 'bookings': bookings})

    return render(request, "tours/checkout.html")

# Login using Django's built-in authentication (same as admin panel)
def login_view(request):
    if request.method == "POST":
        email = (request.POST.get("email") or "").strip().lower()
        password = request.POST.get("password") or ""

        # Find the user by email or username (case-insensitive) and authenticate
        user = None
        matched_user = (
            User.objects.filter(email__iexact=email).first()
            or User.objects.filter(username__iexact=email).first()
        )
        if matched_user is not None:
            user = authenticate(request, username=matched_user.username, password=password)
        if user is None:
            user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.first_name or user.username}!")
            # Respect the "next" parameter so users return to the page they originally wanted
            next_url = request.POST.get("next") or request.GET.get("next")
            if next_url and next_url.startswith("/"):
                return redirect(next_url)
            return redirect('profile')
        else:
            messages.error(request, "Invalid email or password. Please try again or create an account.")

    return render(request, 'tours/login.html')

def signup(request):
    if request.method == "POST":
        full_name = (request.POST.get("full_name") or "").strip()
        email = (request.POST.get("email") or "").strip().lower()
        password = request.POST.get("password") or ""
        confirm = request.POST.get("confirm_password") or password

        if not (full_name and email and password and confirm):
            messages.error(request, "Please fill in all required fields.")
        elif password != confirm:
            messages.error(request, "Passwords do not match. Please try again.")
        elif User.objects.filter(username__iexact=email).exists() or User.objects.filter(email__iexact=email).exists():
            messages.error(request, "An account with this email already exists. Please sign in.")
        else:
            try:
                User.objects.create_user(username=email, email=email, password=password, first_name=full_name)
                messages.success(request, f"Account created successfully for {full_name}! Please sign in.")
                return redirect('login')
            except IntegrityError:
                messages.error(request, "An account with this email already exists. Please sign in.")

    return render(request, 'tours/signup.html')

def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('home')

@login_required
def dashboard(request):
    bookings = Booking.objects.filter(email__iexact=request.user.email).order_by('-created_at')
    return render(request, 'tours/dashboard.html', {'bookings': bookings})

def london(request):
    return render(request, 'tours/london.html')

def vtours(request):
    return render(request, 'tours/vtours.html')

@login_required
def profile(request):
    return render(request, 'tours/profile.html')



