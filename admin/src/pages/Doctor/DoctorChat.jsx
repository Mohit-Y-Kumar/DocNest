import React, { useState, useEffect, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import DoctorVideoCall from './DoctorVideoCall'

const DoctorChat = ({ docId, patientId, patientName, patientImage, onClose }) => {
    const { backendUrl, profileData } = useContext(DoctorContext)

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [connected, setConnected] = useState(false)
    const [showVideoCall, setShowVideoCall] = useState(false)
    const [incomingCallData, setIncomingCallData] = useState(null)
    const socketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    const [selectedImage, setSelectedImage] = useState(null)
    const [isCalling, setIsCalling] = useState(false)
    // Same room ID — jo patient ne use kiya
    const roomId = `chat_${docId}_${patientId}`
    console.log('Doctor callRoomId:', `call_${docId}_${patientId}`)
    console.log('docId:', docId)
    console.log('patientId:', patientId)

    useEffect(() => {
        // ✅ Connect karo
        socketRef.current = io(backendUrl)

        socketRef.current.on('connect', () => {
            setConnected(true)
            console.log('✅ Doctor Socket connected')

            // Same room join karo
            socketRef.current.emit('join-room', roomId)

            socketRef.current.emit('message-read', {
                roomId,
                readBy: docId
            })
        })

        // Message receive karo
        socketRef.current.on('receive-message', (data) => {
            setMessages(prev => [...prev, data])
        })
        socketRef.current.on('message-seen', (data) => {
            setMessages(prev => prev.map(msg =>
                msg.sender === docId
                    ? { ...msg, isRead: true, readAt: data.readAt }
                    : msg
            ))
        })

        // Typing
        socketRef.current.on('user-typing', () => {
            setIsTyping(true)
        })

        socketRef.current.on('user-stop-typing', () => {
            setIsTyping(false)
        })
        socketRef.current.on('incoming-call', (data) => {
            socketRef.current.emit('join-room', data.roomId) 
            setIncomingCallData(data)
            setIsCalling(false)
            setShowVideoCall(true)
        })
        socketRef.current.on('disconnect', () => {
            setConnected(false)
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [roomId])



    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/chat/history/${roomId}`)
                const data = await res.json()
                if (data.success) setMessages(data.messages)
                await axios.put(
                    backendUrl + `/api/chat/mark-read/${roomId}`,
                    { readBy: docId }
                )
            } catch (err) {
                console.log(err)
            }
        }
        loadHistory()
    }, [roomId])

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() && !selectedImage) return

        // ✅ Image send
        if (selectedImage) {
            const formData = new FormData()
            formData.append('image', selectedImage)
            formData.append('roomId', roomId)
            formData.append('sender', docId)
            formData.append('senderType', 'doctor')
            formData.append('name', 'Doctor')

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
                        sender: docId,
                        senderType: 'doctor',
                        name: 'Doctor'
                    })
                }
            } catch (err) {
                console.log(err)
            }

            setSelectedImage(null)
            setInput('')
            return
        }

        // ✅ Normal text
        socketRef.current.emit('send-message', {
            roomId,
            message: input.trim(),
            sender: docId,
            senderType: 'doctor',
            name: 'Doctor'
        })
        setInput('')
    }

    const handleTyping = (e) => {

        setInput(e.target.value)
        socketRef.current.emit('typing', { roomId, name: 'Doctor' })
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedImage(file)
        setInput(file.name)
        e.target.value = ''
    }

    return (
        <div className='flex flex-col h-[500px] border rounded-2xl overflow-hidden shadow-xl bg-white'>

            {/* Header */}



            <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center gap-3'>
                {patientImage && (
                    <img
                        src={patientImage}
                        alt={patientName}
                        className='w-9 h-9 rounded-full object-cover border-2 border-white'
                    />
                )}
                <div className='flex-1'>
                    <p className='text-white font-semibold text-sm'>
                        {patientName || 'Patient'}
                    </p>
                    <p className='text-blue-100 text-xs'>
                        {isTyping ? '✍️ Typing...' : connected ? '🟢 Online' : '🔴 Offline'}
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsCalling(true)
                        setShowVideoCall(true)
                    }}
                    className='text-white text-lg ml-2'
                    title="Call Patient"
                >
                    📞
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

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
                {messages.length === 0 && (
                    <p className='text-center text-gray-400 text-sm mt-10'>
                        👋 Patient ka message aane ka wait karo
                    </p>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${msg.senderType === 'doctor'
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
                                {msg.sender === docId && (
                                    <span className='ml-1'>
                                        {msg.isRead
                                            ? <span className='text-blue-300'>✓✓</span>
                                            : <span className='opacity-60'>✓</span>
                                        }
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
                    placeholder='Patient ko reply karo...'
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
            {showVideoCall && (
                <div className='fixed inset-0 bg-black/90 z-50'>
                    <DoctorVideoCall
                        socketRef={socketRef}
                        roomId={`call_${docId}_${patientId}`}

                        callType={incomingCallData?.callType || 'video'}

                        // ✅ dynamic role
                        isInitiator={isCalling}

                        // ✅ caller / receiver logic
                        callerId={isCalling ? docId : incomingCallData?.callerId}
                        callerModel={isCalling ? 'doctor' : incomingCallData?.callerModel}

                        receiverId={isCalling ? patientId : docId}
                        receiverModel={isCalling ? 'user' : 'doctor'}

                        callerName={isCalling ? 'Doctor' : incomingCallData?.callerName}
                        callerImage={isCalling ? profileData?.image : incomingCallData?.callerImage}

                        receiverName={isCalling ? patientName : 'Doctor'}
                        receiverImage={isCalling ? patientImage : profileData?.image}

                        incomingCall={incomingCallData}

                        onClose={() => {
                            setShowVideoCall(false)
                            setIncomingCallData(null)
                            setIsCalling(false)
                        }}
                    />
                </div>
            )}

        </div>
    )
}

export default DoctorChat