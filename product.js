/* ============================================================
   ISAI FASHIONS — product.js
   Product catalogue + rendering of the product grid.
   Replace the "image" paths with your own photos in /images —
   the .svg placeholders are just there so the site looks right
   the first time you open it.
   ============================================================ */

const PRODUCTS = [
  {
    id: "IF-001",
    name: "Kalamkari Hand-Painted Saree",
    category: "Sarees",
    price: 2450,
    compareAt: 2900,
    image: "images/product-1.svg",
    sizes: ["Free Size"],
    tag: "Bestseller",
    description: "Hand block-painted Kalamkari saree in earthy vegetable dyes, with an unstitched blouse piece."
  },
  {
    id: "IF-002",
    name: "Pure Cotton Kurta Set",
    category: "Kurta Sets",
    price: 1650,
    compareAt: null,
    image: "images/product-2.svg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    tag: "New",
    description: "Breathable handloom cotton kurta with matching pants, straight-cut and everyday easy."
  },
  {
    id: "IF-003",
    name: "3-Piece Ethnic Suit Set",
    category: "3-Piece Sets",
    price: 2999,
    compareAt: 3450,
    image: "images/product-3.svg",
    sizes: ["S", "M", "L", "XL"],
    tag: "Bestseller",
    description: "Kurta, palazzo and dupatta in a coordinated 3-piece set — ready to wear for festive days."
  },
  {
    id: "IF-004",
    name: "Block Print Cotton Dupatta",
    category: "Dupattas",
    price: 690,
    compareAt: null,
    image: "images/product-4.svg",
    sizes: ["Free Size"],
    tag: "",
    description: "Hand block-printed cotton dupatta with contrast tasselled border."
  },
  {
    id: "IF-005",
    name: "Ikkat Cotton 3-Piece Set",
    category: "3-Piece Sets",
    price: 2750,
    compareAt: null,
    image: "images/product-5.svg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    tag: "",
    description: "Traditional Ikkat weave rendered in soft cotton, styled as a relaxed 3-piece set."
  },
  {
    id: "IF-006",
    name: "Kalamkari Print Kurti",
    category: "Kurta Sets",
    price: 1190,
    compareAt: 1400,
    image: "images/product-6.svg",
    sizes: ["S", "M", "L", "XL"],
    tag: "",
    description: "Short kurti with signature Kalamkari motifs, pairs easily with jeans or palazzos."
  },
  {
    id: "IF-007",
    name: "Chanderi 3-Piece Festive Set",
    category: "3-Piece Sets",
    price: 3450,
    compareAt: null,
    image: "images/product-7.svg",
    sizes: ["S", "M", "L", "XL"],
    tag: "New",
    description: "Lightweight Chanderi fabric with a subtle sheen, for festive and special occasions."
  },
  {
    id: "IF-008",
    name: "Handloom Cotton Saree",
    category: "Sarees",
    price: 1950,
    compareAt: null,
    image: "images/product-8.svg",
    sizes: ["Free Size"],
    tag: "",
    description: "Soft handloom cotton saree woven in a soft check, everyday elegance with an unstitched blouse piece."
  }
];

const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];

/** Renders the filter chips above the product grid. */
function renderFilters() {
  const row = document.getElementById("filterRow");
  if (!row) return;
  row.innerHTML = CATEGORIES.map((cat, i) =>
    `<button class="filter-chip ${i === 0 ? "active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");

  row.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderProductGrid(chip.dataset.cat);
    });
  });
}

/** Renders product cards, optionally filtered by category. */
function renderProductGrid(filterCat = "All") {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const list = filterCat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filterCat);

  grid.innerHTML = list.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">
          ${p.compareAt ? `<span class="strike">₹${p.compareAt}</span>` : ""}₹${p.price}
        </div>
        <div class="product-options">
          <select class="size-select" aria-label="Size for ${p.name}">
            ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
          <select class="qty-select" aria-label="Quantity for ${p.name}">
            ${[1,2,3,4,5].map(n => `<option value="${n}">Qty ${n}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-block btn-small add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    </article>
  `).join("");

  // Wire up "Add to Cart" for the freshly rendered cards
  grid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      const id = card.dataset.id;
      const size = card.querySelector(".size-select").value;
      const qty = parseInt(card.querySelector(".qty-select").value, 10);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        addToCart(product, size, qty);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderProductGrid();
});
