import express from 'express';
import { loginUser, registerUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";

const userRouter = express.Router();

// Auth
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);

// CRUD
userRouter.get("/", getUsers);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/list", getUsers)

export default userRouter;
