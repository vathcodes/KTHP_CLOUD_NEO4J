import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error logging in" });
  }
};

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password too short" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    res.json({ success: true, users: [{ _id: user._id, name: user.name, email: user.email }] }); // note: users array
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  }
};

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (email && validator.isEmail(email)) user.email = email;
    if (password && password.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ success: true, users: [{ _id: user._id, name: user.name, email: user.email }] }); // return as array
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting user" });
  }
};
