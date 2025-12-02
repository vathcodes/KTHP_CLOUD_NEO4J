import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, foodList, addToCart, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const SHIPPING_FEE = 2000; // phí ship cố định VND

  // Format VND
  const formatVND = (value) => Number(value).toLocaleString('vi-VN') + ' ₫';

  // Lấy danh sách item thực tế hiển thị trong cart
  const cartDisplayItems = Object.keys(cartItems)
    .map(itemId => {
      const item = foodList.find(food => food.id.toString() === itemId.toString());
      if (item && cartItems[itemId] > 0) {
        return { ...item, quantity: cartItems[itemId] };
      }
      return null;
    })
    .filter(Boolean);

  if (foodList.length === 0) return <p>Đang tải món ăn...</p>;
  if (cartDisplayItems.length === 0) return <p>Giỏ hàng trống.</p>;

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
        <hr />

        {cartDisplayItems.map(item => (
          <div key={item.id} className='cart-items-title cart-items-item'>
        <div className="cart-img-wrapper">
  <img src={url + "/images/" + item.image} alt={item.name} />
</div>

            <div className="cart-item-name">{item.name}</div>
            <p>{formatVND(item.price)}</p>
            <div className='cart-quantity'>
              <button onClick={() => removeFromCart(item.id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => addToCart(item.id)}>+</button>
            </div>
            <p>{formatVND(item.price * item.quantity)}</p>
            <p onClick={() => removeFromCart(item.id)} className='cross'>x</p>
            <hr />
          </div>
        ))}
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
