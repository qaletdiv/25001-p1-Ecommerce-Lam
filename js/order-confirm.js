import { formatCurrencyVN, getParam, getCurrentUser } from "./utils.js";

// --- Lấy orderId từ URL ---
const orderId = getParam("orderId");

// --- Lấy thông tin user hiện tại ---
const user = getCurrentUser();
if (!user || !user.email) {
  alert("Bạn chưa đăng nhập!");
  window.location.href = "login.html";
}

// --- Lấy danh sách đơn hàng của user từ localStorage ---
const key = `orders_${user.email}`;
const orders = JSON.parse(localStorage.getItem(key)) || [];

// --- Tìm đơn hàng theo orderId ---
const order = orders.find((o) => o.id === orderId);

// --- Lấy thẻ container để hiển thị chi tiết ---
const container = document.getElementById("order-detail");

// --- Nếu không tìm thấy đơn hàng thì báo lỗi ---
if (!order) {
  container.innerHTML = "<p>Không tìm thấy đơn hàng.</p>";
} else {
  // --- Chuyển đổi thời gian đặt đơn sang dạng dễ đọc ---
  const dt = new Date(order.createdAt);

  // --- Render các thông tin đơn hàng ---
  container.innerHTML = `
    <p><strong>Mã đơn hàng:</strong> ${order.id || "Chưa cập nhật"}</p>
    <p><strong>Ngày đặt:</strong> ${dt.toLocaleString("vi-VN")}</p>
    <p><strong>Họ tên:</strong> ${order.shipping?.name || "Chưa cập nhật"}</p>
    <p><strong>Email:</strong> ${
      order.userEmail || user.email || "Chưa cập nhật"
    }</p>
    <p><strong>Số điện thoại:</strong> ${
      order.shipping?.phone || "Chưa cập nhật"
    }</p>
    <p><strong>Địa chỉ:</strong> ${
      order.shipping?.address || "Chưa cập nhật"
    }</p>
    <p><strong>Phương thức thanh toán:</strong> ${
      order.paymentMethod || "Chưa cập nhật"
    }</p>
    <h3>Sản phẩm:</h3>
  `;

  // --- Kiểm tra xem có sản phẩm trong đơn hay không ---
  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((item) => {
      // Lấy tên sản phẩm ưu tiên: item.name > item.productName > item.product?.name
      const name =
        item.name || item.productName || item.product?.name || "Chưa cập nhật";
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 1;
      const totalItem = price * quantity;

      // --- Xử lý specs nếu có ---
      let specsHtml = "";
      if (item.specs && typeof item.specs === "object") {
        specsHtml =
          "<ul class='specs-list' style='margin: 4px 0 10px 20px; padding-left: 0; list-style-type: disc; font-size: 0.9em; color: #555;'>";
        for (const [key, value] of Object.entries(item.specs)) {
          specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        specsHtml += "</ul>";
      }

      // Tạo thẻ div để hiển thị thông tin sản phẩm kèm specs
      const div = document.createElement("div");
      div.style.marginBottom = "12px";
      div.innerHTML = `
        ${name} — ${quantity} × ${formatCurrencyVN(price)} = ${formatCurrencyVN(
        totalItem
      )}
      ${specsHtml}
      `;
      container.appendChild(div);
    });
  } else {
    // Nếu không có sản phẩm trong đơn
    container.innerHTML += "<p>Không có sản phẩm trong đơn hàng.</p>";
  }

  // --- Hiển thị tổng thanh toán ---
  const totalDiv = document.createElement("p");
  totalDiv.style.fontWeight = "bold";
  totalDiv.innerHTML = `Tổng thanh toán: ${formatCurrencyVN(order.total || 0)}`;
  container.appendChild(totalDiv);
}

// --- Nút “Tiếp tục mua sắm” chuyển hướng về trang chính ---
document.getElementById("btn-back").addEventListener("click", () => {
  window.location.href = "index.html";
});
