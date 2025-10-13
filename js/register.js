// register.js - xử lý form đăng ký người dùng

import { registerUser } from "./auth.js";

const registerForm = document.getElementById("register");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Lấy giá trị input, trim để loại bỏ khoảng trắng thừa
  const fullName = registerForm.fullName.value.trim();
  const username = registerForm.username.value.trim();
  const email = registerForm.email.value.trim();
  const password = registerForm.password.value;
  const confirmPassword = registerForm.confirmPassword.value;

  // Kiểm tra mật khẩu nhập lại có khớp không
  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  // Tạo object user mới
  const newUser = { fullName, username, email, password };

  try {
    // Gọi hàm đăng ký user
    registerUser(newUser);
    alert("Đăng ký thành công! Mời bạn đăng nhập.");
    // Chuyển sang trang đăng nhập sau khi đăng ký thành công
    window.location.href = "login.html";
  } catch (error) {
    // Nếu email đã tồn tại, thông báo lỗi
    alert(error.message);
  }
});
