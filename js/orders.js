// orders.js

// Import các hàm tiện ích và dữ liệu sản phẩm
import { formatCurrencyVN, getCurrentUser, isLoggedIn } from "./utils.js";
import { products } from "./mock-data.js";

// DOM Elements - các phần tử HTML tương tác
const ordersListEl = document.getElementById("orders-list");
const modal = document.getElementById("orderModal");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// --- Chuẩn bị danh sách sản phẩm phẳng (để dễ tìm kiếm theo id) ---
const allProducts = products.flatMap((cat) => cat.list);

// --- Hàm tìm sản phẩm theo id từ allProducts ---
function getProductInfoById(id) {
  return allProducts.find((p) => p.id === id);
}

// --- Kiểm tra user đã đăng nhập chưa ---
if (!isLoggedIn()) {
  alert("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
  localStorage.setItem("redirectAfterLogin", "orders.html");
  window.location.href = "login.html";
}

// --- Lấy thông tin user hiện tại ---
const user = getCurrentUser();
if (!user || !user.email) {
  alert("Không xác định được người dùng. Vui lòng đăng nhập lại.");
  window.location.href = "login.html";
}

// --- Lấy danh sách đơn hàng của user từ localStorage ---
const orderKey = `orders_${user.email}`;
let orders = JSON.parse(localStorage.getItem(orderKey)) || [];

// --- Hàm format ngày giờ dễ đọc ---
function formatDateTime(dateString) {
  if (!dateString) return "Không rõ";
  const d = new Date(dateString);
  if (isNaN(d)) return "Không rõ";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Hàm render danh sách đơn hàng ---
function renderOrders() {
  ordersListEl.innerHTML = ""; // Xóa nội dung cũ

  if (orders.length === 0) {
    ordersListEl.innerHTML = `<p>Bạn chưa có đơn hàng nào.</p>`;
    return;
  }

  // Hiển thị đơn hàng mới nhất lên đầu
  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const orderId = order.id || "Không xác định";
      const createdAt = order.createdAt || order.date || null;
      const total = order.total || 0;

      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order-item");

      orderDiv.innerHTML = `
        <div class="order-info">
          <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
          <p><strong>Ngày đặt:</strong> ${formatDateTime(createdAt)}</p>
          <p><strong>Tổng tiền:</strong> ${formatCurrencyVN(total)}</p>
        </div>
        <div class="order-actions">
          <button class="btn-view" data-id="${orderId}">Xem chi tiết</button>
          <button class="btn-print" data-id="${orderId}">In hóa đơn</button>
          <button class="btn-cancel" data-id="${orderId}">Hủy đơn</button>
        </div>
      `;

      ordersListEl.appendChild(orderDiv);
    });

  // Gán sự kiện cho nút xem chi tiết
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId = btn.getAttribute("data-id");
      openOrderDetail(orderId);
    });
  });

  // Gán sự kiện cho nút in hóa đơn
  document.querySelectorAll(".btn-print").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId = btn.getAttribute("data-id");
      printOrder(orderId);
    });
  });

  // Gán sự kiện cho nút hủy đơn
  document.querySelectorAll(".btn-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId = btn.getAttribute("data-id");
      cancelOrder(orderId);
    });
  });
}

