import { products } from "./mock-data.js";

// --- CHẶN TRUY CẬP KHI CHƯA ĐĂNG NHẬP ---
if (localStorage.getItem("userLoggedIn") !== "true") {
  localStorage.setItem("redirectAfterLogin", window.location.pathname);
  alert("Vui lòng đăng nhập để truy cập giỏ hàng.");
  window.location.href = "login.html";
}

// Lấy cart từ localStorage hoặc mảng rỗng
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Lọc sản phẩm còn tồn tại trong dữ liệu gốc
cart = cart.filter((item) => getProductById(item.id));
updateCartAndRender();

// --- Hàm kiểm tra đăng nhập trước thao tác ---
function checkLogin() {
  if (localStorage.getItem("userLoggedIn") !== "true") {
    // Lưu trang hiện tại để chuyển về sau login
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

// Lấy sản phẩm theo id từ mock-data
function getProductById(productId) {
  for (const category of products) {
    const found = category.list.find((p) => String(p.id) === String(productId));
    if (found) return found;
  }
  return null;
}

// Lưu cart + render lại
function updateCartAndRender() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Cập nhật số lượng
function updateQuantity(productId, newQuantity, inputElement) {
  if (!checkLogin()) return; // Bắt buộc đăng nhập trước cập nhật
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

// Xóa sản phẩm khỏi giỏ
function removeItem(productId) {
  if (!checkLogin()) return; // Bắt buộc đăng nhập trước xóa
  const container = document.querySelector("#cart-container");
  const itemDiv = container
    .querySelector(`button[data-id="${productId}"]`)
    ?.closest(".cart-item");
  if (itemDiv) {
    itemDiv.style.transition = "opacity 0.4s";
    itemDiv.style.opacity = "0";
    setTimeout(() => {
      cart = cart.filter((item) => String(item.id) !== String(productId));
      updateCartAndRender();
      showToast("Đã xóa sản phẩm");
    }, 400);
  } else {
    cart = cart.filter((item) => String(item.id) !== String(productId));
    updateCartAndRender();
    showToast("Đã xóa sản phẩm");
  }
}

// Render giỏ hàng
function renderCart() {
  const container = document.querySelector("#cart-container");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const product = getProductById(item.id);
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

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

  const totalEl = document.createElement("h3");
  totalEl.textContent = `Tổng cộng: ${total.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  })}`;
  container.appendChild(totalEl);

  // Tạo nút thanh toán nếu chưa có
  if (!document.getElementById("checkout-btn")) {
    const checkoutBtn = document.createElement("button");
    checkoutBtn.textContent = "Thanh toán";
    checkoutBtn.id = "checkout-btn";
    checkoutBtn.style = `
      display: block;
      margin-left: auto;
      padding: 10px 20px;
      background-color: #5d8e20;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
    `;
    container.appendChild(checkoutBtn);

    checkoutBtn.addEventListener("click", () => {
      if (!checkLogin()) return; // Bắt buộc đăng nhập trước thanh toán
      if (cart.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
      }
      showCheckoutModal();
    });
  }

  // Bắt sự kiện thay đổi số lượng
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

  // Bắt sự kiện xóa sản phẩm
  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.id);
    });
  });
}

// Modal thanh toán
function showCheckoutModal() {
  if (document.getElementById("checkout-modal")) return;

  // Thêm style cho modal
  if (!document.getElementById("checkout-modal-style")) {
    const style = document.createElement("style");
    style.id = "checkout-modal-style";
    style.textContent = `
      #checkout-modal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        overflow-y: auto;
      }
      #checkout-modal > div {
        background: white;
        padding: 30px 40px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        box-sizing: border-box;
      }
      #checkout-modal h2 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #116c08;
      }
      #checkout-modal label {
        font-weight: 600;
      }
      #checkout-modal input[type="text"],
      #checkout-modal input[type="tel"],
      #checkout-modal textarea {
        width: 100%;
        padding: 8px 10px;
        margin: 6px 0 15px;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-sizing: border-box;
        font-size: 14px;
      }
      #checkout-modal textarea {
        resize: vertical;
      }
      #checkout-modal input[type="radio"] {
        margin-right: 6px;
      }
      #checkout-modal button[type="submit"] {
        background-color: #5d8e20;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
      }
      #checkout-modal button[type="submit"]:hover {
        background-color: #477415;
      }
      @media (max-width: 480px) {
        #checkout-modal > div {
          padding: 20px 15px;
          max-width: 95%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const modal = document.createElement("div");
  modal.id = "checkout-modal";

  const modalContent = document.createElement("div");

  modalContent.innerHTML = `
    <h2>Thanh toán đơn hàng</h2>
    <form id="checkout-form">
      <div><label>Họ và tên:</label><br /><input type="text" required /></div>
      <div><label>Địa chỉ:</label><br /><textarea required></textarea></div>
      <div><label>SĐT:</label><br /><input type="tel" pattern="[0-9]{9,12}" required /></div>
      <div>
        <label><input type="radio" name="payment" value="Tiền mặt" checked /> Tiền mặt</label><br />
        <label><input type="radio" name="payment" value="Thẻ tín dụng" /> Thẻ tín dụng</label><br />
        <label><input type="radio" name="payment" value="Ví điện tử" /> Ví điện tử</label>
      </div>
      <button type="submit">Xác nhận</button>
    </form>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Focus tự động vào input đầu tiên
  modalContent.querySelector("input").focus();

  // Đóng modal khi click ngoài
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Xử lý submit form thanh toán
  modal.querySelector("#checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.removeItem("cart");
    cart = [];
    modal.remove();
    showToast("Thanh toán thành công!");
    renderCart();
  });
}
