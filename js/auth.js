// auth.js - Quản lý đăng ký, đăng nhập, đăng xuất người dùng

import { getGuestCart } from "./cart.js"; // Lấy giỏ hàng của khách

const usersKey = "users"; // Key lưu danh sách user trong localStorage

/**
 * Đăng ký người dùng mới
 * @param {Object} user gồm fullName, username, email, password
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

  users.push(user);
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

  return (
    users.find((u) => u.email === email && u.password === password) || null
  );
}

/**
 * Sau khi đăng nhập thành công:
 * - Lưu trạng thái đăng nhập
 * - Gộp dữ liệu từ cart_guest sang cart_user (nếu có)
 */
export function setLogin(user) {
  // Lưu trạng thái đăng nhập
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("userLoggedIn", "true");

  // Gộp giỏ hàng guest (nếu có)
  const guestCart = getGuestCart();
  const userCartKey = `cart_${user.email}`;
  let userCart = [];

  try {
    userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
  } catch {
    userCart = [];
  }

  // Gộp: nếu trùng sản phẩm thì cộng dồn số lượng
  guestCart.forEach((guestItem) => {
    const existingItem = userCart.find((item) => item.id === guestItem.id);
    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.push(guestItem);
    }
  });

  // Lưu lại giỏ hàng cho user
  localStorage.setItem(userCartKey, JSON.stringify(userCart));

  // Xoá giỏ hàng guest
  localStorage.removeItem("cart_guest");
}

/**
 * Đăng xuất user: xoá trạng thái đăng nhập
 */
export function logoutUser() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("currentUser");
}