// --- Hàm mở modal xem chi tiết đơn hàng ---
function openOrderDetail(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    alert("Không tìm thấy đơn hàng.");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  let itemsHtml = items
    .map((item) => {
      const productInfo = getProductInfoById(item.id);
      const name =
        item.name ??
        item.productName ??
        item.title ??
        productInfo?.name ??
        "Không rõ";
      const price =
        typeof item.price === "number" ? item.price : productInfo?.price ?? 0;
      const quantity = typeof item.quantity === "number" ? item.quantity : 1;
      const total = price * quantity;

      let specsHtml = "";
      // Kiểm tra nếu sản phẩm có thông số kỹ thuật và không phải là sản phẩm không tùy chỉnh
      if (
        item.specs &&
        typeof item.specs === "object" &&
        Object.keys(item.specs).length > 0 &&
        productInfo?.customizable
      ) {
        specsHtml =
          "<ul class='specs-list'>" +
          Object.entries(item.specs)
            .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
            .join("") +
          "</ul>";
      }

      return `
        <li>
          <strong>${name}</strong> - Số lượng: ${quantity} - Đơn giá: ${formatCurrencyVN(
        price
      )} - Thành tiền: ${formatCurrencyVN(total)}
          ${specsHtml}
        </li>
      `;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="modal-header">Chi tiết đơn hàng #${order.id}</div>
    <p><strong>Ngày đặt:</strong> ${formatDateTime(
      order.createdAt || order.date
    )}</p>
    <p><strong>Họ tên:</strong> ${
      order.name || order.shipping?.name || "Chưa có"
    }</p>
    <p><strong>Email:</strong> ${
      order.email || order.userEmail || user.email || "Chưa có"
    }</p>
    <p><strong>Số điện thoại:</strong> ${
      order.phone || order.shipping?.phone || "Chưa có"
    }</p>
    <p><strong>Địa chỉ:</strong> ${
      order.address || order.shipping?.address || "Chưa có"
    }</p>
    <p><strong>Phương thức thanh toán:</strong> ${
      order.payment || order.paymentMethod || "Chưa có"
    }</p>
    <p><strong>Điểm tích lũy:</strong> ${user.points || 0} điểm</p>
    <h4>Sản phẩm:</h4>
    <ul class="order-items-list">${
      itemsHtml || "<li>Không có sản phẩm</li>"
    }</ul>
    <p><strong>Tổng tiền hàng:</strong> ${formatCurrencyVN(
      order.subtotal || order.total || 0
    )}</p>
    <p><strong>Phí vận chuyển:</strong> ${formatCurrencyVN(
      order.shippingFee || order.shipping || 0
    )}</p>
    <p><strong>Thành tiền:</strong> ${formatCurrencyVN(order.total || 0)}</p>
  `;

  modal.style.display = "block";
}

// --- Đóng modal khi click nút đóng hoặc bên ngoài ---
modalCloseBtn.onclick = () => {
  modal.style.display = "none";
};
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// --- Hàm hủy đơn hàng ---
function cancelOrder(orderId) {
  if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

  orders = orders.filter((o) => o.id !== orderId);
  localStorage.setItem(orderKey, JSON.stringify(orders));
  alert("Đơn hàng đã được hủy.");
  renderOrders();
}

// --- Hàm in hóa đơn ---
function printOrder(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    alert("Không tìm thấy đơn hàng.");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  let itemsHtml = items
    .map((item) => {
      const productInfo = getProductInfoById(item.id);
      const name =
        item.name ??
        item.productName ??
        item.title ??
        productInfo?.name ??
        "Không rõ";
      const price =
        typeof item.price === "number" ? item.price : productInfo?.price ?? 0;
      const quantity = typeof item.quantity === "number" ? item.quantity : 1;
      const total = price * quantity;

      let specsHtml = "";
      // Kiểm tra nếu sản phẩm có thông số kỹ thuật và không phải là sản phẩm không tùy chỉnh
      if (
        item.specs &&
        typeof item.specs === "object" &&
        Object.keys(item.specs).length > 0 &&
        productInfo?.customizable
      ) {
        specsHtml =
          "<ul style='margin: 5px 0 10px 0; padding-left: 18px; font-size: 0.9em;'>" +
          Object.entries(item.specs)
            .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
            .join("") +
          "</ul>";
      }

      return `
      <tr>
        <td>
          ${name}
          ${specsHtml}
        </td>
        <td style="text-align:center;">${quantity}</td>
        <td style="text-align:right;">${formatCurrencyVN(price)}</td>
        <td style="text-align:right;">${formatCurrencyVN(total)}</td>
      </tr>
    `;
    })
    .join("");

  const printContent = `
    <html>
      <head>
        <title>Hóa đơn #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { color: #2c7a7b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
          th { background-color: #f2f2f2; }
          tfoot td { font-weight: bold; }
          ul { margin: 5px 0 10px 0; padding-left: 18px; font-size: 0.9em; }
          ul li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <h2>Hóa đơn mua hàng #${order.id}</h2>
        <p><strong>Ngày đặt:</strong> ${formatDateTime(
          order.createdAt || order.date
        )}</p>
        <p><strong>Khách hàng:</strong> ${
          order.name || order.shipping?.name || "Chưa có"
        }</p>
        <p><strong>Số điện thoại:</strong> ${
          order.phone || order.shipping?.phone || "Chưa có"
        }</p>
        <p><strong>Địa chỉ:</strong> ${
          order.address || order.shipping?.address || "Chưa có"
        }</p>
        <p><strong>Phương thức thanh toán:</strong> ${
          order.payment || order.paymentMethod || "Chưa có"
        }</p>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style="text-align:center;">SL</th>
              <th style="text-align:right;">Đơn giá</th>
              <th style="text-align:right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="4">Không có sản phẩm</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Tổng tiền hàng</td>
              <td style="text-align:right;">${formatCurrencyVN(
                order.subtotal || order.total || 0
              )}</td>
            </tr>
            <tr>
              <td colspan="3">Phí vận chuyển</td>
              <td style="text-align:right;">${formatCurrencyVN(
                order.shippingFee || order.shipping || 0
              )}</td>
            </tr>
            <tr>
              <td colspan="3">Tổng thanh toán</td>
              <td style="text-align:right;">${formatCurrencyVN(
                order.total || 0
              )}</td>
            </tr>
          </tfoot>
        </table>
        <p>Cảm ơn quý khách đã mua hàng!</p>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// --- Khởi tạo ---
renderOrders();
