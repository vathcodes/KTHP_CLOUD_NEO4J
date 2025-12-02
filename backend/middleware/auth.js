import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. LẤY TOKEN TỪ HEADER (dự án bạn đang dùng tên "token")
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token. Vui lòng đăng nhập lại!"
      });
    }

    // 2. XÁC THỰC TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. GÁN USER ID ĐÚNG CHỖ (quan trọng nhất!)
    // Trước bạn gán vào req.body → polling không có body → lỗi!
    // Giờ gán vào req.user.id → chuẩn REST API
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.log("Lỗi authMiddleware:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn"
    });
  }
};

export default authMiddleware;