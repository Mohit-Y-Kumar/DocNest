import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';


// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        // 1️⃣ Get token from headers
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Not authorized: Token missing" });
        }
        const dtoken = authHeader.split(" ")[1];
        if (!dtoken) {
            return res.status(401).json({ success: false, message: "Invalid token format" });
        }

        // 2️⃣ Verify token
        const token_decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

        console.log("Decoded Token =", token_decoded);

        req.docId = token_decoded.id;

        next(); // pass control to next middleware/route
    } catch (error) {
        console.log(error)
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authDoctor;
