import foodModel from "../models/foodModel.js";
import fs from 'fs';

// add food item
const addFood = async (req, res) => {
    try {
        let image_filename;

        if (req.file) {
            image_filename = `${req.file.filename}`;  
        } else if (req.body.imageUrl) { 
            image_filename = req.body.imageUrl;  
        } else {
            return res.json({ success: false, message: "No image or URL provided" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
        });

        await food.save();
        res.json({ success: true, message: "Food added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding food item" });
    }
}

// list food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching food items" });
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);

        if (food.image && !food.image.startsWith("http")) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.log(err);
            });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food item" });
    }
}

// update food item
const updateFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) return res.json({ success: false, message: "Food not found" });

        // update fields
        food.name = req.body.name || food.name;
        food.category = req.body.category || food.category;
        food.price = req.body.price !== undefined ? req.body.price : food.price;

        // nếu muốn update hình ảnh mới
        if (req.file) {
            // xóa ảnh cũ nếu có
            if (food.image && !food.image.startsWith("http")) {
                fs.unlink(`uploads/${food.image}`, (err) => {
                    if (err) console.log(err);
                });
            }
            food.image = req.file.filename;
        }

        await food.save();
        res.json({ success: true, message: "Food updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating food item" });
    }
}

export { addFood, listFood, removeFood, updateFood };
