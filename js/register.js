// register.js

/**
 * Hàm đăng ký tài khoản mới
 * Kiểm tra các thông tin, lưu user vào localStorage
 */
function register() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (password !== confirmPassword) {
    alert("Mật khẩu xác nhận không khớp.");
    return;
  }

  // Lấy danh sách user hiện tại hoặc mảng rỗng
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Kiểm tra username đã tồn tại chưa
  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    alert("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
    return;
  }

  // Tạo user mới
  const newUser = { username, password };

  // Thêm user mới vào mảng
  users.push(newUser);

  // Lưu lại localStorage
  localStorage.setItem("users", JSON.stringify(users));

  alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");

  // Chuyển sang trang login
  window.location.href = "login.html";
}

// Lắng nghe submit form đăng ký
const form = document.getElementById("register");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  register();
});
