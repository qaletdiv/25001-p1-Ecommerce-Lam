document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Bạn cần đăng nhập để xem tài khoản");
    window.location.href = "login.html";
    return;
  }
  renderNav();
  renderAccount(user);
  renderOrderHistory(user.username);
});

function renderNav() {
  // giống main.js
}

function renderAccount(user) {
  const container = document.getElementById("account-info");
  container.innerHTML = `
    <h2>Tài khoản của tôi</h2>
    <p><strong>Tên đăng nhập:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
  `;
}

function renderOrderHistory(username) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const his = orders.filter((o) => o.user === username);
  const container = document.getElementById("order-history");
  container.innerHTML = `<h3>Lịch sử đơn hàng</h3>`;
  if (his.length === 0) {
    container.innerHTML += `<p>Bạn chưa có đơn hàng nào.</p>`;
    return;
  }
  his.forEach((o) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>ID:</strong> ${o.id} — <strong>Ngày:</strong> ${o.date}</p>
      <p><strong>Tổng:</strong> ${o.total.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })}</p>
      <hr />
    `;
    container.appendChild(div);
  });
}
