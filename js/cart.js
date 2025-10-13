import { products } from "./mock-data.js"; // Import danh sách sản phẩm từ file tĩnh

// === Xác định người dùng hiện tại ===
const currentUserRaw = localStorage.getItem("currentUser");
const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

// === Khởi tạo key lưu giỏ hàng ===
const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

// === Mảng chứa dữ liệu giỏ hàng đã load từ localStorage ===
let cart = [];

/**
 * Load giỏ hàng từ localStorage theo key tương ứng (user/guest)
 */
function loadCartFromLocalStorage() {
  try {
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    cart = [];
  }

  // Lọc các sản phẩm hợp lệ còn tồn tại trong mock-data
  cart = cart.filter((item) => getProductById(item.id));
}

/**
 * Lưu giỏ hàng vào localStorage và cập nhật lại giao diện
 */
function updateCartAndRender() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

/**
 * Kiểm tra đăng nhập trước khi cho phép thao tác
 */
function checkLogin() {
  if (!currentUser) {
    localStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname.split("/").pop()
    );
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

/**
 * Tìm sản phẩm theo ID từ danh sách `products`
 */
function getProductById(productId) {
  for (const category of products) {
    const found = category.list.find((p) => String(p.id) === String(productId));
    if (found) return found;
  }
  return null;
}

/**
 * Cập nhật số lượng sản phẩm
 */
function updateQuantity(productId, newQuantity, inputElement) {
  if (!checkLogin()) return;

  const item = cart.find((item) => String(item.id) === String(productId));
  if (item) {
    if (newQuantity < 1 || isNaN(newQuantity)) {
      showToast("Số lượng phải lớn hơn hoặc bằng 1");
      inputElement.value = item.quantity;
      return;
    }
    item.quantity = newQuantity;
    updateCartAndRender();
    showToast("Cập nhật thành công");
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
function removeItem(productId) {
  if (!checkLogin()) return;

  cart = cart.filter((item) => String(item.id) !== String(productId));
  updateCartAndRender();
  showToast("Đã xóa sản phẩm");
}

/**
 * Hiển thị giỏ hàng ra giao diện
 */
function renderCart() {
  const container = document.querySelector("#cart-container");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const product = getProductById(item.id);
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    let specsHtml = "";
    if (item.specs && Object.keys(item.specs).length > 0) {
      specsHtml =
        "<ul class='specs-list'>" +
        Object.entries(item.specs)
          .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          .join("") +
        "</ul>";
    }

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${product.img}" alt="${product.name}" />
      <div>
        <h3>${product.name}</h3>
        <p>Giá: ${product.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        ${specsHtml}
        <p>
          Số lượng: 
          <input type="number" min="1" value="${item.quantity}" data-id="${
      item.id
    }" class="quantity-input" />
        </p>
        <p>Thành tiền: ${itemTotal.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        <button class="remove-btn" data-id="${item.id}">Xóa</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Tổng tiền
  const totalEl = document.createElement("h3");
  totalEl.textContent = `Tổng cộng: ${total.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  })}`;
  container.appendChild(totalEl);

  // Nút thanh toán
  if (!document.getElementById("checkout-btn")) {
    const checkoutBtn = document.createElement("button");
    checkoutBtn.textContent = "Thanh toán";
    checkoutBtn.id = "checkout-btn";
    checkoutBtn.style = `
      display: block;
      margin-left: auto;
      padding: 10px 20px;
      background-color: #208e34ff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
    `;
    container.appendChild(checkoutBtn);

    // Điều hướng sang trang checkout.html khi nhấn nút thanh toán
    checkoutBtn.addEventListener("click", () => {
      if (!checkLogin()) return;
      if (cart.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
      }
      window.location.href = "checkout.html";
    });
  }

  // Nút tiếp tục mua sắm
  if (!document.getElementById("continue-shopping-btn")) {
    const continueShoppingBtn = document.createElement("button");
    continueShoppingBtn.textContent = "Tiếp tục mua sắm";
    continueShoppingBtn.id = "continue-shopping-btn";
    continueShoppingBtn.style = `
      display: block;
      margin-left: auto;
      padding: 10px 20px;
      background-color: #0a541aff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
      margin-bottom: 15px;
    `;
    container.appendChild(continueShoppingBtn);

    // Điều hướng sang trang chủ khi nhấn nút tiếp tục mua sắm
    continueShoppingBtn.addEventListener("click", () => {
      window.location.href = "index.html"; // Quay lại trang chủ
    });
  }

  // Sự kiện thay đổi số lượng
  container.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const newQty = parseInt(e.target.value, 10);
      updateQuantity(id, newQty, e.target);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.target.blur();
    });
  });

  // Sự kiện xóa sản phẩm
  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.id);
    });
  });
}

/**
 * Hiển thị thông báo nhỏ dạng toast
 */
function showToast(message) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng (nav)
 */
function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (countEl) {
    if (totalQuantity > 0) {
      countEl.style.display = "inline-block";
      countEl.textContent = totalQuantity;
    } else {
      countEl.style.display = "none";
    }
  }
}

/**
 * Hàm trả về giỏ hàng guest để dùng bên auth.js
 */
export function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem("cart_guest")) || [];
  } catch {
    return [];
  }
}

// === Khởi tạo khi file được load ===
loadCartFromLocalStorage();
updateCartAndRender();
