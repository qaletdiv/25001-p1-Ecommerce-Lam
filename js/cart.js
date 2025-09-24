import { products } from "./mock-data.js";

// Biến cart phải dùng let để có thể gán lại khi xóa item
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Tìm sản phẩm theo ID trong mảng products
function getProductById(productId) {
  for (const category of products) {
    const found = category.list.find((p) => p.id === productId);
    if (found) return found;
  }
  return null;
}

// Cập nhật localStorage và render lại giỏ hàng
function updateCartAndRender() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Cập nhật số lượng sản phẩm trong giỏ
function updateQuantity(productId, newQuantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    if (item.quantity <= 0) {
      // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ
      cart = cart.filter((item) => item.id !== productId);
    }
    updateCartAndRender();
  }
}

// Xóa sản phẩm theo ID
function removeItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartAndRender();
}

// Render giỏ hàng ra HTML
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

  // Thêm nút Thanh toán nếu chưa có
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
      if (cart.length === 0) {
        alert(
          "Giỏ hàng đang trống, vui lòng thêm sản phẩm trước khi thanh toán."
        );
        return;
      }
      showCheckoutModal();
    });
  }

  // Bắt sự kiện thay đổi số lượng input
  container.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const newQty = parseInt(e.target.value, 10);
      if (isNaN(newQty) || newQty < 1) {
        removeItem(id);
      } else {
        updateQuantity(id, newQty);
      }
    });
  });

  // Bắt sự kiện nút xóa sản phẩm
  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.id);
    });
  });
}

// Hiển thị modal thanh toán với form nhập thông tin
function showCheckoutModal() {
  if (document.getElementById("checkout-modal")) return;

  const modal = document.createElement("div");
  modal.id = "checkout-modal";
  modal.style = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  const modalContent = document.createElement("div");
  modalContent.style = `
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    max-width: 400px;
  `;

  modalContent.innerHTML = `
    <h2>Thanh toán đơn hàng</h2>
    <form id="checkout-form">
      <div style="margin-bottom: 15px;">
        <label for="name">Họ và tên:</label><br />
        <input type="text" id="name" name="name" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label for="address">Địa chỉ giao hàng:</label><br />
        <textarea id="address" name="address" required style="width: 100%; padding: 8px;"></textarea>
      </div>
      <div style="margin-bottom: 15px;">
        <label for="phone">Số điện thoại:</label><br />
        <input type="tel" id="phone" name="phone" pattern="[0-9]{9,12}" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-bottom: 20px;">
        <p>Phương thức thanh toán:</p>
        <label><input type="radio" name="payment" value="Tiền mặt" checked /> Tiền mặt</label><br />
        <label><input type="radio" name="payment" value="Thẻ tín dụng" /> Thẻ tín dụng</label><br />
        <label><input type="radio" name="payment" value="Ví điện tử" /> Ví điện tử</label>
      </div>
      <div style="text-align: center;">
        <button type="submit" style="
          background-color: #5d8e20;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 10px;
          font-size: 16px;
        ">Xác nhận</button>
        <button type="button" id="cancel-btn" style="
          background-color: #f44336;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        ">Hủy</button>
      </div>
    </form>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Xử lý nút hủy: đóng modal
  document.getElementById("cancel-btn").onclick = () => {
    document.body.removeChild(modal);
  };

  // Xử lý submit form thanh toán
  document.getElementById("checkout-form").onsubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value.trim();
    const address = form.address.value.trim();
    const phone = form.phone.value.trim();
    const payment = form.payment.value;

    // Kiểm tra dữ liệu hợp lệ
    if (!name || !address || !phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    // Thông báo thành công và xóa giỏ hàng
    alert(`Thanh toán thành công!\n
Họ tên: ${name}\n
Địa chỉ: ${address}\n
Số điện thoại: ${phone}\n
Phương thức thanh toán: ${payment}\n
Cảm ơn bạn đã mua hàng!`);

    cart = [];
    updateCartAndRender();
    document.body.removeChild(modal);
  };
}

// Khởi tạo render khi load trang
renderCart();
