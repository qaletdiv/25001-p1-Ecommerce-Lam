// ✅ checkout.js - Hoàn chỉnh + Có ghi chú + Tích điểm

import { products } from "./mock-data.js";
import { formatCurrencyVN, isLoggedIn, getCurrentUser } from "./utils.js";

// DOM Elements
const form = document.getElementById("checkout-form");
const successMessage = document.getElementById("success-message");
const subtotalEl = document.getElementById("summary-subtotal");
const shippingEl = document.getElementById("summary-shipping");
const totalEl = document.getElementById("summary-total");

// 1. Bảo vệ: Chưa login → đẩy qua login.html
if (!isLoggedIn()) {
  alert("Vui lòng đăng nhập để thanh toán.");
  window.location.href = "login.html";
}

// 2. Lấy user đang đăng nhập
const user = getCurrentUser();

// 3. Lấy giỏ hàng theo email
const cartKey = `cart_${user.email}`;
const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

// Nếu giỏ hàng rỗng thì báo và chuyển về trang giỏ hàng
if (cart.length === 0) {
  alert("Giỏ hàng của bạn đang trống.");
  window.location.href = "cart.html";
}

// 4. Flatten danh sách sản phẩm
const allProducts = products.flatMap((cat) => cat.list);

// 5. Tính tổng tiền hàng
function calculateSubtotal() {
  return cart.reduce((sum, item) => {
    const product = allProducts.find((p) => String(p.id) === String(item.id));
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

// Tính phí vận chuyển: Miễn phí nếu >= 500.000 VNĐ
function calculateShipping(subtotal) {
  return subtotal >= 500000 ? 0 : 30000;
}

// Render tổng tiền, phí vận chuyển, tổng thanh toán lên giao diện
function renderSummary() {
  const subtotal = calculateSubtotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  subtotalEl.textContent = formatCurrencyVN(subtotal);
  shippingEl.textContent = formatCurrencyVN(shipping);
  totalEl.textContent = formatCurrencyVN(total);
}

// Hiển thị thanh toán ngay khi trang được load
renderSummary();

// 6. Xử lý sự kiện submit form thanh toán
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();
  const payment = form.payment.value;

  // Kiểm tra thông tin đầy đủ
  if (!name || !email || !phone || !address) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  // Kiểm tra email phải trùng với tài khoản đang đăng nhập
  if (email.toLowerCase() !== user.email.toLowerCase()) {
    alert("Email không khớp với tài khoản đăng nhập.");
    return;
  }

  // Tính toán lại tổng tiền và phí vận chuyển
  const subtotal = calculateSubtotal();
  const shippingFee = calculateShipping(subtotal);
  const total = subtotal + shippingFee;

  // Chuẩn bị danh sách sản phẩm trong đơn hàng
  const orderItems = cart.map((item) => {
    const product = allProducts.find((p) => String(p.id) === String(item.id));
    return {
      id: item.id,
      quantity: item.quantity,
      name: product ? product.name : "Không xác định",
      price: product ? product.price : 0,
      specs: item.specs || product?.specs || null, // Thêm dòng này để lưu specs
    };
  });

  // Tạo đối tượng đơn hàng mới
  const order = {
    id: "order_" + Date.now(),
    userEmail: user.email,
    items: orderItems,
    shipping: { name, phone, address },
    paymentMethod: payment,
    subtotal,
    shippingFee,
    total,
    createdAt: new Date().toISOString(),
    paymentStatus: "Chờ thanh toán",
  };

  // Lấy danh sách đơn hàng cũ từ localStorage rồi thêm đơn hàng mới
  const orderKey = `orders_${user.email}`;
  const orders = JSON.parse(localStorage.getItem(orderKey)) || [];
  orders.push(order);
  localStorage.setItem(orderKey, JSON.stringify(orders));

  // 7. Tính và cập nhật điểm tích lũy cho user
  const pointsEarned = Math.floor(total / 10000); // 10.000đ = 1 điểm
  const updatedUser = {
    ...user,
    fullName: name, // Cập nhật lại họ tên
    phone,
    points: (user.points || 0) + pointsEarned, // Cập nhật điểm
  };
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  // 8. Xóa giỏ hàng sau khi đặt hàng thành công
  localStorage.removeItem(cartKey);

  // 9. Thông báo thành công
  successMessage.style.display = "block";

  // 10. Chuyển sang trang xác nhận đơn hàng sau 2 giây
  setTimeout(() => {
    window.location.href = `order-confirm.html?orderId=${order.id}`;
  }, 2000);
});
