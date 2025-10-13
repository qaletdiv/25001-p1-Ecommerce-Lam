import { products } from "./mock-data.js";

// Lấy ID sản phẩm từ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Gộp tất cả sản phẩm từ các danh mục
const allProducts = products.flatMap((cat) =>
  cat.list.map((item) => ({ ...item, category: cat.category }))
);

// Lấy danh sách topping từ danh mục "Topping"
const toppingList =
  products.find((cat) => cat.category === "Topping")?.list || [];

// Tìm sản phẩm theo ID
const product = allProducts.find((p) => p.id === productId);

// Nếu không tìm thấy sản phẩm
if (!product) {
  document.getElementById("product-detail").innerHTML =
    "<p>Không tìm thấy sản phẩm.</p>";
} else {
  renderProductDetail(product);
  renderRelatedProducts(product.category, product.id);
}

// ✅ Hàm hiển thị sản phẩm chi tiết
function renderProductDetail(p) {
  const container = document.getElementById("product-detail");

  // Render HTML giao diện sản phẩm
  container.innerHTML = `
    <div class="detail-container">
      <div class="detail-image">
        <img src="${p.img}" alt="${p.name}" />
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

  // Sự kiện nút "Thêm vào giỏ hàng"
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const quantity = parseInt(document.getElementById("quantity").value);
    const isLogin = localStorage.getItem("userLoggedIn") === "true";

    if (!isLogin) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      window.location.href = "login.html";
      return;
    }

    // Lấy thông số kỹ thuật người dùng đã chọn
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

    // Gọi hàm thêm vào giỏ hàng
    addToCart(p.id, quantity, selectedSpecs);
  });
}

// ✅ Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId, qty, selectedSpecs = {}) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.email) {
    alert("Bạn chưa đăng nhập.");
    window.location.href = "login.html";
    return;
  }

  const cartKey = `cart_${user.email}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  // Kiểm tra xem sản phẩm + specs đã có trong giỏ chưa
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
}

// ✅ Hàm hiển thị toast
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

// Tạo khối toast-container nếu chưa có
function createToastContainer() {
  const div = document.createElement("div");
  div.id = "toast-container";
  document.body.appendChild(div);
  return div;
}

// ✅ Hiển thị các sản phẩm liên quan
function renderRelatedProducts(category, excludeId) {
  const related = allProducts.filter(
    (p) => p.category === category && p.id !== excludeId
  );
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
