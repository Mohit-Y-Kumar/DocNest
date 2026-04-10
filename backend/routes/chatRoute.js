// routes/chatRoute.js
import express from 'express';
import chat from '../controller/chatController.js';
import messageModel from '../models/messageModel.js';
import uploadChatImage from '../controller/uploadController.js';
import upload from '../middleware/multer.js';

const chatRouter = express.Router();

// ✅ Groq AI chat — already hai
chatRouter.post('/message', chat);

// ✅ Doctor-Patient history — ye add karo
chatRouter.get('/history/:roomId', async (req, res) => {
    try {
        const messages = await messageModel
            .find({ roomId: req.params.roomId })
            .sort({ time: 1 })
            .limit(100);

        res.json({ success: true, messages });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});
chatRouter.post('/upload-image', upload.single('image'), uploadChatImage)
// ✅ Mark read API — ye add karo
chatRouter.put('/mark-read/:roomId', async (req, res) => {
    try {
        const { readBy } = req.body

        await messageModel.updateMany(
            {
                roomId: req.params.roomId,
                sender: { $ne: readBy },  // doosre ka message
                isRead: false              // sirf unread
            },
            {
                isRead: true,
                readAt: new Date()
            }
        )

        res.json({ success: true, message: 'Messages marked as read' })

    } catch (err) {
        res.json({ success: false, message: err.message })
    }
})
export default chatRouter;