// =========================
// PRODUCT & VARIANT DATA
// Defines all caps, their prices, stock, images, and Printful variant IDs.
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

// Derived array for carousel (name + price only)
const CAP_PRODUCTS = Object.keys(PRODUCTS).map(name => ({
  name,
  price: PRODUCTS[name].price
}));

// Mutable stock copy so we don't mutate the original PRODUCTS
const STOCK = Object.fromEntries(
  Object.entries(PRODUCTS).map(([name, data]) => [name, data.stock])
);

// Global state variables
let cart = [];               // Holds items added to cart
let cartOpen = false;        // Tracks whether cart panel is open
let selectedProduct = null;  // Currently selected product name in options panel
let selectedPrice = 0;       // Price of selected product
let currentProductIndex = 0; // Index for featured carousel

// =========================
// FEATURED PRODUCT / CAROUSEL
// Handles the main hero cap display and navigation.
// =========================

function setFeatured(cap) {
  // Get DOM elements for featured product display
  const img = document.getElementById("featured-img");
  const nameEl = document.getElementById("featured-name");
  const priceEl = document.getElementById("featured-price");
  const stockEl = document.getElementById("stock-indicator");
  const btn = document.getElementById("featured-btn");

  if (!img || !nameEl || !priceEl || !stockEl || !btn) return;

  // Get full product data from PRODUCTS
  const productData = PRODUCTS[cap.name];
  if (!productData) return;

  // Update image, name, and price
  img.src = productData.image;
  nameEl.textContent = cap.name + " Cap";
  priceEl.textContent = "£" + cap.price.toFixed(2);

  // Check remaining stock from mutable STOCK
  const remaining = STOCK[cap.name] ?? 0;

  // Reset low-stock class
  stockEl.classList.remove("low-stock");

  // Update stock text and button state based on remaining quantity
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

  // When clicking the featured button, open options panel for this cap
  btn.onclick = () => {
    if (STOCK[cap.name] <= 0) {
      alert("This cap is sold out.");
      return;
    }
    openOptions(cap.name, cap.price);
  };
}

// Go to previous product in carousel
function prevProduct() {
  currentProductIndex =
    (currentProductIndex - 1 + CAP_PRODUCTS.length) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// Go to next product in carousel
function nextProduct() {
  currentProductIndex =
    (currentProductIndex + 1) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// =========================
// OPTIONS PANEL & DROPDOWNS
// Handles color/size selection and adding items to cart.
// =========================

function populateDropdowns() {
  // Get dropdown elements
  const colorSelect = document.getElementById("opt-color");
  const sizeSelect = document.getElementById("opt-size");

  if (!colorSelect || !sizeSelect) return;

  // Clear existing options
  colorSelect.innerHTML = "";
  sizeSelect.innerHTML = "";

  // Populate color dropdown from PRODUCTS keys
  Object.keys(PRODUCTS).forEach(color => {
    const opt = document.createElement("option");
    opt.value = color;
    opt.textContent = color;
    colorSelect.appendChild(opt);
  });

  // Populate size dropdown with fixed sizes
  ["S/M", "L/XL"].forEach(size => {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    sizeSelect.appendChild(opt);
  });
}

// Open the options panel for a given product
function openOptions(productName, price) {
  selectedProduct = productName;
  selectedPrice = price;

  const panel = document.getElementById("options-panel");
  if (!panel) return;

  panel.style.display = "flex";
  panel.style.maxHeight = window.innerHeight * 0.9 + "px";
}

// Close the options panel
function closeOptions() {
  const panel = document.getElementById("options-panel");
  if (!panel) return;
  panel.style.display = "none";
}

// Add the currently selected color/size to the cart
function addSelected() {
  // Read selected color and size from dropdowns
  const color = document.getElementById("opt-color").value.trim();
  const size = document.getElementById("opt-size").value.trim();

  // Get product data for selected color
  const product = PRODUCTS[color];
  if (!product) {
    alert("Colour not found.");
    return;
  }

  // Get Printful variant ID for selected size
  const variantId = product.variants[size];
  if (!variantId) {
    alert("Variant not found. Please check colour/size.");
    return;
  }

  // Check stock for selected color
  if (STOCK[color] <= 0) {
    alert("This colour is sold out.");
    return;
  }

  // Check if this exact item (product + color + size) is already in cart
  const existingIndex = cart.findIndex(
    item =>
      item.name === selectedProduct &&
      item.color === color &&
      item.size === size
  );

  // If exists, increment quantity; otherwise push new item
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      name: selectedProduct,
      color,
      size,
      variant_id: variantId,
      price: selectedPrice, // price in pounds
      quantity: 1
    });
  }

  // Decrease stock for this color
  STOCK[color] -= 1;

  // Refresh cart display and featured product
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);

  // Close options panel after adding
  closeOptions();
}

