import User from "../models/User.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { use } from "react";

const JWT_SECRET = "your_jwt_secret_key";
const TOCKEN_EXPIRY = "24h";

const createToken = (userId) => {
    jwt.sign({ id:userId }, JWT_SECRET, { expiresIn: TOCKEN_EXPIRY });
}


//to register a new user
export async function registerUser(req, res) {
    const { name, email, password } = req.body; 
    if(!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email and password"
        })
    }
    if(!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email"
        })
    }

    if(password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
        })
    }

    try{
        if(await User.findOne({email})) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashed = await bcrypt.hash(password, 10);  //by adding salt to the password we can make it more secure and harder to crack
        const user = await User.create({name,email,password: hashed});  

        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }            
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}



//to login as user
export async function loginUser(req, res) {
    const { email, password } = req.body;   
    if(!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }

    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}


//to get user details
