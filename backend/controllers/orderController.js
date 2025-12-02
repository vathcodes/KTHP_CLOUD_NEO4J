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






























import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import moment from "moment";
import { getSession } from "../config/db.js"; // Đảm bảo bạn export getSession từ file db

// ==============================
// CẤU HÌNH VNPAY (SANDBOX)
// ==============================
const VNPAY_TMN_CODE = "DH2F13SW";
const VNPAY_HASH_SECRET = "7VJPG70RGPOWFO47VSBT29WPDYND0EJG";
const VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

// Helper functions VNPay
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        sorted[key] = obj[key];
      }
    });
  return sorted;
}

function sha512Sign(data, secretKey) {
  const sortedData = sortObject(data);
  let signString = "";
  for (const key in sortedData) {
    if (signString) signString += "&";
    signString += `${key}=${encodeURIComponent(sortedData[key]).replace(/%20/g, "+")}`;
  }
  return crypto.createHmac("sha512", secretKey).update(signString, "utf-8").digest("hex");
}

function buildQueryString(params) {
  const parts = [];
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      parts.push(`${key}=${encodeURIComponent(params[key])}`);
    }
  }
  return parts.join("&");
}

// ==============================
// 1. TẠO ĐƠN HÀNG + LINK VNPAY
// ==============================
const placeOrder = async (req, res) => {
  const session = getSession();
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

    // Tính lại tổng tiền từ DB (bảo mật)
    let calculatedTotal = 0;
    const validItems = [];

    for (const item of items) {
      if (!item.id || !item.quantity){
        console.warn("Bỏ item không hợp lệ:", item);
        continue;
    }
      const foodResult = await session.run(
        `MATCH (f:Food {id: $foodId}) RETURN f.price AS price, f.name AS name, f.image AS image`,
        { foodId: item.id }
      );

      if (foodResult.records.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Món ăn không tồn tại: ${item.name || item.id}`,
        });
      }

      const food = foodResult.records[0];
      let price = food.get("price");
      price = (price && typeof price.toNumber === "function") ? price.toNumber() : Number(price) || 0;
      const name = food.get("name");
      const image = food.get("image");

      const itemTotal = price * item.quantity;
      calculatedTotal += itemTotal;

      validItems.push({
        foodId: item.id,
        name,
        price,
        quantity: item.quantity,
        image,
      });
    }

    const totalAmount = calculatedTotal + shippingFee;
    const orderId = uuidv4();
    const displayOrderCode = `DH${orderId.slice(-8).toUpperCase()}`;
    const vnpTxnRef = Date.now().toString();

    // Tạo đơn hàng trong Neo4j
    await session.run(
      `
      MATCH (u:User {id: $userId})
      CREATE (o:Order {
        id: $orderId,
        orderCode: $orderCode,
        vnpTxnRef: $vnpTxnRef,
        amount: $amount,
        address: $address,
        payment: false,
        status: "Pending",
        createdAt: datetime(),
        items: $items
      })
      CREATE (u)-[:PLACED]->(o)
      `,
      {
        userId,
        orderId,
        orderCode: displayOrderCode,
        vnpTxnRef,
        amount: totalAmount,
        address: JSON.stringify(address),
        items: JSON.stringify(validItems),
      }
    );

    // Xóa giỏ hàng người dùng
    await session.run(
      `MATCH (u:User {id: $userId}) SET u.cartData = null`,
      { userId }
    );

    // Tạo URL thanh toán VNPay
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
      vnp_ReturnUrl: `https://server-cloud-nnqr.onrender.com/api/order/vnpay_return?orderId=${orderId}`,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    vnpParams = sortObject(vnpParams);
    vnpParams.vnp_SecureHash = sha512Sign(vnpParams, VNPAY_HASH_SECRET);

    const paymentUrl = `${VNPAY_URL}?${buildQueryString(vnpParams)}`;

    return res.json({
      success: true,
      message: "Tạo đơn hàng thành công",
      orderId,
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
  } finally {
    await session.close();
  }
};

// ==============================
// 2. VNPAY RETURN + IPN
// ==============================
const vnpayIPN = async (req, res) => {
  const session = getSession();
  try {
    const vnpParams = { ...req.query };
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const vnpData = {};
    for (const key in vnpParams) {
      if (key.startsWith("vnp_") && vnpParams[key]) {
        vnpData[key] = vnpParams[key];
      }
    }

    const signData = Object.keys(vnpData)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnpData[key]).replace(/%20/g, "+")}`)
      .join("&");

    const calculatedHash = crypto
      .createHmac("sha512", VNPAY_HASH_SECRET)
      .update(signData, "utf-8")
      .digest("hex");

    if (calculatedHash !== secureHash) {
      console.error("VNPAY: Chữ ký không hợp lệ!");
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const txnRef = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;

    const result = await session.run(
      `MATCH (o:Order {vnpTxnRef: $txnRef}) RETURN o`,
      { txnRef }
    );

    const orderRecord = result.records[0];
    if (!orderRecord) {
      return res.json({ RspCode: "01", Message: "Order not found" });
    }

    const order = orderRecord.get("o").properties;

    if (responseCode === "00") {
      if (!order.payment) {
        await session.run(
          `
          MATCH (o:Order {vnpTxnRef: $txnRef})
          SET o.payment = true,
              o.paymentMethod = "VNPAY",
              o.paymentDate = datetime(),
              o.status = "Processing"
          `,
          { txnRef }
        );
        console.log(`VNPAY: Đơn ${order.orderCode} thanh toán thành công!`);
      }

      if (req.query.orderId) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?orderId=${req.query.orderId}&status=success`
        );
      }

      return res.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      if (req.query.orderId) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?orderId=${req.query.orderId}&status=failed`
        );
      }
      return res.json({ RspCode: responseCode || "24", Message: "Payment failed" });
    }
  } catch (error) {
    console.error("Lỗi vnpayIPN:", error);
    return res.json({ RspCode: "99", Message: "System error" });
  } finally {
    await session.close();
  }
};

// ==============================
// 3. LẤY ĐƠN HÀNG CỦA USER
// ==============================
const userOrders = async (req, res) => {
  const session = getSession();
  try {
    const userId = req.user.id;

    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:PLACED]->(o:Order)
      RETURN o ORDER BY o.createdAt DESC
      `,
      { userId }
    );

const orders = result.records.map((record) => {
  const props = record.get("o").properties;
  return {
    ...props,
    address: props.address ? JSON.parse(props.address) : null,
    items: props.items ? JSON.parse(props.items) : [],
  };
});
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Lỗi userOrders:", err);
    res.json({ success: false, data: [], message: "Lỗi lấy đơn hàng" });
  } finally {
    await session.close();
  }
};

// ==============================
// 4. ADMIN - DANH SÁCH TẤT CẢ ĐƠN
// ==============================
const listOrders = async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:PLACED]->(o:Order)
      RETURN o, u.name AS userName, u.email AS userEmail
      ORDER BY o.createdAt DESC
      `
    );

    const orders = result.records.map((record) => {
      const props = record.get("o").properties;

      // THÊM DÒNG NÀY ĐỂ PARSE address và items!!!
      let address = null;
      let items = [];

      try {
        address = props.address ? JSON.parse(props.address) : null;
        items = props.items ? JSON.parse(props.items) : [];
      } catch (e) {
        console.error("Lỗi parse JSON đơn hàng:", props.id, e);
      }

      return {
        ...props,
        address,   // ← Đã parse thành object
        items,     // ← Đã parse thành array
        userName: record.get("userName"),
        userEmail: record.get("userEmail"),
      };
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Lỗi listOrders:", err);
    res.json({ success: false, message: "Error" });
  } finally {
    await session.close();
  }
};
// ==============================
// 5. ADMIN - CẬP NHẬT TRẠNG THÁI
// ==============================
const updateStatus = async (req, res) => {
  const session = getSession();
  try {
    const { orderId, status } = req.body;

    await session.run(
      `MATCH (o:Order {id: $orderId}) SET o.status = $status`,
      { orderId, status }
    );

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error updating order status" });
  } finally {
    await session.close();
  }
};

// ==============================
// 6. ADMIN - XÓA ĐƠN HÀNG
// ==============================
const removeOrder = async (req, res) => {
  const session = getSession();
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.json({ success: false, message: "orderId is required" });
    }

    const result = await session.run(
      `MATCH (o:Order {id: $orderId}) DETACH DELETE o RETURN count(o) AS deleted`,
      { orderId }
    );

    const deleted = result.records[0]?.get("deleted")?.toNumber() || 0;
    if (deleted === 0) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error removing order" });
  } finally {
    await session.close();
  }
};

export { placeOrder, vnpayIPN, userOrders, listOrders, updateStatus, removeOrder };