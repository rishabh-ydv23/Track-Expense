import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "your_jwt_secret_here";

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Not Unauthorized or token missing"
        });
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid token or token expired"
        });
    }
}

