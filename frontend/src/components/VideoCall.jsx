import React, { useEffect, useState, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'
import { AppContext } from '../context/AppContext'

const VideoCall = ({
    roomId,
    callType = 'video',
    isInitiator = false,
    callerId,
    callerModel,
    receiverId,
    receiverModel,
    callerName = '',
    callerImage = '',
    onClose
}) => {
    const { backendUrl } = useContext(AppContext)

    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [error, setError] = useState(null)
    const [callStatus, setCallStatus] = useState('idle')
    const [duration, setDuration] = useState(0)
    const [incomingCall, setIncomingCall] = useState(null)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const streamRef = useRef(null)
    const timerRef = useRef(null)
    const socketRef = useRef(null)
    const peerRef = useRef(null)
    const pendingSignalsRef = useRef([])

    // ✅ Socket connect
    useEffect(() => {
        socketRef.current = io(backendUrl, {
            transports: ['websocket', 'polling'],
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true'
            }
        })

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-room', roomId)
        })

        socketRef.current.on('incoming-call', (data) => {
            setIncomingCall(data)
            setCallStatus('ringing')
        })

        socketRef.current.on('call-accepted', () => {
            setCallStatus('accepted')
            if (peerRef.current) {
                console.warn('Peer already exists — skip')
                return
            }

            if (!streamRef.current) return
            // ✅ Initiator peer banao jab accept ho
            const peer = new Peer({
                initiator: true,   // ✅ sirf caller initiator hai
                trickle: false,
                stream: streamRef.current
            })

            peer.on('signal', (signalData) => {
                socketRef.current.emit('signal', { roomId, signalData })
            })

            peer.on('stream', (stream) => {
                setRemoteStream(stream)
            })

            peer.on('error', (err) => {
                console.error('Peer error:', err)
                setError('Connection failed')
            })

            peerRef.current = peer

            // ✅ Queue signals
            pendingSignalsRef.current.forEach(sig => {
                try {
                    peer.signal(sig)
                } catch (err) {
                    console.warn('Queued signal error:', err.message)
                }
            })
            pendingSignalsRef.current = []

        })

        socketRef.current.on('call-rejected', () => {
            setCallStatus('rejected')
            alert('Call reject ho gayi')
            onClose()
        })

        socketRef.current.on('call-ended', () => {
            endCall()
        })

        socketRef.current.on('signal', ({ signalData }) => {
            if (peerRef.current) {
                try {
                    if (!peerRef.current.destroyed) {
                        peerRef.current.signal(signalData)
                    }
                } catch (err) {
                    console.warn('Signal ignored:', err.message)
                }
            } else {
                // ✅ Peer ready nahi — queue karo
                pendingSignalsRef.current.push(signalData)
            }
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [backendUrl, roomId])

    // ✅ Local video
    useEffect(() => {
        const startLocalStream = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setError('Camera/Mic supported nahi — HTTPS use karo ya localhost pe chalao')
                    return
                }

                let stream;

                try {
                    // ✅ Pehle video + audio try karo
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: callType === 'video',
                        audio: true
                    })
                } catch (err) {
                    // ✅ Camera busy — sirf audio try karo
                    console.warn('Camera busy — audio only')
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: true
                    })
                }

                setLocalStream(stream)
                streamRef.current = stream

                if (localVideoRef.current && stream.getVideoTracks().length > 0) {
                    localVideoRef.current.srcObject = stream
                }

            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera/Mic permission do')
                } else if (err.name === 'NotFoundError') {
                    setError('Camera/Mic nahi mila')
                } else {
                    setError(`Error: ${err.message}`)
                }
            }
        }
        startLocalStream()

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop())
            clearInterval(timerRef.current)
        }
    }, [])

    // ✅ isInitiator — auto call shuru karo
    useEffect(() => {
        if (isInitiator && localStream) {
            initiateCall()
        }
    }, [isInitiator, localStream])

    // ✅ Remote video
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // ✅ Timer
    useEffect(() => {
        if (callStatus === 'accepted') {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)
        } else {
            clearInterval(timerRef.current)
        }
        return () => clearInterval(timerRef.current)
    }, [callStatus])

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    // ✅ Initiator peer — call accept hone ke baad
    const createInitiatorPeer = () => {
        if (!streamRef.current) return

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: streamRef.current
        })

        peer.on('signal', (signalData) => {
            socketRef.current.emit('signal', { roomId, signalData })
        })

        peer.on('stream', (stream) => {
            setRemoteStream(stream)
        })

        peer.on('error', (err) => {
            console.error('Peer error:', err)
            setError('Connection failed')
        })

        peerRef.current = peer

        // ✅ Queue signals
        pendingSignalsRef.current.forEach(sig => peer.signal(sig))
        pendingSignalsRef.current = []
    }

    // ✅ Call shuru karo — sirf call-user emit
    const initiateCall = () => {
        if (!streamRef.current) return
        setCallStatus('ringing')

        socketRef.current.emit('call-user', {
            roomId,
            callerId,
            callerModel,
            receiverId,
            receiverModel,
            callType,
            callerName,
            callerImage
        })
    }

    // ✅ Accept call — receiver peer banao
    const acceptCall = () => {
        if (!streamRef.current) {
            setError('Camera ready nahi hai')
            return
        }

        setIncomingCall(null)
        setCallStatus('accepted')

        socketRef.current.emit('call-accepted', { roomId })

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: streamRef.current
        })

        peer.on('signal', (signalData) => {
            socketRef.current.emit('signal', { roomId, signalData })
        })

        peer.on('stream', (stream) => {
            setRemoteStream(stream)
        })

        peer.on('error', (err) => {
            console.error('Peer error:', err)
            setError('Connection failed')
        })

        peerRef.current = peer

        // ✅ Queue signals
        pendingSignalsRef.current.forEach(sig => peer.signal(sig))
        pendingSignalsRef.current = []
    }

    const rejectCall = () => {
        setIncomingCall(null)
        socketRef.current.emit('call-rejected', { roomId })
        setCallStatus('idle')
        onClose()
    }

    const endCall = () => {
        peerRef.current?.destroy()
        streamRef.current?.getTracks().forEach(t => t.stop())
        if (socketRef.current) {
            socketRef.current.emit('call-ended', { roomId })
        }
        clearInterval(timerRef.current)
        setCallStatus('ended')
        onClose()
    }

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
        setIsMuted(prev => !prev)
    }

    const toggleVideo = () => {
        localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
        setIsVideoOff(prev => !prev)
    }

    return (
        <div className='w-full h-full bg-black flex flex-col'>

            {error && (
                <div className='absolute top-4 left-0 right-0 flex justify-center z-10'>
                    <p className='bg-red-500 text-white px-4 py-2 rounded-full text-sm'>{error}</p>
                </div>
            )}

            {callStatus === 'accepted' && (
                <div className='absolute top-4 left-0 right-0 flex justify-center z-10'>
                    <p className='bg-black/50 text-white px-4 py-1 rounded-full text-sm'>
                        ⏱️ {formatDuration(duration)}
                    </p>
                </div>
            )}

            <div className='flex-1 relative bg-gray-900'>
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className='w-full h-full object-cover' />
                ) : (
                    <div className='w-full h-full flex flex-col items-center justify-center bg-gray-800'>
                        <div className='w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl mb-3'>👤</div>
                        <p className='text-white text-sm'>
                            {callStatus === 'idle' && '⏳ Wait karo...'}
                            {callStatus === 'ringing' && '🔔 Ringing...'}
                            {callStatus === 'ended' && '📵 Call Ended'}
                        </p>
                    </div>
                )}

                <div className='absolute bottom-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white shadow-lg'>
                    {!isVideoOff ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className='w-full h-full object-cover' />
                    ) : (
                        <div className='w-full h-full bg-gray-700 flex items-center justify-center text-2xl'>👤</div>
                    )}
                </div>
            </div>

            <div className='bg-black/80 py-6 flex items-center justify-center gap-6'>
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition
                        ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    {isMuted ? '🔇' : '🎙️'}
                </button>

                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition
                            ${isVideoOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {isVideoOff ? '📷' : '📹'}
                    </button>
                )}

                <button
                    onClick={endCall}
                    className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-xl'
                >
                    📵
                </button>
            </div>

            {/* Incoming Call Popup */}
            {incomingCall && (
                <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center'>
                    <div className='bg-white rounded-2xl p-6 w-72 flex flex-col items-center gap-4'>
                        {incomingCall?.callerImage
                            ? <img src={incomingCall.callerImage} className='w-20 h-20 rounded-full object-cover' />
                            : <div className='w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl'>👤</div>
                        }
                        <p className='text-gray-800 font-semibold text-lg'>{incomingCall?.callerName}</p>
                        <p className='text-gray-500 text-sm'>
                            {incomingCall?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call'}
                        </p>
                        <div className='flex gap-6 mt-2'>
                            <button onClick={acceptCall} className='w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-2xl'>✅</button>
                            <button onClick={rejectCall} className='w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-2xl'>❌</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VideoCall