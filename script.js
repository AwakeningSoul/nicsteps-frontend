// =========================
// PRODUCT & VARIANT DATA
// =========================
console.log("SCRIPT LOADED");

const PRODUCTS = {
  "Multicam Black": {
    price: 34.99,
    stock: 50,
    image: "images/multicam-black.png",
    variants: {
      "S/M": 15897,
      "L/XL": 15898
    }
  },
  "Dark Navy": {
    price: 34.99,
    stock: 60,
    image: "images/dark-navy.png",
    variants: {
      "S/M": 5278,
      "L/XL": 5279
    }
  },
  "Black": {
    price: 34.99,
    stock: 80,
    image: "images/black.png",
    variants: {
      "S/M": 5276,
      "L/XL": 5277
    }
  },
  "Royal Blue": {
    price: 34.99,
    stock: 50,
    image: "images/royal-blue.png",
    variants: {
      "S/M": 5286,
      "L/XL": 5287
    }
  },
  "Red": {
    price: 34.99,
    stock: 40,
    image: "images/red.png",
    variants: {
      "S/M": 5288,
      "L/XL": 5289
    }
  },
  "Olive": {
    price: 34.99,
    stock: 40,
    image: "images/olive.png",
    variants: {
      "S/M": 15901,
      "L/XL": 15902
    }
  },
  "Dark Grey": {
    price: 34.99,
    stock: 70,
    image: "images/dark-grey.png",
    variants: {
      "S/M": 5280,
      "L/XL": 5281
    }
  },
  "Khaki": {
    price: 34.99,
    stock: 50,
    image: "images/khaki.png",
    variants: {
      "S/M": 5292,
      "L/XL": 5293
    }
  },
  "White": {
    price: 34.99,
    stock: 50,
    image: "images/white.png",
    variants: {
      "S/M": 5274,
      "L/XL": 5275
    }
  }
};

// derived arrays for carousel
const CAP_PRODUCTS = Object.keys(PRODUCTS).map(name => ({
  name,
  price: PRODUCTS[name].price
}));

// mutable stock copy
const STOCK = Object.fromEntries(
  Object.entries(PRODUCTS).map(([name, data]) => [name, data.stock])
);

let cart = [];
let cartOpen = false;
let selectedProduct = null;
let selectedPrice = 0;
let currentProductIndex = 0;

// =========================
// FEATURED PRODUCT / CAROUSEL
// =========================

function setFeatured(cap) {
  const img = document.getElementById("featured-img");
  const nameEl = document.getElementById("featured-name");
  const priceEl = document.getElementById("featured-price");
  const stockEl = document.getElementById("stock-indicator");
  const btn = document.getElementById("featured-btn");

  if (!img || !nameEl || !priceEl || !stockEl || !btn) return;

  const productData = PRODUCTS[cap.name];
  if (!productData) return;

  img.src = productData.image;
  nameEl.textContent = cap.name + " Cap";
  priceEl.textContent = "£" + cap.price.toFixed(2);

  const remaining = STOCK[cap.name] ?? 0;

  stockEl.classList.remove("low-stock");

  if (remaining <= 0) {
    stockEl.textContent = "Sold Out";
    btn.disabled = true;
    btn.textContent = "Sold Out";
  } else if (remaining <= 10) {
    stockEl.textContent = `Limited: ${remaining} left`;
    stockEl.classList.add("low-stock");
    btn.disabled = false;
    btn.textContent = "Select Options";
  } else {
    stockEl.textContent = `In Stock: ${remaining}`;
    btn.disabled = false;
    btn.textContent = "Select Options";
  }

  btn.onclick = () => {
    if (STOCK[cap.name] <= 0) {
      alert("This cap is sold out.");
      return;
    }
    openOptions(cap.name, cap.price);
  };
}

