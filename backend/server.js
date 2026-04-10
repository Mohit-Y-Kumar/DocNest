import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import chatRouter from './routes/chatRoute.js';
import { createServer } from 'http'
import { Server } from 'socket.io'
import messageModel from './models/messageModel.js'
import callModel from './models/callModel.js';
import callRouter from './routes/callRoute.js';

// ✅ Pehle app banao
const app = express();
const port = process.env.PORT;

// ✅ Phir httpServer banao
const httpServer = createServer(app)

// ✅ Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})



// DB & Cloudinary
connectDB()
connectCloudinary()

// Middleware
app.use(express.json());
app.use(cors())

// API endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/chat', chatRouter)
app.use('/api/calls', callRouter);

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Express Server is Running...');
});

// ✅ Socket.io Events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  // Room join karo
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`User joined room: ${roomId}`)
  })


  socket.on('call-user', async (data) => {
    try {
      // ✅ Pehle check karo — existing call hai?
      const existingCall = await callModel.findOne({ roomId: data.roomId })

      if (!existingCall) {
        await callModel.create({
          roomId: data.roomId,
          callerId: data.callerId,
          callerModel: data.callerModel,
          receiverId: data.receiverId,
          receiverModel: data.receiverModel,
          callType: data.callType,
          status: 'ringing'
        })
      } else {
        // ✅ Purani call update karo
        await callModel.findOneAndUpdate(
          { roomId: data.roomId },
          { status: 'ringing', endedAt: null, startedAt: null }
        )
      }
      //notify to doctor 
      io.to(data.roomId).emit('incoming-call', {
        roomId: data.roomId,
        callerName: data.callerName,
        callerImage: data.callerImage,
        callType: data.callType,
        callerId: data.callerId  // ✅ ye add karo
      })

    } catch (err) {
      console.error('call-user error:', err.message)
    }
  })

socket.on('call-accepted', async (data) => {
    await callModel.findOneAndUpdate(
        { roomId: data.roomId },
        { status: 'accepted', startedAt: new Date() }
    )
    // ✅ socket.to — sender ko nahi, baaki sab ko
    socket.to(data.roomId).emit('call-accepted', {
        roomId: data.roomId
    })
})
 socket.on('call-rejected', async (data) => {
    await callModel.findOneAndUpdate(
        { roomId: data.roomId },
        { status: 'rejected' }
    )
    socket.to(data.roomId).emit('call-rejected', {  // ✅ socket.to
        roomId: data.roomId
    })
})

  socket.on('call-ended', async (data) => {
    const call = await callModel.findOne({ roomId: data.roomId })
    if (call) {
        call.status  = 'ended'
        call.endedAt = new Date()
        await call.save()
    }
    socket.to(data.roomId).emit('call-ended', {  // ✅ socket.to
        roomId: data.roomId
    })
})

 socket.on('signal', (data) => {
    socket.to(data.roomId).emit('signal', {  // ✅ socket.to
        signalData: data.signalData
    })
})

  socket.on('message-read', async (data) => {
    console.log('Message read:', data)
    await messageModel.updateMany(
      {
        roomId: data.roomId,
        sender: { $ne: data.readBy },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    )
    // Sender ko batao — message read ho gaya
    io.to(data.roomId).emit('message-seen', {
      roomId: data.roomId,
      readBy: data.readBy,     // kaun ne padha
      readAt: new Date()
    })
  })
  // Message receive aur room mein bhejo
  socket.on('send-message', async (data) => {
    try {
      // ✅ DB mein save karo
      const saved = await messageModel.create({
        roomId: data.roomId,
        sender: data.sender,
        senderType: data.senderType,
        name: data.name,
        message: data.message,
        imageUrl: data.imageUrl || null,
        isRead: false,
        readAt: null,
        time: new Date()
      });

      // ✅ Saved message room mein bhejo
      io.to(data.roomId).emit('receive-message', saved);

    } catch (err) {
      console.error('❌ Message save error:', err.message);
    }
  })

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', { name: data.name })
  })

  socket.on('stop-typing', (data) => {
    socket.to(data.roomId).emit('user-stop-typing')
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

// ✅ app.listen nahi — httpServer.listen use karo
httpServer.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})