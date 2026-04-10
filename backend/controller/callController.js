import callModel from "../models/callModel.js";

const startCall = async (req, res) => {

    try {
        const {
            roomId,
            callerId,
            callerModel,
            receiverId,
            receiverModel,
            callType,
            status,
            startedAt,
            endedAt,
            duration,
            appointmentId
        } = req.body;

        if (!roomId || !callerId || !receiverId) {
            return res.json({
                success: false,
                message: 'roomId , callerId,receiverId are required'
            });

        }

        const existingCall = await callModel.findOne({ roomId });
        if (existingCall) {
            return res.json({
                success: false,
                message: 'Call already exit '
            });
        }

        const newCall = await callModel.create({
            roomId,
            callerId,
            callerModel,
            receiverId,
            receiverModel,
            callType: callType || 'audio',
            status: 'ringing',
            appointmentId: appointmentId || null
        });
        res.json({
            success: true,
            message: 'Call started',
            call: newCall
        });

    } catch (error) {
        console.log('startCall error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
const getCallHistory = async (req, res) => {
    try {

        const { userId } = req.params;
        const calls = await callModel.find({
            $or: [
                { callerId: userId },
                { receiverId: userId }
            ]
        }).sort({ createdAt: -1 });
        res.json({ success: true, calls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateCallStatus = async (req, res) => {
    try {
        const { roomId, status } = req.body;
        const updateData = { status };
        if (status === 'accepted') {
            updateData.startedAt = new Date();
        }
        if (status === 'ended' || status === 'rejected' || status === 'missed') {
            updateData.endedAt = new Date();
        }

        const call = await callModel.findOneAndUpdate(
            { roomId },
            updateData,
            { new: true }
        );
        if (!call) {
            return res.json({ success: false, message: 'Call not found' });
        }
        res.json({ success: true, call });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


export { startCall, getCallHistory, updateCallStatus };