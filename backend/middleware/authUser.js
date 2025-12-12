import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';


// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        // 1️⃣ Get token from headers
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Not authorized: Token missing" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Invalid token format" });
        }

        // 2️⃣ Verify token
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("Decoded Token =", token_decoded);

        req.userId = token_decoded.id;

        next(); // pass control to next middleware/route
    } catch (error) {
        console.log(error)
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authUser;
