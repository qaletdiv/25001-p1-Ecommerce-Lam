import { products } from "./mock-data.js";

// --- Lấy giỏ hàng từ localStorage ---
// Nếu không có giỏ hàng thì trả về mảng rỗng
function getCart() {
  const c = localStorage.getItem("cart");
  return c ? JSON.parse(c) : [];
}

// --- Tìm sản phẩm theo id từ dữ liệu gốc (mock-data) ---
function getProductById(id) {
  for (const category of products) {
    const found = category.list.find((p) => String(p.id) === String(id));
    if (found) return found;
  }
  return null;
}

// --- Tính toán subtotal, phí vận chuyển, tổng tiền ---
// Phí vận chuyển cố định 30,000 nếu subtotal > 0
function calculateSummary() {
  const cart = getCart();
  let subtotal = 0;
  cart.forEach((item) => {
    const prod = getProductById(item.id);
    if (prod) {
      subtotal += prod.price * item.quantity;
    }
  });
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// --- Hàm định dạng số sang tiền VND ---
function formatVND(num) {
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// --- Hiển thị tóm tắt đơn hàng lên UI ---
function renderSummary() {
  const { subtotal, shipping, total } = calculateSummary();
  document.getElementById("summary-subtotal").textContent = formatVND(subtotal);
  document.getElementById("summary-shipping").textContent = formatVND(shipping);
  document.getElementById("summary-total").textContent = formatVND(total);
}

// --- Xử lý sự kiện submit form khi khách hàng xác nhận đơn hàng ---
function handleCheckout(event) {
  event.preventDefault();

  // Lấy giá trị input người dùng nhập
  const name = document.getElementById("input-name").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const phone = document.getElementById("input-phone").value.trim();
  const address = document.getElementById("input-address").value.trim();
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  // Kiểm tra dữ liệu có đầy đủ không
  if (!name || !email || !phone || !address) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  // Lấy tổng tiền từ giỏ hàng
  const { subtotal, shipping, total } = calculateSummary();

  // Nếu giỏ hàng trống thì không thể thanh toán
  if (subtotal === 0) {
    alert("Giỏ hàng của bạn đang trống.");
    return;
  }

  // Tạo đối tượng đơn hàng
  const orderObj = {
    name,
    email,
    phone,
    address,
    paymentMethod,
    subtotal,
    shipping,
    total,
    date: new Date().toISOString(),
  };

  // Lưu đơn hàng vào localStorage
  const existing = JSON.parse(localStorage.getItem("orders") || "[]");
  existing.push(orderObj);
  localStorage.setItem("orders", JSON.stringify(existing));

  // Xóa giỏ hàng sau khi đặt hàng thành công
  localStorage.removeItem("cart");

  // Hiển thị thông báo thành công
  const successMessage = document.getElementById("success-message");
  successMessage.style.display = "block";

  // Cập nhật lại tóm tắt đơn hàng (giỏ hàng trống)
  renderSummary();

  // Ẩn thông báo sau 4 giây
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 4000);

  // Reset form sau khi thanh toán
  document.getElementById("checkout-form").reset();
}

// --- Khởi tạo khi script được tải ---
// Gọi render hiển thị tóm tắt đơn hàng
renderSummary();

// Thêm sự kiện click vào nút xác nhận đặt hàng
document
  .getElementById("checkout-btn")
  .addEventListener("click", handleCheckout);
