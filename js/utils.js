// utils.js (bạn đã gửi mình giữ nguyên)

// Các hàm tiện ích dùng chung (format tiền, check login, thao tác localStorage)
export function formatCurrencyVN(amount) {
  if (isNaN(amount)) return "0 ₫";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
}

export function getOrdersFromLocalStorage(userEmail) {
  if (!userEmail) return [];
  const key = `orders_${userEmail}`;
  try {
    const orders = JSON.parse(localStorage.getItem(key));
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export function saveOrdersToLocalStorage(userEmail, orders) {
  if (!userEmail || !Array.isArray(orders)) return;
  const key = `orders_${userEmail}`;
  localStorage.setItem(key, JSON.stringify(orders));
}

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

export function renderOrderItems(items = []) {
  return items
    .map((item) => {
      const name = item.name ?? "Không rõ";
      const specs = item.specs ? ` (${item.specs})` : "";
      const toppings =
        item.toppings?.length > 0
          ? `<br><small>Topping: ${item.toppings.join(", ")}</small>`
          : "";
      const price = item.price ?? 0;
      const toppingPrice = item.toppingPrice ?? 0;
      const quantity = item.quantity ?? 1;
      const total = (price + toppingPrice) * quantity;

      return `
        <li>
          <strong>${name}${specs}</strong> – Số lượng: ${quantity} – Đơn giá: ${formatCurrencyVN(
        price + toppingPrice
      )} – Thành tiền: ${formatCurrencyVN(total)}
          ${toppings}
        </li>
      `;
    })
    .join("");
}

export function generateInvoiceHtml(order, user) {
  const itemsHtml = (order.items || [])
    .map((item) => {
      const name = item.name ?? "Không rõ";
      const specs = item.specs ? ` (${item.specs})` : "";
      const toppings =
        item.toppings?.length > 0
          ? `<br><small>Topping: ${item.toppings.join(", ")}</small>`
          : "";
      const price = item.price ?? 0;
      const toppingPrice = item.toppingPrice ?? 0;
      const quantity = item.quantity ?? 1;
      const total = (price + toppingPrice) * quantity;

      return `
        <tr>
          <td>${name}${specs}${toppings}</td>
          <td>${quantity}</td>
          <td>${formatCurrencyVN(price + toppingPrice)}</td>
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
