import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const nodeEnv = process.env.NODE_ENV || 'development';

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized or token missing"
        });
    }

    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized or token missing"
        });
    }
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id ?? payload.sub ?? payload._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        if (nodeEnv === 'development') {
            console.error("JWT verification error:", error.message);
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token or token expired"
        });
    }
};

