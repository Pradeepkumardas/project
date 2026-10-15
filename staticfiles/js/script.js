const products = [
    { id: "indonesia", name: "Bali, Indonesia", type: "5 Days / 4 Nights", price: 80000, image: "bali.jpg" },
    { id: "sri-lanka", name: "Sri Lanka", type: "5 Days / 4 Nights", price: 60000, image: "Sri-Lanka.avif" },
    { id: "hongkong", name: "Hong Kong", type: "5 Days / 4 Nights", price: 130000, image: "hongkong.webp" },
    { id: "thailand", name: "Thailand", type: "4 Days / 3 Nights", price: 100000, image: "thailand 1.jpg" },
    { id: "dubai", name: "Dubai Desert Safari", type: "5 Days / 4 Nights", price: 25000, image: "dubai.avif" },
    { id: "singapore", name: "Singapore", type: "5 Days / 4 Nights", price: 120000, image: "singapore.webp" },
    { id: "london", name: "London", type: "5 Days / 4 Nights", price: 59900, image: "london.jpg" },
    { id: "paris", name: "Paris Romance", type: "5 Days / 4 Nights", price: 200000, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900" },
    { id: "switzerland", name: "Switzerland", type: "5 Days / 4 Nights", price: 325000, image: "switzerland.webp" },
    { id: "puri", name: "Puri Beach, India", type: "3 Days / 2 Nights", price: 15000, image: "puri.avif" },
    { id: "bangkok", name: "Bangkok City Escape", type: "4 Days / 3 Nights", price: 95000, image: "thailand 1.jpg" },
    { id: "bali-east", name: "Bali East Coast Retreat", type: "5 Days / 4 Nights", price: 85000, image: "bali.jpg" }
];

const hotels = [
    { id: "ocean-vista", name: "Ocean Vista Beach Resort", place: "Bali", price: 12500, rating: "4.8", image: "bali.jpg" },
    { id: "marina-skyline", name: "Marina Skyline Grand", place: "Dubai", price: 9800, rating: "4.7", image: "dubai.avif" },
    { id: "harbour-lights", name: "Harbour Lights Hotel", place: "Hong Kong", price: 14200, rating: "4.6", image: "hongkong.webp" },
    { id: "garden-bay", name: "Garden Bay City Suites", place: "Singapore", price: 11800, rating: "4.8", image: "singapore.webp" },
    { id: "alpine-crest", name: "Alpine Crest Mountain Lodge", place: "Switzerland", price: 18500, rating: "4.9", image: "switzerland.webp" },
    { id: "royal-thames", name: "Royal Thames Heritage Hotel", place: "London", price: 13200, rating: "4.7", image: "london.jpg" }
];

// Build the correct static path for images. Full external URLs pass through.
const imgSrc = path => path.startsWith("http") ? path : "/static/images/" + encodeURI(path);
// Scroll-reveal observer: fades/slides elements in as they enter the viewport.
let revealObserver = null;
if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
}

function setupReveal(scope = document) {
    if (!document.body.classList.contains("js-enabled")) return;
    const elements = scope.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-zoom");
    elements.forEach(el => {
        if (el.dataset.revealSeen) return;
        el.dataset.revealSeen = "1";
        if (revealObserver) {
            revealObserver.observe(el);
        } else {
            el.classList.add("revealed");
        }
    });
}

// Combined catalog (tours + hotels) used by the cart so hotels can be added too.
const catalog = [
    ...products,
    ...hotels.map(h => ({ id: "hotel-" + h.id, name: h.name, type: h.place + " · Hotel / night", price: h.price, image: h.image }))
];

const cart = () => JSON.parse(localStorage.getItem("tripmitraCart") || "[]");
const cash = number => "Rs. " + number.toLocaleString("en-IN");

function save(nextCart) {
    localStorage.setItem("tripmitraCart", JSON.stringify(nextCart));
    count();
}

function count() {
    document.querySelectorAll(".cart-count").forEach(item => {
        item.textContent = cart().reduce((sum, tour) => sum + tour.qty, 0);
    });
}

function toast(message) {
    const toastElement = document.querySelector("#siteToast");
    if (!toastElement || !window.bootstrap) return;
    toastElement.querySelector(".toast-body").textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

function add(id) {
    const nextCart = cart();
    const existing = nextCart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        nextCart.push({ id, qty: 1 });
    }
    save(nextCart);
    toast("Added to cart");
}

function productCard(product, index = 0) {
    return `<div class="col-md-6 col-lg-4">
        <div class="card product reveal-up" style="--reveal-delay:${(index % 3) * 0.12}s">
            <img src="${imgSrc(product.image)}" alt="${product.name}">
            <div class="card-body">
                <div class="type">${product.type}</div>
                <h5 class="mt-2">${product.name}</h5>
                <div class="d-flex justify-content-between align-items-center gap-3 mt-3">
                    <b class="price">${cash(product.price)}</b>
                    <button class="btn btn-brand btn-sm" onclick="add('${product.id}')">Add to cart</button>
                </div>
            </div>
        </div>
    </div>`;
}

function render(id, limit) {
    const element = document.getElementById(id);
    if (!element) return;
    const params = new URLSearchParams(window.location.search);
    const destination = params.get("destination");
    const list = destination ? products.filter(product => product.id === destination) : products;
    element.innerHTML = list.length ? list.slice(0, limit || list.length).map((product, i) => productCard(product, i)).join("") : `<div class="col-12"><div class="summary text-center"><h5>No exact package found</h5><p class="text-secondary mb-3">Browse all packages or search another place.</p><a class="btn btn-brand" href="/tours/">View all tours</a></div></div>`;
}

