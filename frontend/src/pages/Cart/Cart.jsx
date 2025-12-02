import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const SHIPPING_FEE = 2000; // phí ship cố định VND

  // Format VND trực tiếp
  const formatVND = (value) => Number(value).toLocaleString('vi-VN') + ' ₫';

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Hình Ảnh</p>
          <p>Tên</p>
          <p>Giá</p>
          <p>Số lượng</p>
          <p>Tổng cộng</p>
          <p>Xóa</p>
        </div>
        <br />
        <hr />
        {Object.keys(cartItems).map((itemId) => {
          const item = food_list.find(food => food._id === itemId);
          if (item && cartItems[itemId] > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item'>
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{formatVND(item.price)}</p>
                  <div className='cart-quantity'>
                    <button onClick={() => removeFromCart(itemId)}>-</button>
                    <span>{cartItems[itemId]}</span>
                    <button onClick={() => addToCart(itemId)}>+</button>
                  </div>
                  <p>{formatVND(item.price * cartItems[itemId])}</p>
                  <p onClick={() => removeFromCart(itemId)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Tổng tiền hóa đơn</h2>
          <div>
            <div className="cart-total-details">
              <p>Tổng giá món ăn</p>
              <p>{formatVND(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí giao hàng</p>
              <p>{getTotalCartAmount() === 0 ? formatVND(0) : formatVND(SHIPPING_FEE)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Tổng cộng</b>
              <b>{getTotalCartAmount() === 0 ? formatVND(0) : formatVND(getTotalCartAmount() + SHIPPING_FEE)}</b>
            </div>
          </div>
          <button onClick={() => navigate('/order')}>TIẾN HÀNH THANH TOÁN</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>Nếu bạn có mã khuyến mại, hãy nhập vào đây</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' />
              <button>Nhập</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
