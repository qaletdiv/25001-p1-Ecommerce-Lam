// login.js

/**
 * Hàm đăng nhập
 * Lấy dữ liệu từ form, chuẩn hóa username, so khớp với dữ liệu users trong localStorage
 */
function login() {
  const username = document
    .getElementById("username")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("password").value;

  // Lấy danh sách người dùng đã đăng ký (mảng user objects)
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Tìm user trùng username & password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Lưu toàn bộ thông tin user vào localStorage dưới dạng chuỗi JSON
    localStorage.setItem("currentUser", JSON.stringify(user));
    // Đánh dấu đã đăng nhập thành công
    localStorage.setItem("userLoggedIn", "true");

    alert("Đăng nhập thành công!");

    // Lấy URL redirect sau khi login (nếu có), ưu tiên query param ?redirect=...
    const params = new URLSearchParams(window.location.search);
    const redirectTo =
      params.get("redirect") ||
      localStorage.getItem("redirectAfterLogin") ||
      "index.html";

    // Xóa redirect để tránh redirect sai lần sau
    localStorage.removeItem("redirectAfterLogin");

    // Chuyển hướng đến trang mong muốn
    window.location.href = redirectTo;
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
}

/**
 * Hàm kiểm tra trạng thái đăng nhập ở các trang khác
 * Nếu chưa đăng nhập sẽ lưu trang hiện tại để redirect lại và chuyển đến trang login
 * Trả về true nếu đã đăng nhập, false nếu chưa
 */
export function checkLogin() {
  if (localStorage.getItem("userLoggedIn") !== "true") {
    localStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname.split("/").pop()
    );
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Xử lý submit form đăng nhập
const form = document.getElementById("login");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  login();
});
