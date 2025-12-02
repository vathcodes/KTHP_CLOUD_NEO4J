import { getSession } from "../config/db.js";

export const addToCart = async (req, res) => {
  const session = getSession();
  try {
    const userId = req.user.id;
    const itemId = req.body.itemId;

    const result = await session.run(
      `MATCH (u:User {id: $id}) RETURN u`,
      { id: userId }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    const user = result.records[0].get("u").properties;
    let cartData = user.cartData || {};

    // đảm bảo kiểu dữ liệu là Object với number
    cartData = JSON.parse(JSON.stringify(cartData));

    cartData[itemId.toString()] = Number(cartData[itemId.toString()] || 0) + 1;
    
    // cập nhật Neo4j
    await session.run(
      `MATCH (u:User {id: $id}) SET u.cartData = $cartData`,
      { id: userId, cartData }
    );

    res.json({ success: true, message: "Đã thêm vào giỏ hàng!" });
  } catch (error) {
    console.log("Lỗi addToCart:", error);
    res.json({ success: false, message: "Lỗi server" });
  } finally {
    session.close();
  }
};



export const removeFromCart = async (req, res) => {
  const session = getSession();
  try {
    const userId = req.user.id;
    const itemId = req.body.itemId;

    const result = await session.run(
      `
      MATCH (u:User {id: $id})
      RETURN u
      `,
      { id: userId }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    let cartData = result.records[0].get("u").properties.cartData || {};
    cartData = JSON.parse(JSON.stringify(cartData));

    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) delete cartData[itemId];
    }

    await session.run(
      `
      MATCH (u:User {id: $id})
      SET u.cartData = $cartData
      `,
      { id: userId, cartData }
    );

    res.json({ success: true, message: "Đã xóa khỏi giỏ hàng!" });
  } catch (error) {
    console.log("Lỗi removeFromCart:", error);
    res.json({ success: false, message: "Lỗi server" });
  } finally {
    session.close();
  }
};


// GET CART – ĐÃ SỬA HOÀN HẢO
export const getCart = async (req, res) => {
  const session = getSession();
  try {
    const userId = req.user.id;

    const result = await session.run(
      `
      MATCH (u:User {id: $id})
      RETURN u
      `,
      { id: userId }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng!" });
    }

      let cartData = result.records[0].get("u").properties.cartData || {};
    // Nếu cartData là string từ Neo4j, parse, còn nếu là object thì giữ nguyên
    if (typeof cartData === "string") {
      cartData = JSON.parse(cartData);
    }

    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Lỗi getCart:", error);
    res.json({ success: false, message: "Lỗi server" });
  } finally {
    session.close();
  }
};

