import express from "express";
import rateLimit from "express-rate-limit";
import { getCurrentUser, loginUser, registerUser, updateProfile, updatePassword } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 30 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, try again later" },
});

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);


//protected routes 
userRouter.get("/me",authMiddleware,getCurrentUser);
userRouter.put("/profile",authMiddleware,updateProfile);
userRouter.put("/password",authMiddleware,updatePassword);

export default userRouter;

 