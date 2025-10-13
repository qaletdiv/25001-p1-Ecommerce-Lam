import { products } from "./mock-data.js"; // Import danh sách sản phẩm từ file tĩnh

/**
 * Khởi tạo dữ liệu ban đầu vào localStorage nếu chưa có.
 * Điều này đảm bảo rằng dữ liệu như sản phẩm, người dùng, trạng thái đăng nhập được lưu trữ sẵn khi lần đầu sử dụng.
 */
function initData() {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(products)); // Lưu trữ danh sách sản phẩm vào localStorage nếu chưa có
  }
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([])); // Lưu trữ danh sách người dùng nếu chưa có
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", ""); // Lưu trữ thông tin người dùng hiện tại nếu chưa có
  }
  if (!localStorage.getItem("userLoggedIn")) {
    localStorage.setItem("userLoggedIn", "false"); // Lưu trữ trạng thái đăng nhập nếu chưa có
  }
}

/**
 * Render các sản phẩm thuộc danh mục nameTitle vào phần .main-product
 * Hàm này giúp hiển thị các sản phẩm theo từng danh mục, mỗi sản phẩm sẽ có nút "Thêm vào giỏ" hoặc "Tuỳ chỉnh" nếu có.
 *
 * @param {string} nameTitle - Tên danh mục sản phẩm (ví dụ: "Cà phê", "Trà sữa", v.v.)
 */
