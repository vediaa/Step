import express from "express";
import userAuth from "../middleware/userAuth.js"; //sonlarına .js ekle yoksa dosyayı bulamıyor
import { getUserData,updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, updateProfile);

export default userRouter;
