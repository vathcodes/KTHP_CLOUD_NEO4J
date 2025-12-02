import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, foodList, cartItems, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const SHIPPING_FEE = 2000;

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Việt Nam",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (getTotalCartAmount() === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    let orderItems = foodList
  .filter(item => cartItems[item.id.toString()] > 0)
  .map(item => ({
    id: item.id,
    quantity: cartItems[item.id.toString()],
  }));
  console.log("orderItems", orderItems);


    const orderData = {
      address: data,
      items: orderItems,
    };
    console.log("orderData", orderData);


    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      if (response.data.success) {
        const { payUrl } = response.data;

        // Dùng replace để không cho bấm "quay lại" về form đặt hàng
        window.location.replace(payUrl);
      } else {
        alert("Đặt hàng thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Không thể kết nối server. Vui lòng thử lại!");
    }
  };

  // Kiểm tra đăng nhập + giỏ hàng trống
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  const totalAmount = getTotalCartAmount() + SHIPPING_FEE;

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Thông Tin Giao Hàng</p>

        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="Tên"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Họ"
          />
        </div>

        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Đường / Số nhà"
        />

        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="Thành phố"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="Quận / Huyện"
          />
        </div>

        <div className="multi-fields">
          <input
            name="zipCode"
            onChange={onChangeHandler}
            value={data.zipCode}
            type="text"
            placeholder="Mã bưu điện (không bắt buộc)"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Quốc gia"
          />
        </div>

        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Số điện thoại"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Tổng Giỏ Hàng</h2>
          <div>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>{getTotalCartAmount().toLocaleString("vi-VN")} ₫</p>
            </div>
            <hr />

            <div className="cart-total-details">
              <p>Phí giao hàng</p>
              <p>{getTotalCartAmount() === 0 ? 0 : "2.000"} ₫</p>
            </div>
            <hr />

            <div className="cart-total-details">
              <b>Tổng cộng</b>
              <b>{totalAmount.toLocaleString("vi-VN")} ₫</b>
            </div>
          </div>

          <button type="submit" className="place-order-btn">
            THANH TOÁN QUA VNPAY
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;