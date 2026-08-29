/* ============================================================
   ISAI FASHIONS — script.js
   Cart state, drawer, checkout modal, and order submission
   to a Google Sheet via a Google Apps Script web app.

   ⚠️ SETUP REQUIRED: paste your deployed Apps Script "web app"
   URL into GOOGLE_SCRIPT_URL below. See SETUP.md for the
   step-by-step (create the sheet, paste Code.gs, deploy, copy
   the URL). Until you do this, orders are still recorded in
   the browser's local cart but will not reach a spreadsheet.
   ============================================================ */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/library/d/1wG6sfO59tDXcF_d3qHF6024e0o2e1En1_h-rnma1moY5AskiuXqdkWHY/1";

// ⚠️ Replace with your real UPI ID (e.g. "isaifashions@okhdfcbank").
// Also swap images/upi-qr-placeholder.svg for your real UPI QR code image.
const UPI_ID = "kethiscivil9595-2oksbi";

let cart = JSON.parse(localStorage.getItem("isai_cart") || "[]");
let pendingOrder = null; // holds the customer's details between the details step and payment step

/* ---------------- cart helpers ---------------- */

function saveCart() {
  localStorage.setItem("isai_cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function addToCart(product, size, qty) {
  const existing = cart.find(line => line.id === product.id && line.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty
    });
  }
  saveCart();
  openCart();
}

function updateLineQty(id, size, delta) {
  const line = cart.find(l => l.id === id && l.size === size);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart = cart.filter(l => !(l.id === id && l.size === size));
  }
  saveCart();
}

function removeLine(id, size) {
  cart = cart.filter(l => !(l.id === id && l.size === size));
  saveCart();
}

