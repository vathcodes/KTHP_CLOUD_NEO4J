import React, { useContext, useState, useEffect } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios';

const MyOrders = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);

    // Hàm đổi trạng thái sang tiếng Việt
    const translateStatus = (status) => {
        switch(status) {
            case "Food Processing":
                return "Đang Chế Biến";
            case "Out for delivery":
                return "Đang Giao Hàng";
            case "Delivered":
                return "Đã Giao";
            default:
                return status;
        }
    };

    const fetchOrders = async () => {
        const response = await axios.post(
            url + "/api/order/userorders",
            {},
            { headers: { token } }
        );
        setData(response.data.data);
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return(
        <div className='my-orders'>
            <h2>Đơn Hàng Của Tôi</h2>
            <div className="container">
                {data.map((order, index) => (
                    <div key={index} className='my-orders-order'>
                        <img src={assets.parcel_icon} alt="" />

                        {/* Hiển thị tất cả item, phân cách bằng dấu phẩy */}
                        <p>
                            {order.items
                                .map(item => `${item.name} x ${item.quantity}`)
                                .join(", ")
                            }
                        </p>

                        <p>{order.amount}$</p>
                        <p>Số món: {order.items.length}</p>

                        {/* Chuyển trạng thái sang tiếng Việt */}
                        <p><span>&#x25cf;</span> <b>{translateStatus(order.status)}</b></p>

                        <button onClick={fetchOrders}>
                            Theo Dõi Đơn Hàng
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyOrders;
 