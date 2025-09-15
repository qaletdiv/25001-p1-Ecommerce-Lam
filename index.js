import { products } from "./js/mock-data.js";
function renderProducts(nameTitle) {
  const titleProduct = document.createElement("h2");
  titleProduct.textContent = `Danh sách sản phẩm ${nameTitle}`;
  const productsListTitle = document.createElement("div");
  productsListTitle.classList.add("product-list");
  titleProduct.classList.add("title-product");
  const container = document.querySelector(".main-product");
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === nameTitle) {
      products[i].list.forEach((product) => {
        const card = document.createElement("div");
        card.classname = "product-card";
        card.innerHTML = `
    <img width="280" height="250" src="${product.img}" alt="${product.name}">
    <h3>${product.name}<h3>
    <p>${product.price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })}<p>
    <button class="product-btn"  onclick ="addToCart(${
      product.category
    })">Thêm vào giỏ</button>`;
        productsListTitle.appendChild(card);
      });
    }
  }
  container.appendChild(titleProduct);
  container.appendChild(productsListTitle);
}

renderProducts("Cà phê");
renderProducts("Trà sữa");
renderProducts("Matcha");
renderProducts("Trà trái cây");