function prevProduct() {
  currentProductIndex =
    (currentProductIndex - 1 + CAP_PRODUCTS.length) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function nextProduct() {
  currentProductIndex =
    (currentProductIndex + 1) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// =========================
// OPTIONS PANEL & DROPDOWNS
// =========================

function populateDropdowns() {
  const colorSelect = document.getElementById("opt-color");
  const sizeSelect = document.getElementById("opt-size");

  if (!colorSelect || !sizeSelect) return;

  colorSelect.innerHTML = "";
  sizeSelect.innerHTML = "";

  Object.keys(PRODUCTS).forEach(color => {
    const opt = document.createElement("option");
    opt.value = color;
    opt.textContent = color;
    colorSelect.appendChild(opt);
  });

  ["S/M", "L/XL"].forEach(size => {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    sizeSelect.appendChild(opt);
  });
}

function openOptions(productName, price) {
  selectedProduct = productName;
  selectedPrice = price;

  const panel = document.getElementById("options-panel");
  if (!panel) return;

  panel.style.display = "flex";
  panel.style.maxHeight = window.innerHeight * 0.9 + "px";
}

function closeOptions() {
  const panel = document.getElementById("options-panel");
  if (!panel) return;
  panel.style.display = "none";
}

function addSelected() {
  const color = document.getElementById("opt-color").value.trim();
  const size = document.getElementById("opt-size").value.trim();

  const product = PRODUCTS[color];
  if (!product) {
    alert("Colour not found.");
    return;
  }

  const variantId = product.variants[size];
  if (!variantId) {
    alert("Variant not found. Please check colour/size.");
    return;
  }

  if (STOCK[color] <= 0) {
    alert("This colour is sold out.");
    return;
  }

  const existingIndex = cart.findIndex(
    item =>
      item.name === selectedProduct &&
      item.color === color &&
      item.size === size
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      name: selectedProduct,
      color,
      size,
      variant_id: variantId,
      price: selectedPrice,
      quantity: 1
    });
  }

  STOCK[color] -= 1;
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
  closeOptions();
}

// =========================
// CART LOGIC
// =========================

function updateCart() {
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotalP = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");

  if (!cartItemsDiv || !cartTotalP || !cartCount) return;

  cartItemsDiv.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (${item.color}, ${item.size}) - £${item.price.toFixed(2)}</span>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQuantity(${index}, -1, event)">-</button>
        <span>x${item.quantity}</span>
        <button class="qty-btn" onclick="changeQuantity(${index}, 1, event)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index}, event)">✖</button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalP.textContent = `Total: £${total.toFixed(2)}`;
  cartCount.textContent = totalItems;
}

function removeFromCart(index, event) {
  event.stopPropagation();
  const item = cart[index];
  STOCK[item.color] += item.quantity;
  cart.splice(index, 1);
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function changeQuantity(index, delta, event) {
  event.stopPropagation();
  const item = cart[index];

  if (delta > 0) {
    if (STOCK[item.color] <= 0) {
      alert("No more stock for this colour.");
      return;
    }
    item.quantity += 1;
    STOCK[item.color] -= 1;
  } else {
    item.quantity -= 1;
    STOCK[item.color] += 1;
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }
  }

  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function toggleCart() {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  cartOpen = !cartOpen;
  panel.classList.toggle("open", cartOpen);
}

document.addEventListener("click", function (event) {
  const panel = document.getElementById("cart-panel");
  const cartIcon = document.querySelector(".cart-icon");

  if (!panel || !cartIcon) return;

  if (cartOpen &&
      !panel.contains(event.target) &&
      !cartIcon.contains(event.target)) {

    if (event.clientX < window.innerWidth - 80) {
      toggleCart();
    }
  }
});

// =========================
// SWIPE SUPPORT
// =========================

function initSwipe() {
  const box = document.getElementById("featured-box");
  if (!box) return;

  let startX = 0;
  let endX = 0;

  box.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  box.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        nextProduct();
      } else {
        prevProduct();
      }
    }
  });
}

// =========================
// MOBILE MENU
// =========================

function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (!menu) return;
  menu.classList.remove("open");
}
initMobileMenu();

// =========================
// IMAGE LIGHTBOX (FULLSCREEN ZOOM)
// =========================

const lightbox = document.getElementById("image-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

// Open lightbox from gallery thumbnails
function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.style.display = "flex";
}

// Close button
lightboxClose.addEventListener("click", () => {
  lightbox.style.display = "none";
});