// =========================
// CART LOGIC
// Handles rendering cart items, quantity changes, and removal.
// =========================

function updateCart() {
  // Get DOM elements for cart display
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotalP = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");

  if (!cartItemsDiv || !cartTotalP || !cartCount) return;

  // Clear current cart items
  cartItemsDiv.innerHTML = "";
  let total = 0;       // subtotal in pounds
  let totalItems = 0;  // total quantity of items

  // Loop through cart items and build DOM elements
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

  // Set base subtotal (without tip) in cart total
  cartTotalP.textContent = `Total: £${total.toFixed(2)}`;
  cartCount.textContent = totalItems;

  // After updating cart, if a tip is selected, re-apply totals with tip
  if (typeof updateTotalsWithTip === "function") {
    updateTotalsWithTip();
  }
}

// Remove an item completely from cart
function removeFromCart(index, event) {
  event.stopPropagation();
  const item = cart[index];

  // Restore stock for this color by the quantity removed
  STOCK[item.color] += item.quantity;

  // Remove item from cart array
  cart.splice(index, 1);

  // Refresh cart and featured product
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// Change quantity of a cart item (increment or decrement)
function changeQuantity(index, delta, event) {
  event.stopPropagation();
  const item = cart[index];

  if (delta > 0) {
    // Increase quantity if stock allows
    if (STOCK[item.color] <= 0) {
      alert("No more stock for this colour.");
      return;
    }
    item.quantity += 1;
    STOCK[item.color] -= 1;
  } else {
    // Decrease quantity and restore stock
    item.quantity -= 1;
    STOCK[item.color] += 1;
    // If quantity drops to 0 or below, remove item from cart
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }
  }

  // Refresh cart and featured product
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// Toggle cart panel open/close
function toggleCart() {
  const panel = document.getElementById("cart-panel");
  if (!panel) return;
  cartOpen = !cartOpen;
  panel.classList.toggle("open", cartOpen);
}

// Close cart when clicking outside of it (except cart icon)
document.addEventListener("click", function (event) {
  const panel = document.getElementById("cart-panel");
  const cartIcon = document.querySelector(".cart-icon");

  if (!panel || !cartIcon) return;

  if (
    cartOpen &&
    !panel.contains(event.target) &&
    !cartIcon.contains(event.target)
  ) {
    // Only close if click is not near the right edge (where panel slides)
    if (event.clientX < window.innerWidth - 80) {
      toggleCart();
    }
  }
});

// =========================
// ⭐ TIP SYSTEM START
// Handles optional tip for NIC: preset buttons, custom %, and total update.
// Tip is applied to the total basket subtotal, not per item.
// =========================

// Global tip state
let tipPercent = 0;          // Selected tip percentage (e.g. 10, 15, 20)
let tipAmountInPence = 0;    // Tip amount in pence (integer)

// Get tip-related DOM elements
const tipAmountDisplay = document.getElementById("tipAmountDisplay");
const tipButtons = document.querySelectorAll(".tip-btn[data-tip]");
const customTipInput = document.getElementById("customTip");
const applyCustomTipBtn = document.getElementById("applyCustomTip");

// Helper: compute subtotal (in pounds) from cart
function getSubtotal() {
  return cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0); // prices are already in pounds
}

