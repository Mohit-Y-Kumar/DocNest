import React, { useState, useEffect, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import VideoCall from './VideoCall'

const ChatWindow = ({ appointmentId, doctorId, doctorName, doctorImage, onClose }) => {
    const { backendUrl, userData } = useContext(AppContext)

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [connected, setConnected] = useState(false)

    const [isInitiator, setIsInitiator] = useState(false)

    const [callType, setCallType] = useState(null)
    const [showVideoCall, setShowVideoCall] = useState(false)

    const [callRoomId, setCallRoomId] = useState(null)
    const socketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const roomId = appointmentId
    console.log('Patient roomId:', roomId)

    useEffect(() => {
        // ✅ Connect karo
        socketRef.current = io(backendUrl)

        socketRef.current.on('connect', () => {
            setConnected(true)
            console.log('✅ Socket connected')

            // Room join karo
            socketRef.current.emit('join-room', roomId)

            socketRef.current.emit('message-read', {
                roomId,
                readBy: userData?._id
            })
        })

        socketRef.current.on('message-seen', (data) => {
            setMessages(prev => prev.map(msg =>
                msg.sender === userData?._id  // apne messages update karo
                    ? { ...msg, isRead: true, readAt: data.readAt }
                    : msg
            ))
        })

        // Message receive karo
        socketRef.current.on('receive-message', (data) => {

            console.log('Received message:', data)
            setMessages(prev => [...prev, data])


        })

        // Typing
        socketRef.current.on('user-typing', () => {
            setIsTyping(true)
        })

        socketRef.current.on('user-stop-typing', () => {
            setIsTyping(false)
        })

        socketRef.current.on('disconnect', () => {
            setConnected(false)
        })

        // ✅ Incoming call listener (VERY IMPORTANT)
        socketRef.current.on('incoming-call', (data) => {
            console.log('Incoming call:', data)

            const { roomId, callType, callerId } = data
            if (callerId === userData?._id) return
            setCallRoomId(roomId)
            setCallType(callType)

            setIsInitiator(false) // receiver always false

            setShowVideoCall(true)
        })


        socketRef.current.on('call-rejected', () => {
            alert('Call rejected')
            setCallRoomId(null)
        })

        // Cleanup
        return () => {
            socketRef.current.disconnect()
        }


    }, [roomId, userData])


    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { data } = await axios.get(
                    backendUrl + `/api/chat/history/${roomId}`
                );
                if (data.success) setMessages(data.messages);

                await axios.put(
                    backendUrl + `/api/chat/mark-read/${roomId}`,
                    { readBy: userData?._id }
                )
            } catch (err) {
                console.log(err);
            }
        };
        loadHistory();
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() && !selectedImage) return

        // ✅ Image send karo
        if (selectedImage) {
            const formData = new FormData()
            formData.append('image', selectedImage)
            formData.append('roomId', roomId)
            formData.append('sender', userData?._id)
            formData.append('senderType', 'user')
            formData.append('name', userData?.name)

            try {
                const { data } = await axios.post(
                    backendUrl + '/api/chat/upload-image',
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                if (data.success) {
                    socketRef.current.emit('send-message', {
                        roomId,
                        message: '',
                        imageUrl: data.message.imageUrl,
                        sender: userData?._id,
                        senderType: 'user',
                        name: userData?.name
                    })
                }
            } catch (err) {
                console.log(err)
            }

            setSelectedImage(null)
            setInput('')
            return
        }

        // ✅ Normal text message
        socketRef.current.emit('send-message', {
            roomId,
            message: input.trim(),
            sender: userData?._id,
            senderType: 'user',
            name: userData?.name
        })
        setInput('')
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedImage(file)      // file store karo
        setInput(file.name)         // input mein naam dikhao
        e.target.value = ''         // file input reset karo
    }

    const handleTyping = (e) => {
        if (selectedImage) {
            setSelectedImage(null)  // image deselect ho jaye agar user type kare
        }
        setInput(e.target.value)

        socketRef.current.emit('typing', { roomId, name: userData?.name })

        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('stop-typing', { roomId })
        }, 2000)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }


    const startCall = async (type) => {
        const newCallRoomId = `call_${doctorId}_${userData?._id}`
        setCallRoomId(newCallRoomId)
        setIsInitiator(true)
        setCallType(type)

        console.log('Patient callRoomId:', `call_${doctorId}_${userData?._id}`)
        console.log('doctorId:', doctorId)
        console.log('patientId:', userData?._id)
        socketRef.current.emit('join-room', newCallRoomId)
        socketRef.current.emit('call-user', {
            roomId: newCallRoomId,
            callerId: userData?._id,
            callerModel: 'user',
            receiverId: doctorId,
            receiverModel: 'doctor',
            callType: type,
            callerName: userData?.name,
            callerImage: userData?.image
        })
        setShowVideoCall(true)
    }

    return (
        <div className='flex flex-col h-[500px] border rounded-2xl overflow-hidden shadow-xl bg-white'>

            {/* Header */}
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center gap-3'>
                <img
                    src={doctorImage}
                    alt={doctorName}
                    className='w-9 h-9 rounded-full object-cover border-2 border-white'
                />
                <div className='flex-1'>
                    <p className='text-white font-semibold text-sm'>{doctorName}</p>
                    <p className='text-blue-100 text-xs'>
                        {isTyping ? '✍️ Typing...' : connected ? '🟢 Online' : '🔴 Offline'}
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => startCall('audio')}
                        title='Audio Call'
                        className='w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition'
                    >
                        📞
                    </button>
                    <button
                        onClick={() => startCall('video')}
                        title='Video Call'
                        className='w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition'
                    >
                        📹
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className='text-white hover:text-blue-200 text-lg'
                        >
                            ✕
                        </button>
                    )}
                </div>

            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
                {messages.length === 0 && (
                    <p className='text-center text-gray-400 text-sm mt-10'>
                        👋 Chat shuru karo
                    </p>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === userData?._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${msg.sender === userData?._id
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow'
                            }`}>

                            {msg.imageUrl && (
                                <img
                                    src={msg.imageUrl}
                                    alt='chat-img'
                                    className='max-w-full rounded-lg mb-1 cursor-pointer'
                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                />
                            )}
                            <p>{msg.message}</p>
                            <p className='text-xs mt-1 opacity-60'>
                                {new Date(msg.time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                {msg.sender === userData?._id && (
                                    <span className='ml-1'>
                                        {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                    <div className='flex justify-start'>
                        <div className='bg-white px-4 py-2 rounded-2xl shadow'>
                            <div className='flex gap-1'>
                                <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                                <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></span>
                                <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='border-t p-3 flex gap-2 bg-white'>

                <label className='cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition'>
                    📎
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageSelect}
                        className='hidden'
                    />
                </label>

                <input
                    type='text'
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={handleKeyPress}
                    placeholder='Message likho...'
                    className='flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-400'
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() && !selectedImage}
                    className='bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition'
                >
                    ➤
                </button>
            </div>
            {showVideoCall && callRoomId && (
                <div className='fixed inset-0 bg-black/90 z-50'>
                    <VideoCall
                        roomId={callRoomId}
                        callType={callType}
                        isInitiator={isInitiator}
                        callerId={userData?._id}
                        callerModel='user'
                        receiverId={doctorId}
                        receiverModel='doctor'
                        callerName={userData?.name}
                        callerImage={userData?.image}
                        receiverName={doctorName}
                        receiverImage={doctorImage}
                        onClose={() => {
                            if (socketRef.current && callRoomId) {
                                socketRef.current.emit('leave-room', callRoomId)
                            }
                            setShowVideoCall(false)
                            setCallType(null)
                            setCallRoomId(null)
                        }}
                    />
                </div>
            )}

        </div>
    )
}

export default ChatWindow