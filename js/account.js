// Import các hàm tiện ích và dữ liệu sản phẩm
import { formatCurrencyVN, getCurrentUser, isLoggedIn } from "./utils.js";

// DOM Elements
const userInfoEl = document.getElementById("userInfo");
const ordersListEl = document.getElementById("orders-list");
const modal = document.getElementById("orderModal");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// Kiểm tra đăng nhập
if (!isLoggedIn()) {
  alert("Vui lòng đăng nhập để xem tài khoản của bạn.");
  localStorage.setItem("redirectAfterLogin", "account.html");
  window.location.href = "login.html";
}

// Lấy thông tin người dùng
const user = getCurrentUser();
if (!user || !user.email) {
  alert("Không xác định được người dùng. Vui lòng đăng nhập lại.");
  window.location.href = "login.html";
}

// Lấy danh sách đơn hàng của user
const orderKey = `orders_${user.email}`;
let orders = JSON.parse(localStorage.getItem(orderKey)) || [];

// Format ngày
function formatDateTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Hiển thị thông tin người dùng
function renderUserInfo() {
  userInfoEl.innerHTML = `
    <h3>Thông tin tài khoản</h3>
    <p><strong>Họ và tên:</strong> ${user.fullName || "Chưa có"}</p>
    <p><strong>Số điện thoại:</strong> ${user.phone}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Điểm tích lũy:</strong> ${user.points || 0} điểm</p>

   

  `;
}

// Hiển thị danh sách đơn hàng
function renderOrderHistory() {
  ordersListEl.innerHTML = "";

  if (orders.length === 0) {
    ordersListEl.innerHTML = `<p>Bạn chưa có đơn hàng nào.</p>`;
    return;
  }

  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order-item");

      orderDiv.innerHTML = `
        <div class="order-info">
          <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
          <p><strong>Ngày đặt:</strong> ${formatDateTime(order.createdAt)}</p>
          <p><strong>Tổng tiền:</strong> ${formatCurrencyVN(order.total)}</p>
          <p><strong>Trạng thái:</strong> ${
            order.paymentStatus || "Chưa thanh toán"
          }</p>
        </div>
        <div class="order-actions">
          <button class="btn-view" data-id="${order.id}">Xem chi tiết</button>
          <button class="btn-print" data-id="${order.id}">In hóa đơn</button>
        </div>
      `;
      ordersListEl.appendChild(orderDiv);
    });

  // Gán sự kiện
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => openOrderDetail(btn.dataset.id));
  });
  document.querySelectorAll(".btn-print").forEach((btn) => {
    btn.addEventListener("click", () => printOrder(btn.dataset.id));
  });
}

// Mở modal xem chi tiết
function openOrderDetail(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return alert("Không tìm thấy đơn hàng.");

  const items = Array.isArray(order.items) ? order.items : [];

  let itemsHtml = items
    .map((item) => {
      const name = item.name || "Không rõ";
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return `<li>${name} - SL: ${quantity} - Đơn giá: ${formatCurrencyVN(
        price
      )} - Thành tiền: ${formatCurrencyVN(price * quantity)}</li>`;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="modal-header">Chi tiết đơn hàng #${order.id}</div>
    <p><strong>Ngày đặt:</strong> ${formatDateTime(order.createdAt)}</p>
    <p><strong>Khách hàng:</strong> ${
      order.name || order.fullName || order.shipping?.name || "Chưa có"
    }</p>
    <p><strong>Số điện thoại:</strong> ${
      order.phone || order.shipping?.phone || "Chưa có"
    }</p>
    <p><strong>Email:</strong> ${order.email || user.email}</p>
    <p><strong>Trạng thái thanh toán:</strong> ${
      order.paymentStatus || "Chưa thanh toán"
    }</p>
    <h4>Danh sách sản phẩm:</h4>
    <ul>${itemsHtml || "<li>Không có sản phẩm</li>"}</ul>
    <p><strong>Tổng tiền hàng:</strong> ${formatCurrencyVN(
      order.subtotal || order.total || 0
    )}</p>
    <p><strong>Phí vận chuyển:</strong> ${formatCurrencyVN(
      order.shippingFee || 0
    )}</p>
    <p><strong>Thành tiền:</strong> ${formatCurrencyVN(order.total || 0)}</p>
  `;
  modal.style.display = "block";
}

// Đóng modal
modalCloseBtn.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
  if (event.target === modal) modal.style.display = "none";
};

// In hóa đơn
function printOrder(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return alert("Không tìm thấy đơn hàng.");

  const items = Array.isArray(order.items) ? order.items : [];

  let itemsHtml = items
    .map((item) => {
      const name = item.name || "Không rõ";
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const total = price * quantity;
      return `
        <tr>
          <td>${name}</td>
          <td style="text-align:center;">${quantity}</td>
          <td style="text-align:right;">${formatCurrencyVN(price)}</td>
          <td style="text-align:right;">${formatCurrencyVN(total)}</td>
        </tr>
      `;
    })
    .join("");

  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Hóa đơn #${order.id}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background-color: #f2f2f2; }
          td { vertical-align: top; }
        </style>
      </head>
      <body>
        <h2>HÓA ĐƠN MUA HÀNG</h2>
        <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
        <p><strong>Ngày đặt:</strong> ${formatDateTime(order.createdAt)}</p>
        <p><strong>Khách hàng:</strong> ${
          order.name || order.fullName || order.shipping?.name || "Chưa có"
        }</p>
        <p><strong>Số điện thoại:</strong> ${
          order.phone || order.shipping?.phone || "Chưa có"
        }</p>

        <p><strong>Email:</strong> ${order.email || user.email}</p>
        <p><strong>Trạng thái thanh toán:</strong> ${
          order.paymentStatus || "Chưa thanh toán"
        }</p>
        <h3>Danh sách sản phẩm</h3>
        <table>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || "<tr><td colspan='4'>Không có sản phẩm</td></tr>"}
          </tbody>
        </table>
        <p><strong>Tổng tiền hàng:</strong> ${formatCurrencyVN(
          order.subtotal || order.total || 0
        )}</p>
        <p><strong>Phí vận chuyển:</strong> ${formatCurrencyVN(
          order.shippingFee || 0
        )}</p>
        <p><strong>Thành tiền:</strong> ${formatCurrencyVN(
          order.total || 0
        )}</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// Gọi hàm
renderUserInfo();
renderOrderHistory();
