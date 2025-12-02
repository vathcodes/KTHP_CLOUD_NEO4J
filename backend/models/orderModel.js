import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Đang chế biến" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },

    // ==================== THÊM CÁC TRƯỜNG MỚI CHO VNPAY ====================
    paymentMethod: { type: String },                    // VNPAY, COD, ...
    paymentDate: { type: Date },                        // Thời điểm thanh toán thành công

    orderCode: { 
      type: String, 
      unique: true, 
      sparse: true 
    },                                                  // DHF6CDF19C (mã đơn đẹp)

    vnpTxnRef: { 
      type: String, 
      unique: true, 
      sparse: true 
    },                                                  // 1764594048577 – mã giao dịch VNPay (bắt buộc để tìm đơn)
    // =====================================================================
  },
  {
    timestamps: true,   // tự động thêm createdAt & updatedAt (rất tiện)
  }
);

// Tạo index để query theo vnpTxnRef cực nhanh + tránh trùng
orderSchema.index({ vnpTxnRef: 1 });
orderSchema.index({ orderCode: 1 });
orderSchema.index({ userId: 1, date: -1 });   // cho trang My Orders

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;