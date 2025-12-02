import React from "react";
import "./AppDowload.css";
import { assets } from "../../assets/assets"; // logo app hoặc icon iOS/Android

const AppDownload = () => {
  return (
    <div className="app-download-page">
      <header className="app-download-header">
        <h1>Tải ứng dụng AE Food</h1>
        <p>Trải nghiệm đặt món nhanh chóng và tiện lợi ngay trên điện thoại của bạn.</p>
      </header>

      <section className="download-section" id="download-links">
        <div className="download-card">
          <img src={assets.app_store} alt="iOS" />
          <h3>iOS</h3>
          <p>Tải ứng dụng trên App Store</p>
          <a href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer">
            Tải ngay
          </a>
        </div>

        <div className="download-card">
          <img src={assets.play_store} alt="Android" />
          <h3>Android</h3>
          <p>Tải ứng dụng trên Google Play</p>
          <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
            Tải ngay
          </a>
        </div>
      </section>

      <section className="features-section" id="app-features">
        <h2>Tính năng nổi bật</h2>
        <ul>
          <li>Đặt món nhanh chóng, giao tận nơi</li>
          <li>Thanh toán trực tuyến an toàn</li>
          <li>Nhận thông báo khuyến mại và ưu đãi</li>
          <li>Theo dõi đơn hàng real-time</li>
        </ul>
      </section>
    </div>
  );
};

export default AppDownload;
