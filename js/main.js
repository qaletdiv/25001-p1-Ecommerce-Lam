import { products } from "./mock-data.js";

function initData() {
  // Kiểm tra nếu localStorage chưa có dữ liệu "products"
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Khởi tạo thêm giỏ hàng và người dùng nếu cần
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([])); // ban đầu chưa có ai
  }

  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", ""); // chưa ai đăng nhập
  }
}

initData();

function renderProducts(nameTitle) {
  const titleProduct = document.createElement("h2");
  titleProduct.textContent = `Danh sách sản phẩm ${nameTitle}`;
  const productsListTitle = document.createElement("div");
  productsListTitle.classList.add("product-list");
  titleProduct.classList.add("title-product");
  const container = document.querySelector(".main-product");
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === nameTitle) {
      products[i].list.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
    <img width="280" height="250" src="${product.img}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>${product.price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })}</p>
    <button class="product-btn" data-id="${product.id}"
    >Thêm vào giỏ</button>`;
        productsListTitle.appendChild(card);
      });
    }
  }
  container.appendChild(titleProduct);
  container.appendChild(productsListTitle);
}

renderProducts("Cà phê");
renderProducts("Trà sữa");
renderProducts("Matcha");
renderProducts("Trà trái cây");
renderProducts("Topping");

// Khai báo phần tử hiển thị số lượng giỏ hàng
const cartCountElem = document.getElementById("cart-count");

// Hàm lấy giỏ hàng từ localStorage hoặc tạo mới
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

// Hàm lưu giỏ hàng
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Cập nhật số lượng trên icon giỏ hàng
function updateCartCount() {
  const cart = getCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity > 0) {
    cartCountElem.style.display = "inline-block";
    cartCountElem.textContent = totalQuantity;
  } else {
    cartCountElem.style.display = "none";
  }
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
  const cart = getCart();

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  showAddNotification();
}

// Hiển thị thông báo thêm sản phẩm
function showAddNotification(message = "Đã thêm sản phẩm vào giỏ hàng") {
  let toastContainer = document.getElementById("toast-container");

  // Tạo container nếu chưa có
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Tạo một toast mới
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Thêm vào container
  toastContainer.appendChild(toast);

  // Tự động xóa sau 3 giây
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Khởi tạo hiển thị số lượng giỏ hàng khi load trang
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});

// Gán sự kiện cho tất cả nút "Thêm vào giỏ"
document.querySelectorAll(".product-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    addToCart(id);
  });
});
