import React, { useState } from "react";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.");
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="contact">
      <h2>📞 Liên hệ với chúng tôi</h2>
      <p className="contact-description">
        Nếu bạn có câu hỏi hoặc cần hỗ trợ, hãy gửi tin nhắn cho chúng tôi!
      </p>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Thông tin liên hệ</h3>
          <p><b>Địa chỉ:</b> 33 Xô Viết Nghệ Tĩnh, Đà Nẵng</p>
          <p><b>SĐT:</b> 0123 456 789</p>
          <p><b>Email:</b> support@aefood.com</p>

          <div className="contact-map">
            <iframe
              title="map"
              width="100%"
              height="250"
              loading="lazy"
              style={{ border: 0, borderRadius: "10px" }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.6440599728635!2d108.21872757558138!3d16.032034040431654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218389cf02c2b%3A0xbdc63233587e2d88!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyDEkMO0bmcgw4E!5e0!3m2!1svi!2s!4v1764591784077!5m2!1svi!2s"
            ></iframe>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Gửi tin nhắn</h3>

          <input
            type="text"
            name="name"
            placeholder="Tên của bạn"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email của bạn"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Nội dung tin nhắn..."
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button type="submit">Gửi liên hệ</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
