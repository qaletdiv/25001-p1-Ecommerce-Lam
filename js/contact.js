// Lắng nghe sự kiện gửi form
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Ngừng form gửi dữ liệu mặc định

    // Lấy dữ liệu từ form
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Kiểm tra các trường nhập liệu
    if (name === "" || email === "" || message === "") {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Giả lập gửi dữ liệu (có thể thay thế bằng API thực tế)
    setTimeout(() => {
      document.getElementById("success-message").classList.remove("hidden");
      document.getElementById("contact-form").reset(); // Làm sạch form
    }, 1000);

    // Bạn có thể thay thế đoạn code này để gửi form thật sự, ví dụ bằng cách gọi API.
  });