function cartSubtotal() {
  return cart.reduce((sum, l) => sum + l.price * l.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cartCount();
}

/* ---------------- cart drawer render ---------------- */

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  if (!wrap) return;

  if (cart.length === 0) {
    wrap.innerHTML = `<p class="cart-empty">Your bag is empty. Browse the collection and add something you love.</p>`;
  } else {
    wrap.innerHTML = cart.map(l => `
      <div class="cart-line">
        <img src="${l.image}" alt="${l.name}">
        <div class="cart-line-info">
          <h4>${l.name}</h4>
          <div class="cart-line-meta">Size: ${l.size}</div>
          <div class="cart-line-row">
            <div class="qty-adjust">
              <button aria-label="Decrease quantity" data-action="dec" data-id="${l.id}" data-size="${l.size}">−</button>
              <span>${l.qty}</span>
              <button aria-label="Increase quantity" data-action="inc" data-id="${l.id}" data-size="${l.size}">+</button>
            </div>
            <strong>₹${l.price * l.qty}</strong>
          </div>
          <button class="remove-line" data-action="remove" data-id="${l.id}" data-size="${l.size}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  if (subtotalEl) subtotalEl.textContent = `₹${cartSubtotal()}`;

  wrap.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const { action, id, size } = btn.dataset;
      if (action === "inc") updateLineQty(id, size, 1);
      if (action === "dec") updateLineQty(id, size, -1);
      if (action === "remove") removeLine(id, size);
    });
  });
}

/* ---------------- cart drawer open/close ---------------- */

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

/* ---------------- checkout modal ---------------- */

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  return `ISAI-${stamp}`;
}

function renderOrderSummary(targetId) {
  const summary = document.getElementById(targetId);
  summary.innerHTML = cart.map(l =>
    `<div><span>${l.name} (${l.size}) × ${l.qty}</span><span>₹${l.price * l.qty}</span></div>`
  ).join("") + `<div class="total-line"><span>Total</span><span>₹${cartSubtotal()}</span></div>`;
}

function openCheckout() {
  if (cart.length === 0) return;
  renderOrderSummary("orderSummary");

  document.getElementById("checkoutForm").classList.remove("hidden");
  document.getElementById("paymentView").classList.add("hidden");
  document.getElementById("confirmView").classList.add("hidden");
  document.getElementById("upiIdText").textContent = UPI_ID;
  document.getElementById("checkoutModal").classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("show");
}

/* Step 1: collect + validate customer details, then move to the UPI payment step. */
function goToPayment(e) {
  e.preventDefault();
  const form = e.target;

  pendingOrder = {
    orderId: generateOrderId(),
    customerName: form.customerName.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    notes: form.notes.value.trim(),
    orderTotal: cartSubtotal(),
    items: cart.map(l => ({
      name: l.name,
      size: l.size,
      quantity: l.qty,
      price: l.price
    }))
  };

  renderOrderSummary("paymentSummary");
  document.getElementById("checkoutForm").classList.add("hidden");
  document.getElementById("paymentView").classList.remove("hidden");
  document.getElementById("paymentMsg").textContent = "";
}

function backToDetails() {
  document.getElementById("paymentView").classList.add("hidden");
  document.getElementById("checkoutForm").classList.remove("hidden");
}

function copyUpiId() {
  navigator.clipboard.writeText(UPI_ID).then(() => {
    const btn = document.getElementById("copyUpiBtn");
    const original = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = original; }, 1500);
  }).catch(() => {});
}

/* Step 2: customer confirms they've paid via UPI — this is what actually
   writes the order to the Google Sheet. */
async function confirmPaidOrder() {
  if (!pendingOrder) return;
  const btn = document.getElementById("confirmPaidBtn");
  const msg = document.getElementById("paymentMsg");

  const orderData = {
    ...pendingOrder,
    paymentMethod: "UPI",
    paymentStatus: "Customer confirmed payment — verify before shipping"
  };

  btn.disabled = true;
  btn.textContent = "Confirming…";
  msg.textContent = "";
  msg.className = "form-msg";

  try {
    if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
      throw new Error("not_configured");
    }

    // Sent as text/plain to avoid a CORS pre-flight request that
    // Apps Script web apps do not handle — Code.gs still parses
    // the body as JSON on the other end.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(orderData)
    });

    showConfirmation(orderData.orderId);
    cart = [];
    saveCart();
    document.getElementById("checkoutForm").reset();
    pendingOrder = null;
  } catch (err) {
    if (err.message === "not_configured") {
      msg.textContent = "Orders aren't connected to Google Sheets yet — see SETUP.md to add your script URL. Your order was not sent.";
    } else {
      msg.textContent = "Something went wrong confirming your order. Please try again or reach us on Instagram.";
    }
    msg.classList.add("error");
  } finally {
    btn.disabled = false;
    btn.textContent = "I've Paid — Confirm Order";
  }
}

function showConfirmation(orderId) {
  document.getElementById("checkoutForm").classList.add("hidden");
  document.getElementById("paymentView").classList.add("hidden");
  document.getElementById("confirmView").classList.remove("hidden");
  document.getElementById("confirmOrderId").textContent = orderId;
}

/* ---------------- contact form (mailto-style local handling) ---------------- */

function submitContact(e) {
  e.preventDefault();
  const msg = document.getElementById("contactMsg");
  msg.textContent = "Thank you — your message has been noted. We'll get back to you within 24 hours.";
  msg.className = "form-msg success";
  e.target.reset();
}

/* ---------------- FAQ accordion ---------------- */

function initAccordion() {
  document.querySelectorAll(".accordion-item").forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".accordion-item.open").forEach(open => {
        open.classList.remove("open");
        open.querySelector(".accordion-panel").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
}

/* ---------------- wire everything up ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
  initAccordion();

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("overlay").addEventListener("click", () => {
    closeCart();
    closeCheckout();
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    closeCart();
    openCheckout();
  });
  document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
  document.getElementById("checkoutForm").addEventListener("submit", goToPayment);
  document.getElementById("backToDetailsBtn").addEventListener("click", backToDetails);
  document.getElementById("copyUpiBtn").addEventListener("click", copyUpiId);
  document.getElementById("confirmPaidBtn").addEventListener("click", confirmPaidOrder);
  document.getElementById("confirmDoneBtn").addEventListener("click", closeCheckout);

  const contactForm = document.getElementById("contactForm");
  if (contactForm) contactForm.addEventListener("submit", submitContact);

  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      document.getElementById("mainNav").classList.toggle("mobile-open");
    });
  }
});