// Update cart total and tip display based on current tipAmountInPence
function updateTotalsWithTip() {
  const cartTotalP = document.getElementById("cart-total");
  if (!cartTotalP) return;

  const subtotal = getSubtotal();               // in pounds
  const tipAmount = tipAmountInPence / 100;     // convert pence → pounds
  const total = subtotal + tipAmount;           // total including tip

  // Update cart total to show total including tip
  cartTotalP.textContent = `Total: £${total.toFixed(2)}`;

  // Update tip amount display if element exists
  if (tipAmountDisplay) {
    tipAmountDisplay.textContent = `£${tipAmount.toFixed(2)}`;
  }
}

// Helper: set active visual state on tip buttons
function setActiveTipButton(activeBtn) {
  tipButtons.forEach(btn => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// Attach click handlers to preset tip percentage buttons
tipButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const percent = parseInt(btn.dataset.tip, 10);
    if (isNaN(percent) || percent < 0) return;

    tipPercent = percent;

    const subtotal = getSubtotal();
    const tipAmount = subtotal * (percent / 100); // tip in pounds
    tipAmountInPence = Math.round(tipAmount * 100); // convert to pence

    // Mark this button as active
    setActiveTipButton(btn);

    // Update totals with new tip
    updateTotalsWithTip();
  });
});

// Attach click handler to "Apply" button for custom tip percentage
if (applyCustomTipBtn && customTipInput) {
  applyCustomTipBtn.addEventListener("click", () => {
    const value = parseInt(customTipInput.value, 10);
    if (isNaN(value) || value <= 0) return;

    tipPercent = value;

    const subtotal = getSubtotal();
    const tipAmount = subtotal * (value / 100); // tip in pounds
    tipAmountInPence = Math.round(tipAmount * 100); // convert to pence

    // Clear active state from preset buttons (custom tip overrides)
    setActiveTipButton(null);

    // Update totals with new tip
    updateTotalsWithTip();
  });
}

// =========================
// ⭐ REMOVE TIP BUTTON
// =========================

if (removeTipBtn) {
  removeTipBtn.addEventListener("click", () => {

    // Reset tip values
    tipPercent = 0;
    tipAmountInPence = 0;

    // Clear active states on preset buttons
    setActiveTipButton(null);

    // Clear custom input
    if (customTipInput) customTipInput.value = "";

    // Reset tip display
    if (tipAmountDisplay) {
      tipAmountDisplay.textContent = "£0.00";
    }

    // Recalculate cart total WITHOUT tip
    const subtotal = getSubtotal();
    const cartTotalP = document.getElementById("cart-total");
    if (cartTotalP) {
      cartTotalP.textContent = `Total: £${subtotal.toFixed(2)}`;
    }
  });
}

// =========================
// ⭐ TIP SYSTEM END
// =========================

// =========================
// ⭐ TIP SYSTEM END
// =========================

// =========================
// PRODUCT DETAILS TOGGLE
// =========================

const infoToggleBtn = document.getElementById("infoToggleBtn");
const infoPanel = document.getElementById("infoPanel");

if (infoToggleBtn && infoPanel) {
  infoToggleBtn.addEventListener("click", () => {
    infoPanel.classList.toggle("open");

    // Change button text depending on state
    if (infoPanel.classList.contains("open")) {
      infoToggleBtn.textContent = "Hide Product Details";
    } else {
      infoToggleBtn.textContent = "Product Details";
    }
  });
}

// =========================
// TAP OUTSIDE TO CLOSE PANEL
// =========================

document.addEventListener("click", (e) => {
  if (!infoPanel.contains(e.target) && !infoToggleBtn.contains(e.target)) {
    if (infoPanel.classList.contains("open")) {
      infoPanel.classList.remove("open");
      infoToggleBtn.textContent = "Product Details";
    }
  }
});

// =========================
// SWIPE SUPPORT
// Enables swipe left/right on mobile to change featured product.
// =========================

function initSwipe() {
  const box = document.getElementById("featured-box");
  if (!box) return;

  let startX = 0;
  let endX = 0;

  // Record starting touch position
  box.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  // On touch end, compare positions to detect swipe
  box.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    // Only trigger if swipe distance is significant
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
// Handles opening/closing the mobile navigation menu.
// =========================

function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!toggle || !menu) return;

  // Toggle menu open/close on button click
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

