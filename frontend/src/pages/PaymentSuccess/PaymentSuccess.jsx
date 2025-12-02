// src/pages/PaymentSuccess.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (status === "success") {
      // Chuyển ngay về /myorders sau 2.5 giây (đủ để người dùng đọc tin nhắn)
      const timer = setTimeout(() => {
        navigate("/myorders", { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      alert("Thanh toán thất bại hoặc bị hủy!");
      navigate("/cart", { replace: true });
    }
  }, [status, navigate]);

  if (status !== "success") {
    return null; // tránh flash trang trắng khi thất bại
  }

  // Lấy 8 ký tự cuối của orderId để hiển thị đẹp
  const shortId = orderId ? orderId.slice(-8).toUpperCase() : "";

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 20px",
        backgroundColor: "#f8fff8",
      }}
    >
      <div style={{ fontSize: "80px", marginBottom: "20px" }}>
        Checkmark
      </div>
      <h1 style={{ color: "#28a745", fontSize: "2.5rem", margin: "20px 0" }}>
        Thanh toán thành công!
      </h1>
      <p style={{ fontSize: "1.4rem", color: "#333", margin: "10px 0" }}>
        Cảm ơn bạn đã đặt hàng tại <strong>CO - Food</strong>
      </p>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>
        Mã đơn hàng: <strong style={{ color: "#e74c3c" }}>#{shortId}</strong>
      </p>
      <p style={{ marginTop: "30px", color: "#666" }}>
        Đang chuyển đến trang đơn hàng của bạn...
      </p>
    </div>
  );
};

export default PaymentSuccess;