// Click outside image closes lightbox
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.style.display = "none";
  }
});

// Also allow featured image to open fullscreen
const featuredImg = document.getElementById("featured-img");
if (featuredImg) {
  featuredImg.addEventListener("click", () => {
    openLightbox(featuredImg.src);
  });
}

// =========================
// CHECKOUT PANEL OPEN/CLOSE
// =========================

function openCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.style.display = "block";
}

function closeCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.style.display = "none";
}

// =========================
// COUNTDOWN
// =========================

function initCountdown() {
  const timerEl = document.getElementById("countdown-timer");
  if (!timerEl) return;

  // Set fixed drop end date
  const dropEnd = new Date("2026-10-31T23:59:00");

  // Update countdown
  function updateCountdown() {
    const now = new Date();
    const diff = dropEnd - now;

    if (diff <= 0) {
      timerEl.textContent = "Drop ended";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    timerEl.textContent = `${days}d ${hours}h ${minutes}m`;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);
} 

// =========================
// LOADER
// =========================

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
}

// =========================
// SMART CHECKOUT LOGIC
// =========================

function normalizeCountry(code) {
  if (!code) return "";
  let c = code.trim().toUpperCase();

  const map = {
    "UK": "GB",
    "U.K.": "GB",
    "ENGLAND": "GB",
    "SCOTLAND": "GB",
    "WALES": "GB",
    "NORTHERN IRELAND": "GB"
  };

  return map[c] || c;
}

const COUNTRIES_REQUIRE_STATE = ["US", "CA", "AU", "MX", "BR"];

function validatePostcode(country, zip) {
  const patterns = {
    GB: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    AU: /^\d{4}$/,
    BR: /^\d{8}$/,
    MX: /^\d{5}$/
  };

  if (!patterns[country]) return true;
  return patterns[country].test(zip);
}

function validateRecipient(name, address, city, zip, country, state) {
  if (!name || !address || !city || !zip || !country) {
    return "Please fill in all required fields.";
  }

  country = normalizeCountry(country);

  if (country.length !== 2) {
    return "Country code must be a 2-letter code (e.g. GB, US, DE, AE).";
  }

  if (!validatePostcode(country, zip)) {
    return `Postcode format is invalid for ${country}.`;
  }

  if (COUNTRIES_REQUIRE_STATE.includes(country) && !state) {
    return `A state/region is required for ${country}.`;
  }

  return null;
}

function startCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const name = document.getElementById("cust-name").value.trim();
  const email = document.getElementById("cust-email").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const city = document.getElementById("cust-city").value.trim();
  const state = document.getElementById("cust-state").value.trim();
  const zip = document.getElementById("cust-zip").value.trim();
  let country = document.getElementById("cust-country").value.trim();

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  country = normalizeCountry(country);

  const error = validateRecipient(name, address, city, zip, country, state);
  if (error) {
    alert(error);
    return;
  }

  const recipient = {
    name,
    email,
    address1: address,
    city,
    zip,
    country_code: country
  };

  if (state) {
    recipient.state_code = state;
  }

  const printfulItems = cart.map(item => ({
    variant_id: item.variant_id,
    quantity: item.quantity
  }));

  const stripeItems = cart.map(item => ({
  name: `${item.name} (${item.color}, ${item.size})`,
  quantity: item.quantity,
  price: item.price * 100,
  variant_id: item.variant_id   // ⭐ THIS FIXES EVERYTHING
}));

  const orderData = {
    recipient,
    items: printfulItems,
    stripeItems,
    customerEmail: email
  };

  localStorage.setItem("orderData", JSON.stringify(orderData));

  payNow(stripeItems, email);
}

async function payNow(items, customerEmail) {
  const response = await fetch("https://nicsteps-backend-production.up.railway.app/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, customerEmail })
  });

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Payment session failed.");
  }
}

// =========================
// PAGE INITIALIZATION
// =========================

window.addEventListener("load", () => {
  console.log("WINDOW LOADED");
  populateDropdowns();
  currentProductIndex = 0;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
  initSwipe();
  initMobileMenu();
 initCountdown();
  hideLoader();
});
