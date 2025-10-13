// utils.js - Hàm dùng chung (format tiền, lấy param URL, check login, thao tác với localStorage)

// Format tiền VND
export function formatCurrencyVN(amount) {
  if (isNaN(amount)) return "0 ₫";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

// Kiểm tra đăng nhập
export function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// Lấy user đang đăng nhập
export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user && typeof user === "object" ? user : null;
  } catch (e) {
    return null;
  }
}

// Lấy đơn hàng từ localStorage
export function getOrdersFromLocalStorage(userEmail) {
  const key = `orders_${userEmail}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Lưu đơn hàng vào localStorage
export function saveOrdersToLocalStorage(userEmail, orders) {
  const key = `orders_${userEmail}`;
  localStorage.setItem(key, JSON.stringify(orders));
}

// Format ngày giờ
export function formatDateTime(dateString) {
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

// Render các sản phẩm trong đơn hàng
export function renderOrderItems(items = []) {
  return items
    .map((item) => {
      const name = item.name ?? "Không rõ";
      const price = item.price ?? 0;
      const quantity = item.quantity ?? 1;
      const total = price * quantity;
      return `
        <li>
          <strong>${name}</strong> – Số lượng: ${quantity} – Đơn giá: ${formatCurrencyVN(
        price
      )} – Thành tiền: ${formatCurrencyVN(total)}
        </li>
      `;
    })
    .join("");
}

// Hàm tạo nội dung hóa đơn (cùng mẫu cho cả xem chi tiết và in hóa đơn)
export function generateInvoiceHtml(order, user) {
  const itemsHtml = (order.items || [])
    .map((item) => {
      const name = item.name ?? "Không rõ";
      const price = item.price ?? 0;
      const quantity = item.quantity ?? 1;
      const total = price * quantity;
      return `
        <tr>
          <td>${name}</td>
          <td>${quantity}</td>
          <td>${formatCurrencyVN(price)}</td>
          <td>${formatCurrencyVN(total)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <html>
      <head>
        <title>Hóa đơn #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          h1, h2, p { margin: 0 0 10px 0; }
        </style>
      </head>
      <body>
        <h1>HÓA ĐƠN MUA HÀNG</h1>
        <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
        <p><strong>Ngày đặt:</strong> ${formatDateTime(
          order.createdAt || order.date
        )}</p>
        <p><strong>Khách hàng:</strong> ${
          order.name || user.name || "Chưa có"
        }</p>
        <p><strong>Email:</strong> ${order.email || user.email}</p>
        <p><strong>Trạng thái thanh toán:</strong> ${
          order.paymentStatus || "Chưa thanh toán"
        }</p>

        <h2>Danh sách sản phẩm</h2>
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
            ${itemsHtml || `<tr><td colspan="4">Không có sản phẩm</td></tr>`}
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
  `;
}
