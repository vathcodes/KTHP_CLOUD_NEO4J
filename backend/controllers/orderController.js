// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";

// //placing user order for frontend
// const placeOrder = async (req, res) => {
//   try {
//     // 1. Tính tiền VND luôn, cộng phí ship 2.000 VND
//     const shippingFee = 2000; 
//     const amountVND = req.body.amount + shippingFee;

//     // 2. Tạo đơn hàng trong DB luôn bằng VND
//     const newOrder = new orderModel({
//       userId: req.body.userId,
//       items: req.body.items,
//       amount: amountVND, // lưu VND trực tiếp
//       address: req.body.address,
//       payment: false, // chưa thanh toán
//     });
//     await newOrder.save();

//     // Xóa giỏ hàng của user
//     await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

//     // 3. Tạo mã đơn rút gọn để làm nội dung chuyển khoản
//     const orderCode = newOrder._id.toString().slice(-8).toUpperCase();

//     // 4. Tạo link VietQR CHÍNH HÃNG
//     const vietqr = `https://img.vietqr.io/image/MBBank-0376808557-compact2.png?amount=${amountVND}&addInfo=DH${orderCode}&accountName=TRAN%20VAN%20THIEN`;

//     // 5. Trả về cho frontend
//     res.json({
//       success: true,
//       message: "Đặt hàng thành công! Vui lòng thanh toán để hoàn tất.",
//       orderId: newOrder._id,
//       amountVND: amountVND,
//       paymentQR: vietqr,
//       paymentInfo: {
//         bankName: "MB Bank",
//         accountNumber: "0376808557",
//         accountName: "TRAN VAN THIEN",
//         amount: amountVND.toLocaleString("vi-VN") + " ₫",
//         content: `DH${orderCode}`,
//         note: "Sau khi chuyển khoản xong, đơn hàng sẽ tự động cập nhật trong vòng 1-3 phút."
//       }
//     });

//   } catch (error) {
//     console.log("Error in placeOrder:", error);
//     res.json({ success: false, message: "Có lỗi xảy ra khi đặt hàng" });
//   }
// };



// // verifyOrder với Sepay (client gọi khi đã thanh toán)
// const verifyOrder = async (req, res) => {
//   const { orderId, success } = req.body;
//   try {
//     if (success === true || success === "true") {
//       await orderModel.findByIdAndUpdate(orderId, { payment: true });
//       res.json({ success: true, message: "Paid" });
//     } else {
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: "Not Paid" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error verifying order" });
//   }
// };

// // user orders for frontend
// const userOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({ userId: req.body.userId });
//     res.json({ success: true, data: orders });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" });
//   }
// };

// // Listing orders for admin panel
// const listOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     res.json({ success: true, data: orders });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" });
//   }
// };

// // api for updating order status
// const updateStatus = async (req, res) => {
//   try {
//     await orderModel.findByIdAndUpdate(req.body.orderId, {
//       status: req.body.status,
//     });
//     res.json({ success: true, message: "Cập nhật trạng thái thành công" });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error updating order status" });
//   }
// };

// // remove order
// const removeOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     if (!orderId) {
//       return res.json({ success: false, message: "orderId is required" });
//     }

//     const deletedOrder = await orderModel.findByIdAndDelete(orderId);

//     if (!deletedOrder) {
//       return res.json({ success: false, message: "Order not found" });
//     }

//     res.json({ success: true, message: "Xóa đơn hàng thành công" });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error removing order" });
//   }
// };

// export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, removeOrder };
































import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import crypto from "crypto";
import moment from "moment";

// ==============================
// CẤU HÌNH VNPAY (SANDBOX)
// ==============================
const VNPAY_TMN_CODE = "DH2F13SW";
const VNPAY_HASH_SECRET = "7VJPG70RGPOWFO47VSBT29WPDYND0EJG";
const VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNPAY_RETURN_URL = `${process.env.FRONTEND_URL}/payment-success`;

// ==============================
// HÀM SORT + TẠO CHỮ KÝ CHUẨN VNPAY (QUAN TRỌNG NHẤT)
// ==============================
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

