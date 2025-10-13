// login.js - xử lý form đăng nhập

import { loginUser, setLogin } from "./auth.js";

const loginForm = document.getElementById("login");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Lấy email và mật khẩu từ form, trim email để tránh lỗi khoảng trắng
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  // Gọi hàm loginUser để kiểm tra user có hợp lệ không
  const user = loginUser(email, password);

  if (!user) {
    // Nếu không tìm thấy user hoặc sai mật khẩu, báo lỗi
    alert("Email hoặc mật khẩu không đúng!");
    return;
  }

  // Nếu đăng nhập thành công, lưu trạng thái đăng nhập và thông tin user
  setLogin(user);

  // Lấy URL chuyển hướng sau khi đăng nhập (nếu có), mặc định về trang chủ
  const redirect = localStorage.getItem("redirectAfterLogin") || "index.html";
  localStorage.removeItem("redirectAfterLogin");

  // Chuyển hướng người dùng đến trang mong muốn
  window.location.href = redirect;
});