// Close mobile menu (used when navigating or clicking outside)
function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (!menu) return;
  menu.classList.remove("open");
}

// Run mobile menu init only after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
});

// =========================
// IMAGE LIGHTBOX (FULLSCREEN ZOOM)
// Allows clicking images to view them fullscreen.
// =========================

const lightbox = document.getElementById("image-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

// Open lightbox with given image source
function openLightbox(src) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightbox.style.display = "flex";
}

// Close button for lightbox
if (lightboxClose && lightbox) {
  lightboxClose.addEventListener("click", () => {
    lightbox.style.display = "none";
  });
}

// Clicking outside the image closes the lightbox
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });
}

// Allow featured image to open fullscreen on click
const featuredImg = document.getElementById("featured-img");
if (featuredImg) {
  featuredImg.addEventListener("click", () => {
    openLightbox(featuredImg.src);
  });
}

// =========================
// CHECKOUT PANEL OPEN/CLOSE
// Shows/hides the checkout form overlay.
// =========================

function openCheckout() {
  // Prevent checkout if cart is empty
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
// Displays time remaining until drop end.
// =========================

function initCountdown() {
  const timerEl = document.getElementById("countdown-timer");
  if (!timerEl) return;

  // Set fixed drop end date
  const dropEnd = new Date("2026-10-31T23:59:00");

  // Update countdown text
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

  // Initial call and then update every minute
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

// =========================
// LOADER
// Fades out and hides the loader once page is ready.
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
// Validates recipient details, builds Printful + Stripe payloads,
// stores orderData in localStorage, and starts payment.
// =========================

// Normalize country codes and common UK variants
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

// Countries that require a state/region field
const COUNTRIES_REQUIRE_STATE = ["US", "CA", "AU", "MX", "BR"];

// Validate postcode format based on country
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

// Validate recipient fields and return error message or null
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

// Main checkout function called by "Pay Now" button
function startCheckout() {
  // Prevent checkout if cart is empty
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Read customer details from checkout form
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

  // Normalize country code
  country = normalizeCountry(country);

  // Validate recipient fields
  const error = validateRecipient(name, address, city, zip, country, state);
  if (error) {
    alert(error);
    return;
  }

  // Build recipient object for Printful / backend
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

  // Build Printful items (variant_id + quantity)
  const printfulItems = cart.map(item => ({
    variant_id: item.variant_id,
    quantity: item.quantity
  }));

  // Build Stripe items (name, quantity, price in pence, variant_id)
  const stripeItems = cart.map(item => ({
    name: `${item.name} - ${item.color} - ${item.size}`,  // ⭐ CLEAN NAME
    quantity: item.quantity,
    price: Math.round(item.price * 100),
    variant_id: item.variant_id
}));

  // Build orderData for localStorage (used for confirmation page, etc.)
  const orderData = {
    recipient,
    items: printfulItems,
    stripeItems,
    customerEmail: email
    // Tip is handled separately in Stripe; not stored here intentionally.
  };

  // Store orderData locally
  localStorage.setItem("orderData", JSON.stringify(orderData));

  // Start payment with Stripe items and customer email
console.log("STRIPE ITEMS SENT TO BACKEND:", stripeItems);
payNow(stripeItems, email);
}

// Call backend to create Stripe checkout session
async function payNow(items, customerEmail) {
  try {
    const response = await fetch("https://nicsteps-backend-production.up.railway.app/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customerEmail,
        tipAmount: tipAmountInPence // send tip in pence to backend
      })
    });

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } else {
      alert("Payment session failed.");
    }
  } catch (err) {
    console.error("Error creating checkout session:", err);
    alert("Something went wrong while starting payment.");
  }
}

// =========================
// PAGE INITIALIZATION
// Runs once when window finishes loading.
// Sets up dropdowns, featured product, swipe, countdown, and loader.
// =========================

window.addEventListener("load", () => {
  console.log("WINDOW LOADED");

  // Populate color/size dropdowns
  populateDropdowns();

  // Initialize featured product carousel
  currentProductIndex = 0;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);

  // Enable swipe navigation on mobile
  initSwipe();

  // Start drop countdown timer
  initCountdown();

  // Hide loader overlay
  hideLoader();
});
