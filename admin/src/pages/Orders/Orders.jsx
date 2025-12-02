// import React from 'react'
// import './Orders.css'
// import { useState } from 'react'
// import { toast } from 'react-toastify'
// import { useEffect } from 'react'
// import axios from 'axios'
// import { assets } from '../../assets/assets'


// const Orders = ({url}) => {

//   const [orders,setOrders] = useState([]);

//   const fetchAllOrders = async()=>{
//     const response = await axios.get(url+"/api/order/list");
//     if(response.data.success){
//       setOrders(response.data.data);
//       console.log(response.data.data);
      
//     }
//     else{
//       toast.error("Error")
//     }
//   }

//   const statusHandler = async(event,orderId)=>{
//     const response = await axios.post(url+"/api/order/status",{
//       orderId,
//       status: event.target.value
//     })
//     if (response.data.success) {
//       await fetchAllOrders();
//     }
//   }


//   useEffect(()=>{
//     fetchAllOrders();
//   },[])

//   return (
//     <div className='order add'>
//       <h3>Order Page</h3>
//       <div className="order-list">
//         {orders.map((order,index)=>(
//           <div key={index} className='order-item'>
//             <img src={assets.parcel_icon} alt="" />
//             <div>
//               <p className='order-item-food'>
//                   {order.items.map((item,index)=>{
//                     if (index===order.items.length-1) {
//                       return item.name + " x " + item.quantity
//                     }
//                     else{
//                       return item.name + " x " + item.quantity + ", "
//                     }
//                   })}
//               </p>
//               <p className='order-item-name'>{order.address.firstName+" "+order.address.lastName}</p>
//               <div className="order-item-address">
//                 <p>{order.address.street+","}</p>
//                 <p>{order.address.city+", "+order.address.state+", "+order.address.country+", "+order.address.zipCode}</p>
//               </div>
//               <p className='order-item-phone'>{order.address.phone}</p>
//             </div>
//             <p>Items : {order.items.length}</p>
//             <p>${order.amount}</p>
//             <select onChange={(event)=>statusHandler(event,order._id)} value={order.status}>
//               <option value="Food Processing">Food Processing</option>
//               <option value="Out for delivery">Out for delivery</option>
//               <option value="Delivered">Delivered</option>
//             </select>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default Orders











import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) setOrders(response.data.data);
      else toast.error("Có lỗi xảy ra");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/update-status", {
        orderId,
        status: event.target.value
      });
      if (response.data.success) await fetchAllOrders();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const fullName = (order.address.firstName + " " + order.address.lastName).toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // format VND trực tiếp
  const formatVND = (value) => {
    return Number(value).toLocaleString('vi-VN') + " ₫";
  };

  return (
    <div className='order add'>
      <h3>Trang Đơn Hàng</h3>

      <input
        type="text"
        placeholder="Tìm theo tên..."
        className="order-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="order-list">
        {filteredOrders.map((order, index) => (
          <div key={index} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className='order-item-food'>
              {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                idx === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              ))}
            </p>


              <p className='order-item-name'>
  {order.address?.firstName && order.address?.lastName 
    ? `${order.address.firstName} ${order.address.lastName}`
    : "Khách lẻ"}
</p>

<div className="order-item-address">
  <p>{order.address?.street || "Chưa có địa chỉ"},</p>
  <p>
    {[
      order.address?.city,
      order.address?.state,
      order.address?.country,
      order.address?.zipCode
    ].filter(Boolean).join(", ") || "Chưa có địa chỉ chi tiết"}
  </p>
</div>

<p className='order-item-phone'>{order.address?.phone || "Không có SĐT"}</p>
            </div>

            <p>Số món: {order.items.length}</p>
            <p>{formatVND(order.amount)}</p> {/* amount luôn VND */}

            <select onChange={(event) => statusHandler(event, order.id)} value={order.status}>
              <option value="Food Processing">Đang Chế Biến</option>
              <option value="Out for delivery">Đang Giao Hàng</option>
              <option value="Delivered">Đã Giao</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
