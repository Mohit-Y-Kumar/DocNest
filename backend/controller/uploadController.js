import messageModel from "../models/messageModel.js";
import { v2 as cloudinary } from "cloudinary";

const uploadChatImage = async (req, res) => {
    try {
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: 'image not found' })
        }

        const{roomId,sender,senderType,name} =req.body;

        if(!roomId || !sender|| !senderType || !name) {
             return res.json({ success: false, message:  'roomId, sender, senderType and  name required'  })
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path,  { 
            resource_type: 'image',
            folder: 'chat_images' });
         const imageUrl = imageUpload.secure_url;

         const saved = await messageModel.create({
            roomId,
            sender,
            senderType,
            name,
            message:  '',        
            imageUrl,           
            time: new Date()
        })
         res.json({ success: true, message: saved })
    }
    catch (error) {
        console.log('Upload error:', error)
        res.json({ success: false, message: error.message })
    }
}
export default uploadChatImage

