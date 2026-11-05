/* NICSTEPS storefront. Shared by index.html and collection.html. */
// Local testing: serve the frontend on http://localhost:5500 and the API on :3000.
// Live deployment continues to use the Railway API unless explicitly overridden.
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];
const API_BASE = window.NICSTEPS_API_BASE ||
  (LOCAL_HOSTS.includes(window.location.hostname)
    ? "http://localhost:3000"
    : "https://nicsteps-backend-production.up.railway.app");
const CART_KEY = "nicstepsBasketV2";
const TIP_KEY = "nicstepsTipPercent";
let cart = loadCart().filter(item => item.productId !== "cap");
localStorage.setItem(CART_KEY, JSON.stringify(cart));
let selectedProduct = null;
let tipPercent = Number(localStorage.getItem(TIP_KEY) || 0);
let cartOpen = false;

function loadCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}
function money(value) { return `£${Number(value || 0).toFixed(2)}`; }
function getProduct(id) {
  return window.NICSTEPS_PRODUCTS.find(p => p.id === id && p.id !== "cap");
}
function getVariant(product, color, size) {
  return product?.colors?.[color]?.sizes?.[size] || null;
}
function getImage(product, color) {
  return product?.colors?.[color]?.image || Object.values(product.colors)[0].image;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function productCard(product) {
  const firstColor = Object.keys(product.colors)[0];
  const image = getImage(product, firstColor);
  const label = product.featured ? "LIMITED DROP" : product.category.toUpperCase();

  const details = product.description ? `
    <details class="product-details">
      <summary>ⓘ Product details</summary>
      <div class="product-details-content">
        <p>${escapeHtml(product.description.intro)}</p>
        <h4>Product features</h4>
        <ul>
          ${product.description.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
        </ul>
        ${product.description.disclaimer ? `
          <h4>Important information</h4>
          <p>${escapeHtml(product.description.disclaimer)}</p>
        ` : ""}
        ${product.description.additionalInfo ? `
  <h4>About the organic cotton</h4>
  <p>${escapeHtml(product.description.additionalInfo)}</p>
` : ""}
      </div>
    </details>
  ` : "";

  return `<article class="product-card">
    <button class="product-image-button" type="button" onclick="openProductModal('${product.id}')">
      <img src="${image}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.closest('.product-image-button').classList.add('image-missing')">
      <span class="image-label">${label}</span><span class="quick-add">Quick view ↗</span>
    </button>
    <div class="product-card-meta"><div><p class="product-category">${escapeHtml(product.category)}</p><h3>${escapeHtml(product.name)}</h3></div><strong>${money(product.price)}</strong></div>
    ${details}
    <button class="card-add" type="button" onclick="openProductModal('${product.id}')">Choose options <span>＋</span></button>
  </article>`;
}

function renderFeatured() {
  const el = document.getElementById("featured-products");
  if (!el) return;
  el.innerHTML = window.NICSTEPS_PRODUCTS
  .filter(p => p.featured && p.id !== "cap")
  .map(productCard).join("");
}
function renderCollection(filter = "All") {
  const el = document.getElementById("collection-products");
  if (!el) return;
  const items = window.NICSTEPS_PRODUCTS.filter(
  p => p.id !== "cap" && (filter === "All" || p.category === filter)
);
  el.innerHTML = items.map(productCard).join("");
  const count = document.getElementById("product-count-label");
  if (count) count.textContent = `${items.length} PRODUCTS`;
}
function openProductModal(productId) {
  const product = getProduct(productId);
  if (!product) return;
  selectedProduct = product;
  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-price").textContent = money(product.price);
  const colorSelect = document.getElementById("opt-color");
  colorSelect.innerHTML = Object.keys(product.colors).map(color => `<option value="${escapeHtml(color)}">${escapeHtml(color)}</option>`).join("");
  updateSizeOptions();
  updateModalImage();
  document.getElementById("product-modal").classList.add("open");
  document.getElementById("overlay").classList.add("visible");
}
function updateSizeOptions() {
  if (!selectedProduct) return;
  const color = document.getElementById("opt-color").value;
  const sizes = Object.keys(selectedProduct.colors[color].sizes);
  document.getElementById("opt-size").innerHTML = sizes.map(size => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("");
}
function updateModalImage() {
  if (!selectedProduct) return;
  const color = document.getElementById("opt-color").value;
  const img = document.getElementById("modal-image");
  img.src = getImage(selectedProduct, color);
  img.alt = `${selectedProduct.name} — ${color}`;
}
function closeProductModal() {
  document.getElementById("product-modal")?.classList.remove("open");
  if (!cartOpen && !document.getElementById("checkout-form")?.classList.contains("open")) document.getElementById("overlay")?.classList.remove("visible");
}
function addSelected() {
  if (!selectedProduct) return;
  const color = document.getElementById("opt-color").value;
  const size = document.getElementById("opt-size").value;
  const variantId = getVariant(selectedProduct, color, size);
  if (!variantId) { alert("That option is currently unavailable. Please choose another."); return; }
  const key = `${selectedProduct.id}:${variantId}`;
  const existing = cart.find(item => item.key === key);
  if (existing) existing.quantity += 1;
  else cart.push({ key, productId: selectedProduct.id, name: selectedProduct.name, color, size, variantId, price: selectedProduct.price, image: getImage(selectedProduct, color), quantity: 1 });
  saveCart();
  closeProductModal();
  toggleCart(true);
}
function subtotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }
function tipAmount() { return Math.round(subtotal() * tipPercent) / 100; }
function renderCart() {
  const list = document.getElementById("cart-items");
  const count = document.getElementById("cart-count");
  if (!list || !count) return;
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  count.textContent = quantity;
  if (!cart.length) list.innerHTML = '<p class="empty-state">Your basket is waiting for its first find.</p>';
  else list.innerHTML = cart.map((item, index) => `<div class="cart-line">
    <img src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.style.visibility='hidden'">
    <div class="cart-line-info"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.color)} · ${escapeHtml(item.size)}</small><div class="quantity-control"><button onclick="changeQuantity(${index},-1)" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button onclick="changeQuantity(${index},1)" aria-label="Increase quantity">＋</button></div></div>
    <div class="cart-line-end"><strong>${money(item.price * item.quantity)}</strong><button class="remove-line" onclick="removeItem(${index})">Remove</button></div>
  </div>`).join("");
  const tip = tipAmount();
  document.getElementById("tipAmountDisplay").textContent = money(tip);
  document.getElementById("cart-total").textContent = money(subtotal() + tip);
  document.querySelectorAll(".tip-btn[data-tip]").forEach(btn => btn.classList.toggle("active", Number(btn.dataset.tip) === tipPercent));
}
function changeQuantity(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
}
function removeItem(index) { cart.splice(index, 1); saveCart(); }
function toggleCart(forceOpen) {
  const drawer = document.getElementById("cart-panel");
  if (!drawer) return;
  cartOpen = typeof forceOpen === "boolean" ? forceOpen : !cartOpen;
  drawer.classList.toggle("open", cartOpen);
  document.getElementById("overlay")?.classList.toggle("visible", cartOpen || document.getElementById("product-modal")?.classList.contains("open") || document.getElementById("checkout-form")?.classList.contains("open"));
}
function closePanels() {
  cartOpen = false;
  document.getElementById("cart-panel")?.classList.remove("open");
  document.getElementById("product-modal")?.classList.remove("open");
  document.getElementById("checkout-form")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("visible");
}
function setTip(percent) {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
  tipPercent = percent;
  localStorage.setItem(TIP_KEY, String(percent));
  renderCart();
}
function openCheckout() {
  if (!cart.length) { alert("Your basket is empty."); return; }
  if (cart.some(item => item.productId === "cap")) {
  alert("Caps are not available in this collection.");
  return;
}
  if (cart.some(item => item.productId === "cap")) {
  alert("Caps are not available in this collection.");
  return;
}
  cartOpen = false;
  document.getElementById("cart-panel")?.classList.remove("open");
  document.getElementById("checkout-form")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("visible");
}
function closeCheckout() {
  document.getElementById("checkout-form")?.classList.remove("open");
  document.getElementById("overlay")?.classList.toggle("visible", cartOpen);
}
async function startCheckout() {
  if (!cart.length) { alert("Your basket is empty."); return; }
  const emailInput = document.getElementById("cust-email");
  const email = emailInput.value.trim();
  if (!emailInput.checkValidity()) { emailInput.reportValidity(); return; }
  const items = cart
  .filter(item => item.productId !== "cap")
  .map(item => ({ variantId: item.variantId, quantity: item.quantity }));
  const tipAmountInPence = Math.round(tipAmount() * 100);
  const button = document.querySelector("#checkout-form .button");
  button.disabled = true;
  button.textContent = "Preparing secure checkout…";
  try {
    let response;
    try {
      response = await fetch(`${API_BASE}/create-checkout-session`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customerEmail: email, tipAmount: tipAmountInPence })
      });
    } catch (networkError) {
      throw new Error(`Cannot reach the NICSTEPS backend at ${API_BASE}. Start the backend in its own terminal with npm run dev, then refresh this page. For local testing, open the site from http://localhost:5500 (not by double-clicking the HTML file).`);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.error || "Unable to start checkout.");
    window.location.assign(data.url);
  } catch (error) {
    console.error(error);
    alert(error.message || "Something went wrong while starting payment. Please try again.");
    button.disabled = false;
    button.textContent = "Continue to payment →";
  }
}
function initFilters() {
  document.querySelectorAll(".filter-tab").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(other => other.classList.remove("active"));
    btn.classList.add("active");
    renderCollection(btn.dataset.filter);
  }));
}
function initTipControls() {
  document.querySelectorAll(".tip-btn[data-tip]").forEach(btn => btn.addEventListener("click", () => setTip(Number(btn.dataset.tip))));
  document.getElementById("applyCustomTip")?.addEventListener("click", () => {
    const value = Number(document.getElementById("customTip").value);
    if (!Number.isInteger(value) || value < 1 || value > 100) { alert("Enter a whole percentage between 1 and 100."); return; }
    setTip(value);
  });
  document.getElementById("removeTipBtn")?.addEventListener("click", () => {
    setTip(0);
    const custom = document.getElementById("customTip"); if (custom) custom.value = "";
  });
}
function initMobileMenu() {
  const button = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  button?.addEventListener("click", () => menu?.classList.toggle("open"));
}
document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  renderCollection();
  renderCart();
  initFilters();
  initTipControls();
  initMobileMenu();
  document.getElementById("opt-color")?.addEventListener("change", () => { updateSizeOptions(); updateModalImage(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closePanels(); });
});
/* NICSTEPS — NIC20 limited-time promotion */

// Offer ends 8 November 2026 at 11:59 PM GMT.
// The end time is exclusive.
const NIC20_END = Date.parse("2026-11-08T23:59:00Z");

function updateNic20Promotion() {
  const banner = document.getElementById("nic20-promo");
  if (!banner) return;

  banner.hidden = Date.now() >= NIC20_END;
}

async function copyNic20(button) {
  try {
    await navigator.clipboard.writeText("NIC20");

    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Copy code";
    }, 2000);
  } catch (error) {
    // Manual fallback if clipboard access is unavailable.
    window.prompt("Copy your discount code:", "NIC20");
  }
}

updateNic20Promotion();

// Recheck periodically and when visitors return to the tab.
setInterval(updateNic20Promotion, 30000);
document.addEventListener(
  "visibilitychange",
  updateNic20Promotion
);

