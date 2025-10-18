import { products } from "./mock-data.js";

// Lấy ID sản phẩm từ URL (?id=xxx)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Gộp tất cả sản phẩm từ các danh mục thành 1 mảng phẳng,
// đồng thời gán thêm trường category để tiện lọc
const allProducts = products.flatMap((cat) =>
  cat.list.map((item) => ({ ...item, category: cat.category }))
);

// Lấy danh sách topping từ danh mục "Topping"
const toppingList =
  products.find((cat) => cat.category === "Topping")?.list || [];

// Tìm sản phẩm theo ID lấy từ URL
const product = allProducts.find((p) => p.id === productId);

// Nếu không tìm thấy sản phẩm
if (!product) {
  document.getElementById("product-detail").innerHTML =
    "<p>Không tìm thấy sản phẩm.</p>";
} else {
  renderProductDetail(product);
  renderRelatedProducts(product.category, product.id);
  renderCartSummary(); // Hiển thị tổng số sản phẩm trong giỏ (nếu có)
}

/**
 * Hiển thị chi tiết sản phẩm
 * @param {object} p sản phẩm
 */
function renderProductDetail(p) {
  const container = document.getElementById("product-detail");

  const images = p.images && p.images.length > 0 ? p.images : [p.img];

  container.innerHTML = `
    <div class="detail-container">
      <div class="detail-image">
        <img src="${images[0]}" alt="${
    p.name
  }" id="main-product-image" class="main-image"/>
        <div class="image-slider">
          ${images
            .map(
              (img, index) => `
              <img src="${img}" alt="Ảnh ${index + 1}" class="thumb-image" />
            `
            )
            .join("")}
        </div>
      </div>
      <div class="detail-info">
        <h2>${p.name}</h2>
        <p><strong>Giá:</strong> ${p.price.toLocaleString("vi-VN")} đ</p>
        <p><strong>Mô tả:</strong> ${p.description}</p>

        <p><strong>Thông số kỹ thuật:</strong></p>
        <form id="specs-form">
          ${Object.keys(p.specs)
            .map(
              (key) => `
                <label for="spec-${key}" class="spec-label">${key}:</label>
                <select id="spec-${key}" name="${key}" class="spec-select">
                  ${p.specs[key]
                    .map((opt) => `<option value="${opt}">${opt}</option>`)
                    .join("")}
                </select>
              `
            )
            .join("")}

          <label for="spec-topping">Topping:</label>
          <select id="spec-topping" name="Topping" class="spec-select" multiple size="5" style="width: 100%; padding: 8px;">
            ${toppingList
              .map((t) => `<option value="${t.name}">${t.name}</option>`)
              .join("")}
          </select>
          <small>Kéo giữ để chọn nhiều Topping</small>
        </form>

        <label for="quantity">Số lượng:</label>
        <input type="number" id="quantity" value="1" min="1" />

        <button id="add-to-cart-btn">Thêm vào giỏ hàng</button>
      </div>
    </div>
  `;

  // Đổi ảnh lớn khi click ảnh nhỏ
  const mainImage = document.getElementById("main-product-image");
  const thumbnails = container.querySelectorAll(".thumb-image");
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
    });
  });

  // Bắt sự kiện nút thêm vào giỏ hàng
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const quantity = parseInt(document.getElementById("quantity").value);
    const isLogin = localStorage.getItem("userLoggedIn") === "true";

    if (!isLogin) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      window.location.href = "login.html";
      return;
    }

    // Lấy thông số kỹ thuật đã chọn
    const specsForm = document.getElementById("specs-form");
    const selectedSpecs = {};

    for (const element of specsForm.elements) {
      if (element.tagName === "SELECT" && element.multiple === false) {
        selectedSpecs[element.name] = element.value;
      }
      if (element.tagName === "SELECT" && element.multiple) {
        const selectedToppings = Array.from(element.selectedOptions).map(
          (o) => o.value
        );
        selectedSpecs[element.name] = selectedToppings;
      }
    }

    addToCart(p.id, quantity, selectedSpecs);
  });
}

/**
 * Thêm sản phẩm vào giỏ hàng trong localStorage
 * @param {string} productId
 * @param {number} qty
 * @param {object} selectedSpecs
 */
function addToCart(productId, qty, selectedSpecs = {}) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.email) {
    alert("Bạn chưa đăng nhập.");
    window.location.href = "login.html";
    return;
  }

  const cartKey = `cart_${user.email}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  // Kiểm tra đã có sản phẩm với specs giống hệt chưa
  const found = cart.find(
    (item) =>
      item.id === productId &&
      JSON.stringify(item.specs || {}) === JSON.stringify(selectedSpecs)
  );

  if (found) {
    found.quantity += qty;
  } else {
    cart.push({ id: productId, quantity: qty, specs: selectedSpecs });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  showToast("✅ Đã thêm vào giỏ hàng!");
  renderCartSummary(); // Cập nhật lại số lượng giỏ hàng hiển thị
}

/**
 * Hiển thị toast thông báo
 * @param {string} message
 */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  const container =
    document.getElementById("toast-container") || createToastContainer();
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Tạo container toast nếu chưa có
 */
function createToastContainer() {
  const div = document.createElement("div");
  div.id = "toast-container";
  document.body.appendChild(div);
  return div;
}

/**
 * Hiển thị danh sách sản phẩm liên quan (cùng danh mục)
 * @param {string} category
 * @param {string} excludeId
 */
function renderRelatedProducts(category, excludeId) {
  const related = allProducts.filter(
    (p) => p.category === category && p.id !== excludeId
  );

  // Chọn ngẫu nhiên 4 sản phẩm
  const selected = related.sort(() => 0.5 - Math.random()).slice(0, 4);

  const container = document.getElementById("related-products");
  container.innerHTML = "";

  selected.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}" width="280" height="250" />
      <h3>${p.name}</h3>
      <p>${p.price.toLocaleString("vi-VN")} đ</p>
      <a href="product-detail.html?id=${
        p.id
      }" class="product-btn">Xem chi tiết</a>
    `;
    container.appendChild(div);
  });
}

/**
 * Hiển thị tổng số sản phẩm trong giỏ hàng (cập nhật UI)
 * Bạn nên có 1 phần tử <span id="cart-count"></span> để hiển thị
 */
function renderCartSummary() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.email) {
    updateCartCount(0);
    return;
  }
  const cartKey = `cart_${user.email}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  // Tổng số lượng sản phẩm
  const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
  updateCartCount(totalQty);
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng trên UI
 * @param {number} count
 */
function updateCartCount(count) {
  const el = document.getElementById("cart-count");
  if (!el) return; // Nếu không có phần tử này thì thôi
  el.textContent = count;
}
