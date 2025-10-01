import { products } from "./mock-data.js";

/**
 * Khởi tạo dữ liệu ban đầu vào localStorage nếu chưa có.
 * - products: danh sách sản phẩm
 * - users: danh sách người dùng (mặc định rỗng)
 * - currentUser: người dùng đang đăng nhập (mặc định rỗng)
 */
function initData() {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", "");
  }
}

/**
 * Hiển thị danh sách sản phẩm theo tên danh mục (category)
 * @param {string} nameTitle - Tên danh mục sản phẩm (ví dụ: "Cà phê")
 */
function renderProducts(nameTitle) {
  // Tạo tiêu đề cho danh sách sản phẩm
  const titleProduct = document.createElement("h2");
  titleProduct.textContent = `Danh sách sản phẩm ${nameTitle}`;
  titleProduct.classList.add("title-product");

  // Container chứa các card sản phẩm
  const productsListTitle = document.createElement("div");
  productsListTitle.classList.add("product-list");

  // Lấy thẻ chứa sản phẩm chính trong HTML
  const container = document.querySelector(".main-product");

  // Lặp qua từng danh mục trong products
  products.forEach((category) => {
    if (category.category === nameTitle) {
      // Với mỗi sản phẩm trong danh mục này, tạo card hiển thị
      category.list.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img width="280" height="250" src="${product.img}" alt="${
          product.name
        }">
          <h3>${product.name}</h3>
          <p>${product.price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}</p>
          <button class="product-btn" data-id="${
            product.id
          }">Thêm vào giỏ</button>
        `;

        // Gán sự kiện click cho nút "Thêm vào giỏ"
        const btn = card.querySelector(".product-btn");
        btn.addEventListener("click", () => {
          addToCart(product.id);
        });

        productsListTitle.appendChild(card);
      });
    }
  });

  // Thêm tiêu đề và danh sách sản phẩm vào container chính
  container.appendChild(titleProduct);
  container.appendChild(productsListTitle);
}

/**
 * Lấy dữ liệu giỏ hàng từ localStorage
 * @returns {Array} mảng các sản phẩm trong giỏ hàng [{id, quantity}]
 */
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

/**
 * Lưu giỏ hàng vào localStorage và cập nhật số lượng hiển thị
 * @param {Array} cart - mảng giỏ hàng
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng ở icon giỏ hàng
 */
function updateCartCount() {
  const cartCountElem = document.getElementById("cart-count");
  const cart = getCart();
  // Tổng số lượng tất cả sản phẩm
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity > 0) {
    cartCountElem.style.display = "inline-block";
    cartCountElem.textContent = totalQuantity;
  } else {
    cartCountElem.style.display = "none";
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng theo productId
 * Nếu sản phẩm đã tồn tại, tăng số lượng
 * @param {string} productId
 */
function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  showAddNotification();
}

/**
 * Hiển thị thông báo nhỏ khi thêm sản phẩm vào giỏ hàng
 * @param {string} message - nội dung thông báo
 */
function showAddNotification(message = "Đã thêm sản phẩm vào giỏ hàng") {
  let toastContainer = document.getElementById("toast-container");

  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "1000";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background = "rgba(0, 0, 0, 0.7)";
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.marginTop = "10px";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  toast.style.fontSize = "14px";
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Tự động ẩn thông báo sau 3 giây
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Tìm kiếm sản phẩm theo tên
 * Ẩn/hiện các card dựa trên kết quả tìm kiếm
 */
function searchProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const allCards = document.querySelectorAll(".product-card");

  allCards.forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(input) ? "" : "none";
  });
}

// Gán sự kiện click cho nút tìm kiếm ở header
document.querySelector(".search-btn").addEventListener("click", searchProducts);

// MAIN INIT: chạy khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  initData();

  // Hiển thị sản phẩm theo các danh mục
  renderProducts("Cà phê");
  renderProducts("Trà sữa");
  renderProducts("Matcha");
  renderProducts("Trà trái cây");
  renderProducts("Topping");

  // Cập nhật số lượng giỏ hàng ở icon
  updateCartCount();

  // Nút Đăng nhập/đăng xuất

  const isLogin = localStorage.getItem("userLoggedIn");
  if (isLogin === "true") {
    document.getElementById("login-btn").textContent = "Đăng xuất";
  } else {
    document.getElementById("login-btn").textContent = "Đăng nhập";
  }
  document.getElementById("login-btn").addEventListener("click", () => {
    if (isLogin === "true") {
      window.location.reload();
      localStorage.setItem("userLoggedIn", "false");
    } else {
      window.location.href = "login.html";
    }
  });
});
