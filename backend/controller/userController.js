import validator from "validator"
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import { toast } from "react-toastify";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Razorpay from "razorpay";




const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body
        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "enter a strong password" })

        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })



    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })

    }

}

// api for user login 
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        return res.json({ success: true, token })



    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })

    }

}

//api to get user profile data
const getProfile = async (req, res) => {

    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })


    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })

    }

}


//api to update user profile

const updateProfile = async (req, res) => {
    try {

        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;
        const userId = req.userId;
        if (!userId || !name || !phone || !address || !dob || !gender) {
            return res.status(400).json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            // upload img to cloudinary

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            const imageURL = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }
        res.json({ success: true, message: "Profile Updated" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });

    }
}


//api to book appointment
const bookAppointment = async (req, res) => {
    try {

        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body



        const docData = (await doctorModel.findById(docId).select('-password')).toObject();
        if (docData) {
            console.log("This is docDATA " + docData);
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }

        let slots_booked = docData.slots_booked
        //checking for slot availability 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'slot not available' })

            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = (await userModel.findById(userId).select('-password')).toObject();
        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }
        delete docData.slots_booked;


        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),



        }

        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()

        //save new slot data in doctor data

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'appointment booked' })


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });

    }
}

//api to get user appointments for frontend my-appoints page

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId })
        console.log("Found appointments DAta:", appointments);
        console.log("Booking for user:", req.userId);


        res.json({ success: true, appointments })



    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });


    }


}



//api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body;

        // 1️⃣ Appointment exist or not
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // 2️⃣ Appointment belongs to this user?
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized request" });
        }

        // 3️⃣ If already cancelled?
        if (appointmentData.cancelled === true) {
            return res.json({ success: false, message: "Already cancelled" });
        }



        // 4️⃣ Mark appointment cancelled
        appointmentData.cancelled = true;
        await appointmentData.save();

        // Release doctor slot
        const { docId, slotDate, slotTime } = appointmentData;

        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;

        if (!slots_booked[slotDate]) {
            slots_booked[slotDate] = [];
        }

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e != slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        return res.json({
            success: true,
            message: "Appointment cancelled successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//API  to make payment of user appointment

const paymentRazorpay = async (req, res) => {

    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Cancelled or not found" })
        }

        // creating options for razorpay payments


        const options = {
            amount: Number(appointmentData.amount) * 100,

            currency: process.env.currency,
            receipt: appointmentId.toString(),

        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)
        console.log("RAZORPAY ORDER:", order);
        res.json({ success: true, order })


    }
    catch (error) {
        console.log("RAZORPAY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

// api to verify payment of razorpay

const verifyRazorpay = async (req, res) => {
    try {

       const { razorpay_order_id } = req.body.response;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,
                { payment: true }
            );
            res.json({ success: true, message: "Payment Successful" });

        } else {
            res.json({ success: false, message: "Payment failed" });

        }




    } catch (error) {
        console.log("RAZORPAY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}




export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay }