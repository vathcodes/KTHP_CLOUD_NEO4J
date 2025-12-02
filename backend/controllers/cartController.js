// controllers/cartController.js
import userModel from "../models/userModel.js";

// ADD TO CART – ĐÃ SỬA HOÀN HẢO
const addToCart = async (req, res) => {
  try {
    // DÙNG req.user.id (do authMiddleware gán) – KHÔNG DÙNG req.body.userId NỮA!
    const userId = req.user.id;

    // Tìm user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Khởi tạo cartData nếu chưa có (rất quan trọng!)
    if (!userData.cartData) {
      userData.cartData = {};
    }

    const itemId = req.body.itemId;

    // Tăng số lượng
    if (!userData.cartData[itemId]) {
      userData.cartData[itemId] = 1;
    } else {
      userData.cartData[itemId] += 1;
    }

    // Cập nhật DB
    await userModel.findByIdAndUpdate(userId, { cartData: userData.cartData });

    res.json({ success: true, message: "Đã thêm vào giỏ hàng!" });
  } catch (error) {
    console.log("Lỗi addToCart:", error.message);
    res.json({ success: false, message: "Lỗi server" });
  }
};

// REMOVE FROM CART – ĐÃ SỬA HOÀN HẢO
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    if (!userData.cartData) {
      userData.cartData = {};
    }

    const itemId = req.body.itemId;

    if (userData.cartData[itemId] > 0) {
      userData.cartData[itemId] -= 1;

      // Xóa key nếu số lượng = 0 (giữ giỏ sạch)
      if (userData.cartData[itemId] === 0) {
        delete userData.cartData[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData: userData.cartData });

    res.json({ success: true, message: "Đã xóa khỏi giỏ hàng!" });
  } catch (error) {
    console.log("Lỗi removeFromCart:", error.message);
    res.json({ success: false, message: "Lỗi server" });
  }
};

// GET CART – ĐÃ SỬA HOÀN HẢO
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Đảm bảo luôn trả về object (không undefined)
    const cartData = userData.cartData || {};

    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Lỗi getCart:", error.message);
    res.json({ success: false, message: "Lỗi server" });
  }
};

export { addToCart, removeFromCart, getCart };