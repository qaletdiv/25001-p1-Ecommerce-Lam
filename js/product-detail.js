import { products } from "./mock-data.js";

function getProductById(id) {
  for (const category of products) {
    const product = category.list.find((p) => String(p.id) === String(id));
    if (product) return { product, category };
  }
  return null;
}

// Hàm thêm sản phẩm vào giỏ hàng
window.addToCart = function (productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => String(item.id) === String(productId));
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng");
};

function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const container = document.getElementById("product-detail");
  if (!id) {
    container.textContent = "Sản phẩm không tồn tại.";
    return;
  }

  const result = getProductById(id);

  if (!result) {
    container.textContent = "Sản phẩm không tồn tại.";
    return;
  }

  const { product, category } = result;

  container.innerHTML = `
    <div class="product-detail-card">
      <img src="${product.img}" alt="${
    product.name
  }" width="400" height="350" />
      <div class="product-detail-info">
        <h2>${product.name}</h2>
        <p class="price">${product.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        <p class="description">${
          product.description || "Chưa có mô tả cho sản phẩm này."
        }</p>
        <button class="product-btn" id="add-to-cart-btn" aria-label="Thêm sản phẩm vào giỏ">Thêm vào giỏ</button>
      </div>
    </div>
  `;

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    addToCart(product.id);
  });

  renderRelatedProducts(category.list, product.id);
}

function renderRelatedProducts(productList, currentProductId) {
  const container = document.getElementById("related-products");
  container.innerHTML = "";

  const related = productList
    .filter((p) => String(p.id) !== String(currentProductId))
    .slice(0, 4);

  if (related.length === 0) {
    container.innerHTML = "<p>Không có sản phẩm liên quan.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "product-grid";

  related.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.img}" alt="${
      product.name
    }" width="280" height="250" />
      <h3>${product.name}</h3>
      <p>${product.price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}</p>
      <div class="actions">
        <a href="product-detail.html?id=${
          product.id
        }" class="product-btn" aria-label="Xem chi tiết ${
      product.name
    }">Xem chi tiết</a>
        <button class="product-btn" aria-label="Thêm ${
          product.name
        } vào giỏ" onclick="addToCart('${product.id}')">Thêm vào giỏ</button>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

document.addEventListener("DOMContentLoaded", renderProductDetail);
