import { products } from "./mock-data.js";

// Render toàn bộ sản phẩm (từ tất cả danh mục)
function renderAllProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach((category) => {
    const grid = document.createElement("div");
    grid.className = "product-grid";

    category.list.forEach((product) => {
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
          }" class="product-btn">Xem chi tiết</a>
          <button class="product-btn" onclick="addToCart('${
            product.id
          }')">Thêm vào giỏ</button>
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  });
}

// Thêm sản phẩm vào giỏ hàng
window.addToCart = function (productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng");
};

// Thông báo toast
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  const container =
    document.getElementById("toast-container") || createToastContainer();
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  document.body.appendChild(container);
  return container;
}

// Gọi khi load trang
document.addEventListener("DOMContentLoaded", renderAllProducts);
