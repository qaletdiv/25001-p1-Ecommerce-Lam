import { products } from "./mock-data.js";

/**
 * 1. Lấy ID sản phẩm từ URL query string (?id=xxx)
 */
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/**
 * 2. Tìm sản phẩm trong dữ liệu theo ID
 * @param {string} id
 * @returns sản phẩm hoặc null nếu không tìm thấy
 */
function getProductById(id) {
  for (const category of products) {
    const product = category.list.find((item) => item.id === id);
    if (product) {
      // Trả về đối tượng sản phẩm kèm category để dùng hiển thị hoặc lọc
      return { ...product, category: category.category };
    }
  }
  return null;
}

/**
 * 3. Hiển thị chi tiết sản phẩm lên phần tử có id="product-detail"
 * @param {object} product
 */
function renderProductDetail(product) {
  const container = document.getElementById("product-detail");
  if (!container) return;

  container.innerHTML = `
    <div class="product-detail">
      <img src="${product.img}" alt="${product.name}" class="detail-img"/>
      <div class="detail-info">
        <h2>${product.name}</h2>
        <p>Giá: ${product.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        <p>Mô tả: ${product.description || "Đang cập nhật..."}</p>
        <!-- Nút Thêm vào giỏ hàng dùng onclick trực tiếp gọi hàm addToCart -->
        <button class="product-btn" onclick="addToCart('${
          product.id
        }')">Thêm vào giỏ</button>
      </div>
    </div>
  `;
}

/**
 * 4. Hiển thị sản phẩm liên quan (cùng danh mục) tối đa 4 sản phẩm,
 * loại trừ sản phẩm hiện tại (excludeId)
 * @param {string} category - tên danh mục
 * @param {string} excludeId - ID sản phẩm hiện tại để không hiển thị lại
 */
function renderRelatedProducts(category, excludeId) {
  const container = document.getElementById("related-products");
  if (!container) return;

  container.innerHTML = ""; // Xóa nội dung cũ nếu có

  // Tìm danh mục sản phẩm
  const currentCategory = products.find((cat) => cat.category === category);

  if (!currentCategory) return;

  // Lọc sản phẩm khác ID hiện tại, lấy tối đa 4 sản phẩm
  currentCategory.list
    .filter((p) => p.id !== excludeId)
    .slice(0, 4)
    .forEach((product) => {
      // Tạo thẻ div cho mỗi sản phẩm liên quan
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.img}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        <!-- Link tới chi tiết sản phẩm -->
        <a class="product-btn" href="product-detail.html?id=${
          product.id
        }">Xem chi tiết</a>
      `;
      container.appendChild(card);
    });
}

/**
 * 5. Hàm thêm sản phẩm vào giỏ hàng,
 * lưu vào localStorage dưới key "cart" (mảng {id, quantity})
 * Nếu đã có thì tăng số lượng
 * @param {string} productId
 */
window.addToCart = function (productId) {
  // Lấy giỏ hàng hiện tại từ localStorage hoặc tạo mới mảng rỗng
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity++; // Tăng số lượng nếu đã có
  } else {
    cart.push({ id: productId, quantity: 1 }); // Thêm mới nếu chưa có
  }

  // Lưu giỏ hàng cập nhật lại vào localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Hiển thị thông báo thêm thành công
  showAddNotification();
};

/**
 * 6. Hiển thị thông báo dạng toast (popup nhỏ) khi thêm sản phẩm vào giỏ hàng
 */
function showAddNotification() {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "Đã thêm sản phẩm vào giỏ hàng!";

  // Lấy container chứa toast, nếu chưa có thì tạo mới
  const container =
    document.getElementById("toast-container") || createToastContainer();

  container.appendChild(toast);

  // Tự động xóa toast sau 3 giây
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Tạo container chứa toast nếu chưa có trong DOM
 * @returns {HTMLElement} container mới tạo
 */
function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  document.body.appendChild(container);
  return container;
}

/**
 * 7. Chạy chương trình:
 * - Lấy ID sản phẩm từ URL
 * - Tìm sản phẩm trong dữ liệu
 * - Nếu có sản phẩm, hiển thị chi tiết và sản phẩm liên quan
 * - Nếu không, hiển thị thông báo không tìm thấy
 */
const productId = getProductIdFromURL();
const product = getProductById(productId);

if (product) {
  renderProductDetail(product);
  renderRelatedProducts(product.category, product.id);
} else {
  const container = document.getElementById("product-detail");
  if (container) {
    container.innerHTML = "<p>Sản phẩm không tồn tại.</p>";
  }
}