function renderDestinations() {
    const element = document.getElementById("destinationGrid");
    if (!element) return;
    element.innerHTML = hotels.map((hotel, i) => {
        const product = products.find(product => product.name.includes(hotel.place) || product.name === hotel.place);
        return `<div class="col-md-6 col-lg-4">
        <a class="destination-card d-block reveal-up" style="--reveal-delay:${(i % 3) * 0.12}s" href="/tours/?destination=${product?.id || ""}">
            <img src="${imgSrc(hotel.image)}" alt="${hotel.name}" loading="lazy">
            <div class="card-body">
                <div class="type">${hotel.place}</div>
                <h5 class="mt-2 mb-1">${hotel.name}</h5>
                <p class="text-secondary mb-0">${cash(hotel.price)} / night - Rating ${hotel.rating}</p>
            </div>
        </a>
    </div>`;
    }).join("");
}

function hotelCard(hotel, index = 0) {
    return `<div class="col-md-6 col-xl-4">
        <div class="hotel-card reveal-up" style="--reveal-delay:${(index % 3) * 0.12}s">
            <img src="${imgSrc(hotel.image)}" alt="${hotel.name}" loading="lazy">
            <div class="hotel-body">
                <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                        <div class="type">${hotel.place}</div>
                        <h5>${hotel.name}</h5>
                    </div>
                    <span class="hotel-rating"><i class="bi bi-star-fill"></i> ${hotel.rating}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="price">${cash(hotel.price)} / night</span>
                    <button class="btn btn-brand btn-sm" onclick="add('hotel-${hotel.id}')"><i class="bi bi-cart-plus me-1"></i>Add to cart</button>
                </div>
            </div>
        </div>
    </div>`;
}

function renderHotels() {
    const element = document.getElementById("hotelGrid");
    if (!element) return;
    element.innerHTML = hotels.map((hotel, i) => hotelCard(hotel, i)).join("");
}

function bindTravelSearch() {
    if (!document.getElementById("placeOptions")) {
        const dataList = document.createElement("datalist");
        dataList.id = "placeOptions";
        dataList.innerHTML = products.map(product => `<option value="${product.name}"></option>`).join("");
        document.body.appendChild(dataList);
    }

    const placeMap = products.reduce((map, product) => {
        map[product.id] = product.id;
        map[product.name.toLowerCase()] = product.id;
        product.name.toLowerCase().split(",").forEach(part => { map[part.trim()] = product.id; });
        return map;
    }, {});

    document.querySelectorAll(".travel-search").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            const typedPlace = form.querySelector("[name='destination']")?.value.trim().toLowerCase();
            const destination = placeMap[typedPlace] || typedPlace;
            window.location.href = destination ? `/tours/?destination=${encodeURIComponent(destination)}` : "/tours/";
        });
    });
}

function summary() {
    const element = document.getElementById("orderSummary");
    if (!element) return;
    const subtotal = cart().reduce((sum, item) => {
        const product = catalog.find(product => product.id === item.id);
        return product ? sum + product.price * item.qty : sum;
    }, 0);
    const fee = subtotal ? 399 : 0;
    element.innerHTML = `<h5>Order summary</h5>
        <div class="d-flex justify-content-between mt-3"><span>Items</span><span>${cash(subtotal)}</span></div>
        <div class="d-flex justify-content-between my-2"><span>Service fee</span><span>${cash(fee)}</span></div>
        <hr>
        <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${cash(subtotal + fee)}</span></div>`;
    const checkoutButton = document.getElementById("checkoutBtn");
    if (checkoutButton) checkoutButton.classList.toggle("disabled", !subtotal);
}

function renderCart() {
    const element = document.getElementById("cartItems");
    if (!element) return;
    const currentCart = cart();
    element.innerHTML = currentCart.length ? currentCart.map(item => {
        const product = catalog.find(product => product.id === item.id);
        if (!product) return "";
        return `<div class="cart-item d-flex gap-3 py-3 border-bottom">
            <img src="${imgSrc(product.image)}" alt="${product.name}">
            <div class="flex-grow-1">
                <h6>${product.name}</h6>
                <small class="text-secondary">${product.type}</small>
                <div class="qty d-flex gap-2 align-items-center mt-2">
                    <button onclick="change('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                    <b>${item.qty}</b>
                    <button onclick="change('${item.id}', 1)" aria-label="Increase quantity">+</button>
                    <button class="btn btn-link text-danger p-0 ms-2" onclick="removeItem('${item.id}')">Remove</button>
                </div>
            </div>
            <b>${cash(product.price * item.qty)}</b>
        </div>`;
    }).join("") : `<div class="text-center py-5"><h5>Your cart is empty</h5><a class="btn btn-brand mt-2" href="/tours/">Explore tours</a></div>`;
    summary();
}

function change(id, amount) {
    let nextCart = cart();
    const item = nextCart.find(cartItem => cartItem.id === id);
    if (!item) return;
    item.qty += amount;
    if (item.qty < 1) nextCart = nextCart.filter(cartItem => cartItem.id !== id);
    save(nextCart);
    renderCart();
}

function removeItem(id) {
    save(cart().filter(item => item.id !== id));
    renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");
    count();
    render("productGrid");
    render("featuredProducts", 6);
    renderDestinations();
    renderHotels();
    renderCart();
    summary();
    bindTravelSearch();
    setupReveal();
});

// Auth pages: show / hide password toggles (login & signup)
document.querySelectorAll(".auth-pw-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        const icon = btn.querySelector("i");
        if (icon) icon.className = show ? "bi bi-eye-slash" : "bi bi-eye";
    });
});
