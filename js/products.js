import { products } from "./mock-data.js";

// Cấu hình phân trang
const ITEMS_PER_PAGE = 8;

let currentPage = 1;
let filteredProducts = []; // mảng các sản phẩm đã lọc & sắp xếp

// --- Khởi tạo filter category dropdown ---
function initFilterCategory() {
  const sel = document.getElementById("filter-category");
  const categories = products.map((cat) => cat.category);
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
}

// --- Lấy mảng tất cả sản phẩm từ mock-data ---
function getAllProductsFlat() {
  // flatten: từ [{category, list}] sang [product, product, ...]
  return products.flatMap((cat) =>
    cat.list.map((p) => ({
      ...p,
      category: cat.category,
    }))
  );
}

// --- Áp filter & sắp xếp & phân trang ---
function applyFiltersAndSort() {
  const all = getAllProductsFlat();

  // Lọc theo danh mục
  const catSel = document.getElementById("filter-category").value;
  let arr = all.filter((p) => {
    if (catSel && p.category !== catSel) return false;
    return true;
  });

  // Lọc theo giá min / max
  const minVal = parseInt(document.getElementById("price-min").value) || 0;
  const maxVal =
    parseInt(document.getElementById("price-max").value) || Infinity;
  arr = arr.filter((p) => {
    return p.price >= minVal && p.price <= maxVal;
  });

  // Sắp xếp
  const sortOpt = document.getElementById("sort-option").value;
  if (sortOpt === "price-asc") {
    arr.sort((a, b) => a.price - b.price);
  } else if (sortOpt === "price-desc") {
    arr.sort((a, b) => b.price - a.price);
  } else if (sortOpt === "name-asc") {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }

  filteredProducts = arr;

  // Khi filter thay đổi, reset page về 1
  currentPage = 1;

  renderPage();
}

// --- Render 1 trang sản phẩm ---
function renderPage() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredProducts.slice(start, end);

  pageItems.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" width="280" height="250" />
      <h3>${p.name}</h3>
      <p>${p.price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}</p>
      <div class="actions">
        <a href="product-detail.html?id=${
          p.id
        }" class="product-btn">Xem chi tiết</a>
        <button class="product-btn btn-add" data-id="${
          p.id
        }">Thêm vào giỏ</button>
      </div>
    `;
    container.appendChild(card);
  });

  renderPagination();
  attachAddToCartEvents();
}

// --- Render phân trang ---
function renderPagination() {
  const pagDiv = document.getElementById("pagination");
  pagDiv.innerHTML = "";

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage();
    });
    pagDiv.appendChild(btn);
  }
}

// --- Xử lý nút “Thêm vào giỏ hàng” ---
function attachAddToCartEvents() {
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const isLogin = localStorage.getItem("userLoggedIn") === "true";
      if (!isLogin) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        window.location.href = "login.html";
        return;
      }
      addToCart(id);
    });
  });
}

// --- Hàm thêm vào giỏ hàng ---
function addToCart(productId) {
  const cartKey = `cart_${
    JSON.parse(localStorage.getItem("currentUser"))?.email
  }`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const found = cart.find((item) => item.id === productId);
  if (found) {
    found.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng");
  updateCartCount(); // cập nhật số lượng trên navbar nếu có
}

// --- Hàm show toast ---
function showToast(msg) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Cập nhật số lượng trong navbar ---
function updateCartCount() {
  const span = document.getElementById("cart-count");
  if (!span) return;
  const cartKey = `cart_${
    JSON.parse(localStorage.getItem("currentUser"))?.email
  }`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const total = cart.reduce((sum, it) => sum + it.quantity, 0);
  if (total > 0) {
    span.style.display = "inline-block";
    span.textContent = total;
  } else {
    span.style.display = "none";
  }
}

// --- Gắn sự kiện cho button lọc ---
document.getElementById("btn-filter")?.addEventListener("click", () => {
  applyFiltersAndSort();
});

// --- Khi DOM load ---
document.addEventListener("DOMContentLoaded", () => {
  initFilterCategory();
  applyFiltersAndSort(); // render lần đầu
  updateCartCount();

  // Xử lý hiển thị menu đăng nhập / đăng xuất
  const isLogin = localStorage.getItem("userLoggedIn") === "true";
  const accountMenu = document.getElementById("account-menu");
  const accountLink = document.getElementById("account-link");
  if (accountMenu && accountLink) {
    if (isLogin) {
      accountMenu.innerHTML = `
        <a href="account.html" id="account-link">Tài khoản của tôi</a> |
        <a href="#" id="logout-link">Đăng xuất</a>
      `;
      document.getElementById("logout-link").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("userLoggedIn", "false");
        localStorage.removeItem("currentUser");
        location.reload();
      });
    } else {
      accountLink.textContent = "Đăng nhập";
      accountLink.href = "login.html";
    }
  }

  // Bắt sự kiện khi nhấn vào cart link ở navbar
  const cartLink = document.querySelector(".cart-link");
  cartLink?.addEventListener("click", (e) => {
    const isLogin = localStorage.getItem("userLoggedIn") === "true";
    if (!isLogin) {
      e.preventDefault();
      alert("Vui lòng đăng nhập để xem giỏ hàng");
      window.location.href = "login.html";
    }
  });
});
