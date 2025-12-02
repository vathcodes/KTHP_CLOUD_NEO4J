// routes/orderRoute.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  vnpayIPN,
  userOrders,
  listOrders,
  updateStatus,
  removeOrder
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// 1. Đặt hàng + tạo link VNPay
orderRouter.post("/place", authMiddleware, placeOrder);

// 2. Lấy danh sách đơn hàng của user (hỗ trợ cả 2 tên để tránh lỗi cũ)
orderRouter.get("/myorders", authMiddleware, userOrders);     // tên mới – chuẩn
orderRouter.post("/userorders", authMiddleware, userOrders); // tên cũ – vẫn hỗ trợ (đểm trợ cũ)

// 3. VNPay callback (cả Return URL và IPN đều dùng chung)
orderRouter.get("/vnpay_return", vnpayIPN);
orderRouter.get("/vnpay_ipn", vnpayIPN);

// 4. Admin routes
orderRouter.get("/list", listOrders);
orderRouter.post("/update-status", updateStatus);
orderRouter.post("/remove", removeOrder);

export default orderRouter;