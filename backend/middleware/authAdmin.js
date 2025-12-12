import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js'; // optional, if you want to fetch admin details

// Middleware to verify JWT token for admin routes
const authAdmin = async (req, res, next) => {
    try {
        // 1️⃣ Get token from headers
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Not authorized: Token missing" });
        }
        const atoken = authHeader.split(" ")[1];
        if (!atoken) {
            return res.status(401).json({ success: false, message: "Invalid token format" });
        }

        // 2️⃣ Verify token
        const token_decoded = jwt.verify(atoken, process.env.JWT_SECRET);

        if (token_decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: 'not authorized Login again' });

        }

        next(); // pass control to next middleware/route
    } catch (error) {
        console.error(' Admin auth error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authAdmin;