// Tạo chữ ký đúng chuẩn VNPay (không dùng qs.stringify)
function sha512Sign(data, secretKey) {
  let signString = "";
  const sortedData = sortObject(data);

  for (const key in sortedData) {
    const value = sortedData[key];
    if (signString) signString += "&";
    signString += `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
  }

  return crypto.createHmac("sha512", secretKey).update(signString, "utf-8").digest("hex");
}

// Tạo query string đúng chuẩn (không dùng qs)
function buildQueryString(params) {
  const parts = [];
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      parts.push(`${key}=${encodeURIComponent(params[key])}`);
    }
  }
  return parts.join("&");
}

// ======================================================
// 1. TẠO ĐƠN HÀNG + LINK THANH TOÁN VNPAY (ĐÃ BẢO MẬT GIÁ TIỀN)
// ======================================================
const placeOrder = async (req, res) => {
  try {
    const shippingFee = 2000;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
    }

    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
    }

    // ===== BƯỚC QUAN TRỌNG: TỰ TÍNH LẠI TỔNG TIỀN TỪ DB =====
    let calculatedTotal = 0;
    const validItems = [];

    for (const item of items) {
      const food = await foodModel.findById(item._id);
      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Món ăn không tồn tại: ${item.name || item._id}`,
        });
      }

      // Dùng đúng giá trong DB (không tin frontend)
      const itemTotal = food.price * item.quantity;
      calculatedTotal += itemTotal;

      validItems.push({
        foodId: food._id,
        name: food.name,
        price: food.price,        // giá chính xác từ DB
        quantity: item.quantity,
        image: food.image,
      });
    }

    const totalAmount = calculatedTotal + shippingFee;

    // Tạo đơn hàng
    const newOrder = new orderModel({
      userId,
      items: validItems,        // lưu đúng giá + tên từ DB
      amount: totalAmount,      // tổng tiền đã được tính lại
      address,
      payment: false,
    });
    await newOrder.save();

    // Xóa giỏ hàng
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Mã đơn đẹp + mã giao dịch VNPay
    const displayOrderCode = `DH${newOrder._id.toString().slice(-8).toUpperCase()}`;
    const vnpTxnRef = Date.now().toString();

    await orderModel.findByIdAndUpdate(newOrder._id, {
      orderCode: displayOrderCode,
      vnpTxnRef,
    });

    // IP + params VNPay
    const ipAddr =
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNPAY_TMN_CODE,
      vnp_Amount: totalAmount * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnpTxnRef,
      vnp_OrderInfo: `Thanh toan don hang ${displayOrderCode}`,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_ReturnUrl: `${process.env.BACKEND_URL}/api/order/vnpay_return?orderId=${newOrder._id}`,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    vnpParams = sortObject(vnpParams);
    vnpParams.vnp_SecureHash = sha512Sign(vnpParams, VNPAY_HASH_SECRET);

    const paymentUrl = `${VNPAY_URL}?${buildQueryString(vnpParams)}`;

    return res.json({
      success: true,
      message: "Tạo đơn hàng thành công",
      orderId: newOrder._id,
      orderCode: displayOrderCode,
      amount: totalAmount,
      payUrl: paymentUrl,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
    });
  }
};
// ======================================================
// 2. VNPAY RETURN + IPN (HOÀN CHỈNH – ĐÃ FIX 100%)
// ======================================================
const vnpayIPN = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const secureHash = vnpParams.vnp_SecureHash;

    // 1. Loại bỏ hash + chỉ giữ lại các param vnp_
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const vnpData = {};
    for (const key in vnpParams) {
      if (key.startsWith("vnp_") && vnpParams[key] !== "") {
        vnpData[key] = vnpParams[key];
      }
    }

    // 2. Tạo chuỗi ký (sort + encode chuẩn VNPay)
    const sortedKeys = Object.keys(vnpData).sort();
    let signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpData[key]).replace(/%20/g, "+")}`)
      .join("&");

    // 3. Tính lại hash
    const calculatedHash = crypto
      .createHmac("sha512", VNPAY_HASH_SECRET)
      .update(signData, "utf-8")
      .digest("hex");

    // 4. DEBUG LOG (có thể tắt sau khi ổn định)
    console.log("=== VNPAY CALLBACK ===");
    console.log("vnp_TxnRef      :", vnpParams.vnp_TxnRef);
    console.log("ResponseCode    :", vnpParams.vnp_ResponseCode);
    console.log("Hash Match      :", calculatedHash === secureHash);
    console.log("Calculated Hash :", calculatedHash);
    console.log("Received Hash   :", secureHash);
    console.log("SignData        :", signData);
    console.log("==========================");

    // 5. Kiểm tra chữ ký
    if (calculatedHash !== secureHash) {
      console.error("VNPAY: Chữ ký không hợp lệ!");
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const txnRef = vnpParams.vnp_TxnRef?.toString();
    const responseCode = vnpParams.vnp_ResponseCode;

    if (!txnRef) {
      return res.json({ RspCode: "02", Message: "Missing vnp_TxnRef" });
    }

    // 6. Tìm đơn hàng
    const order = await orderModel.findOne({ vnpTxnRef: txnRef });

    if (!order) {
      console.log(`VNPAY: Không tìm thấy đơn với vnpTxnRef = ${txnRef}`);
      const recent = await orderModel
        .find({ vnpTxnRef: { $exists: true } })
        .sort({ date: -1 })
        .limit(5)
        .select("orderCode vnpTxnRef date");
      console.log("5 đơn gần nhất có vnpTxnRef:", recent.map(o => ({
        code: o.orderCode,
        txn: o.vnpTxnRef,
        date: o.date
      })));

      return res.json({ RspCode: "01", Message: "Ordenot found" });
    }

    // 7. Xử lý kết quả thanh toán
    if (responseCode === "00") {
      // THANH TOÁN THÀNH CÔNG
      if (!order.payment) {
        order.payment = true;
        order.paymentMethod = "VNPAY";
        order.paymentDate = new Date();
        order.status = "Processing"; // hoặc "Confirmed", "Paid"...
        await order.save();

        console.log(`VNPAY: Đơn hàng ${order.orderCode} đã thanh toán thành công!`);
      } else {
        console.log(`VNPAY: Đơn ${order.orderCode} đã được xác nhận trước đó`);
      }

      // Return URL (người dùng thấy) → redirect về frontend
      if (req.query.orderId) {
        const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?orderId=${req.query.orderId}&status=success`;
        return res.redirect(redirectUrl);
      }

      // IPN → trả JSON cho VNPay
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      // THANH TOÁN THẤT BẠI
      console.log(`VNPAY: Thanh toán thất bại - Order: ${order.orderCode}, Code: ${responseCode}`);

      if (req.query.orderId) {
        const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?orderId=${req.query.orderId}&status=failed`;
        return res.redirect(redirectUrl);
      }

      return res.json({ RspCode: responseCode || "24", Message: "Payment failed" });
    }
  } catch (error) {
    console.error("Lỗi nghiêm trọng trong vnpayIPN:", error);
    return res.status(500).json({ RspCode: "99", Message: "System error" });
  }
};
// Export
export { placeOrder, vnpayIPN };
// ======================================================
// 3. LẤY ĐƠN HÀNG NGƯỜI DÙNG
// ======================================================
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.log("Lỗi userOrders:", err);
    res.json({ success: false, data: [], message: "Lỗi lấy đơn hàng" });
  }
};

// ======================================================
// 4. ADMIN – LIST ALL ORDERS
// ======================================================
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error" });
  }
};

// ======================================================
// 5. ADMIN – UPDATE STATUS
// ======================================================
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error updating order status" });
  }
};

// ======================================================
// 6. ADMIN – DELETE ORDER
// ======================================================
const removeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: "orderId is required" });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error removing order" });
  }
};

export {
  userOrders,
  listOrders,
  updateStatus,
  removeOrder
};