function renderProducts(nameTitle) {
  const container = document.querySelector(".main-product"); // Tìm phần tử chứa sản phẩm trên trang
  if (!container) {
    console.error("Element .main-product không tìm thấy trong HTML");
    return;
  }

  // Tạo tiêu đề danh mục sản phẩm
  const titleProduct = document.createElement("h2");
  titleProduct.textContent = `Danh sách sản phẩm: ${nameTitle}`;
  titleProduct.classList.add("title-product");

  const productsListTitle = document.createElement("div");
  productsListTitle.classList.add("product-list");

  // Tìm danh mục sản phẩm theo tên
  const categoryObj = products.find((cat) => cat.category === nameTitle);
  if (!categoryObj) {
    container.innerHTML += `<p>Không tìm thấy danh mục sản phẩm: ${nameTitle}</p>`;
    return;
  }

  // Render các sản phẩm trong danh mục
  categoryObj.list.forEach((product) => {
    if (
      !product ||
      typeof product.price !== "number" ||
      !product.name ||
      !product.img
    ) {
      console.warn("Sản phẩm không hợp lệ:", product);
      return;
    }

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img width="280" height="250" src="${product.img}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${
        !isNaN(product.price)
          ? Number(product.price).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          : "Liên hệ"
      }</p>
      <button class="product-btn" data-id="${product.id}" data-customizable="${
      product.customizable
    }">
        Thêm vào giỏ
      </button>
    `;

    const btn = card.querySelector(".product-btn");
    // Xử lý sự kiện khi người dùng nhấn nút "Thêm vào giỏ"
    btn.addEventListener("click", () => {
      const isLogin = localStorage.getItem("userLoggedIn") === "true";
      if (!isLogin) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        window.location.href = "login.html";
        return;
      }

      // Nếu sản phẩm có tùy chỉnh, chuyển đến trang chi tiết sản phẩm
      if (product.customizable) {
        window.location.href = `product-detail.html?id=${product.id}`;
      } else {
        // Nếu không có tùy chỉnh, trực tiếp thêm vào giỏ hàng
        addToCart(product.id);
      }
    });

    productsListTitle.appendChild(card);
  });

  container.appendChild(titleProduct);
  container.appendChild(productsListTitle);
}

/**
 * Các hàm giỏ hàng
 */
function getCartKey() {
  const currentUserRaw = localStorage.getItem("currentUser");
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
  // Sử dụng email của người dùng làm key cho giỏ hàng (nếu đã đăng nhập), nếu không sử dụng "cart_guest"
  return currentUser ? `cart_${currentUser.email}` : "cart_guest";
}

function getCart() {
  const cartKey = getCartKey();
  const cartRaw = localStorage.getItem(cartKey);
  try {
    return cartRaw ? JSON.parse(cartRaw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount(); // Cập nhật lại số lượng giỏ hàng
}

function updateCartCount() {
  const cartCountElem = document.getElementById("cart-count");
  if (!cartCountElem) {
    console.warn("Không tìm thấy element #cart-count");
    return;
  }
  const cart = getCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity > 0) {
    cartCountElem.style.display = "inline-block";
    cartCountElem.textContent = totalQuantity;
  } else {
    cartCountElem.style.display = "none";
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * Khi sản phẩm được thêm vào giỏ hàng, sẽ kiểm tra nếu sản phẩm có tùy chỉnh hay không
 */
function addToCart(productId) {
  const cart = getCart();
  const product = products
    .flatMap((cat) => cat.list)
    .find((p) => p.id === productId);

  if (!product) return;

  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    // Nếu sản phẩm có tùy chỉnh, sẽ không lưu thông số kỹ thuật ở đây
    cart.push({
      id: productId,
      quantity: 1,
      specs: product.customizable ? {} : null,
    });
  }

  saveCart(cart); // Lưu lại giỏ hàng và render lại giỏ hàng
  showAddNotification();
}

/**
 * Hiển thị thông báo nhỏ dạng toast
 */
function showAddNotification(message = "Đã thêm sản phẩm vào giỏ hàng") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "1000";
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background = "rgba(0,0,0,0.7)";
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.marginTop = "10px";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  toast.style.fontSize = "14px";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Tìm kiếm sản phẩm theo tên
 */
function searchProducts() {
  const input = document.getElementById("searchInput");
  if (!input) {
    console.warn("Không tìm thấy #searchInput");
    return;
  }
  const text = input.value.toLowerCase();
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const nameElem = card.querySelector("h3");
    if (nameElem) {
      const nm = nameElem.textContent.toLowerCase();
      card.style.display = nm.includes(text) ? "" : "none";
    }
  });
}

/**
 * Gắn sự kiện cho nút tìm kiếm
 */
const btnSearch = document.querySelector(".search-btn");
if (btnSearch) {
  btnSearch.addEventListener("click", searchProducts);
}

/**
 * Kiểm tra đăng nhập khi nhấn vào giỏ hàng
 */
const cartLink = document.querySelector(".cart-link");
if (cartLink) {
  cartLink.addEventListener("click", (e) => {
    const isLogin = localStorage.getItem("userLoggedIn") === "true";
    if (!isLogin) {
      e.preventDefault();
      alert("Vui lòng đăng nhập để xem giỏ hàng");
      window.location.href = "login.html";
    }
  });
}

/**
 * Khi DOM loaded, tiến hành khởi tạo dữ liệu, render sản phẩm và cập nhật giỏ hàng
 */
document.addEventListener("DOMContentLoaded", () => {
  initData(); // Khởi tạo dữ liệu nếu chưa có
  renderProducts("Cà phê");
  renderProducts("Trà sữa");
  renderProducts("Matcha");
  renderProducts("Trà trái cây");
  renderProducts("Topping");

  updateCartCount(); // Cập nhật số lượng giỏ hàng khi tải trang

  const isLogin = localStorage.getItem("userLoggedIn") === "true";
  const accountMenu = document.getElementById("account-menu");
  const accountLink = document.getElementById("account-link");

  if (accountMenu && accountLink) {
    if (isLogin) {
      accountMenu.innerHTML = `
        <div class="account-dropdown">
          <a href="account.html" id="account-link">Tài khoản của tôi</a> |
          <a href="#" id="logout-link">Đăng xuất</a>
        </div>
      `;
      const logoutLink = document.getElementById("logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.setItem("userLoggedIn", "false");
          localStorage.removeItem("currentUser");
          location.reload();
        });
      }
    } else {
      accountLink.textContent = "Đăng nhập";
      accountLink.href = "login.html";
    }
  } else {
    console.warn("Không tìm thấy account-menu hoặc account-link");
  }
});
