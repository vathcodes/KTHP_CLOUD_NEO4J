import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../config/db.js";


export const addFood = async (req, res) => {
  const session = getSession();

  try {
    let image_filename;

    if (req.file) {
      image_filename = req.file.filename;
    } else if (req.body.imageUrl) {
      image_filename = req.body.imageUrl;
    } else {
      return res.json({ success: false, message: "No image or URL provided" });
    }

    const id = uuidv4();

    const result = await session.run(
      `
      CREATE (f:Food {
        id: $id,
        name: $name,
        description: $description,
        price: $price,
        category: $category,
        image: $image
      })
      RETURN f
      `,
      {
        id,
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        category: req.body.category,
        image: image_filename,
      }
    );

    res.json({ success: true, message: "Food added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding food item" });
  } finally {
    await session.close();
  }
};


export const listFood = async (req, res) => {
  const session = getSession();

  try {
    const result = await session.run(`
      MATCH (f:Food)
      RETURN f
    `);

    const foods = result.records.map((r) => r.get("f").properties);

    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching food items" });
  } finally {
    await session.close();
  }
};


export const removeFood = async (req, res) => {
  const session = getSession();
  const foodId = req.body.id;

  try {
    // Lấy food trước khi delete
    const foodQuery = await session.run(
      `
      MATCH (f:Food {id: $id})
      RETURN f
      `,
      { id: foodId }
    );

    if (foodQuery.records.length === 0) {
      return res.json({ success: false, message: "Food not found" });
    }

    const food = foodQuery.records[0].get("f").properties;

    if (food.image && !food.image.startsWith("http")) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.log(err);
      });
    }

    await session.run(
      `
      MATCH (f:Food {id: $id})
      DETACH DELETE f
      `,
      { id: foodId }
    );

    res.json({ success: true, message: "Food removed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing food item" });
  } finally {
    await session.close();
  }
};


export const updateFood = async (req, res) => {
  const session = getSession();
  const foodId = req.body.id;

  try {
    // Lấy food hiện tại
    const existing = await session.run(
      `
      MATCH (f:Food {id: $id})
      RETURN f
      `,
      { id: foodId }
    );

    if (existing.records.length === 0) {
      return res.json({ success: false, message: "Food not found" });
    }

    const oldFood = existing.records[0].get("f").properties;

    let newImage = oldFood.image;

    // Nếu upload ảnh mới
    if (req.file) {
      if (oldFood.image && !oldFood.image.startsWith("http")) {
        fs.unlink(`uploads/${oldFood.image}`, (err) => {
          if (err) console.log(err);
        });
      }
      newImage = req.file.filename;
    }

    const result = await session.run(
      `
      MATCH (f:Food {id: $id})
      SET 
        f.name = COALESCE($name, f.name),
        f.description = COALESCE($description, f.description),
        f.price = COALESCE($price, f.price),
        f.category = COALESCE($category, f.category),
        f.image = $image
      RETURN f
      `,
      {
        id: foodId,
        name: req.body.name || null,
        description: req.body.description || null,
        price: req.body.price !== undefined ? Number(req.body.price) : null,
        category: req.body.category || null,
        image: newImage,
      }
    );

    res.json({ success: true, message: "Food updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating food item" });
  } finally {
    await session.close();
  }
};

