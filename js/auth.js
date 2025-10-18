// auth.js - Quản lý đăng ký, đăng nhập, đăng xuất người dùng

import { getGuestCart } from "./cart.js"; // Lấy giỏ hàng của khách

const usersKey = "users"; // Key lưu danh sách user trong localStorage

/**
 * Đăng ký người dùng mới
 * @param {Object} user gồm fullName, username, email, password, (có thể phone)
 * @throws nếu email đã tồn tại
 */
export function registerUser(user) {
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(usersKey)) || [];
  } catch {
    users = [];
  }

  // Kiểm tra email trùng
  if (users.some((u) => u.email === user.email)) {
    throw new Error("Email đã tồn tại");
  }

  // Thêm các trường mặc định nếu chưa có
  const newUser = {
    phone: user.phone || "", // nếu không có phone thì mặc định rỗng
    points: 0, // mặc định điểm tích lũy = 0
    ...user, // gộp thêm các field khác (fullName, email, ...)
  };

  users.push(newUser);
  localStorage.setItem(usersKey, JSON.stringify(users));
}

/**
 * Đăng nhập người dùng bằng email và password
 * @returns user nếu đúng, null nếu sai
 */
export function loginUser(email, password) {
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(usersKey)) || [];
  } catch {
    users = [];
  }

  // Tìm user có email + password khớp
  return (
    users.find((u) => u.email === email && u.password === password) || null
  );
}

/**
 * Sau khi đăng nhập thành công:
 * - Lưu trạng thái đăng nhập (userLoggedIn = true)
 * - Lưu user hiện tại vào localStorage (currentUser)
 * - Gộp giỏ hàng từ guest sang user
 */
export function setLogin(user) {
  // Đảm bảo user có phone và points (nếu thiếu thì thêm mặc định)
  const userWithDefaults = {
    phone: user.phone || "",
    points: user.points || 0,
    ...user,
  };

  // Lưu user hiện tại
  localStorage.setItem("currentUser", JSON.stringify(userWithDefaults));
  localStorage.setItem("userLoggedIn", "true");

  // ===== GỘP GIỎ HÀNG =====
  const guestCart = getGuestCart(); // cart_guest
  const userCartKey = `cart_${user.email}`;

  let userCart = [];
  try {
    userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
  } catch {
    userCart = [];
  }

  // Gộp cart: nếu trùng sản phẩm thì cộng dồn số lượng
  guestCart.forEach((guestItem) => {
    const existingItem = userCart.find((item) => item.id === guestItem.id);

    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.push(guestItem);
    }
  });

  // Lưu lại cart cho user
  localStorage.setItem(userCartKey, JSON.stringify(userCart));

  // Xoá giỏ hàng của khách
  localStorage.removeItem("cart_guest");
}

/**
 * Đăng xuất người dùng: xóa trạng thái đăng nhập
 */
export function logoutUser() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("currentUser");
}

/**
 * Cập nhật thông tin user
 * @param {Object} updatedUser bắt buộc phải có email để xác định user
 */
export function updateUser(updatedUser) {
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(usersKey)) || [];
  } catch {
    users = [];
  }

  // Tìm và cập nhật user
  users = users.map((u) =>
    u.email === updatedUser.email ? { ...u, ...updatedUser } : u
  );

  // Lưu danh sách user mới
  localStorage.setItem(usersKey, JSON.stringify(users));

  // Nếu đang đăng nhập với user này thì cập nhật currentUser luôn
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  if (currentUser.email === updatedUser.email) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...currentUser, ...updatedUser })
    );
  }
}
