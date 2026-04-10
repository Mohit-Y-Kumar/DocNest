import React, { useEffect, useState, useRef, useContext } from 'react'

import Peer from 'simple-peer'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorVideoCall = ({
    socketRef,
    roomId,
    incomingCall,
    callType = 'video',
    isInitiator = false,
    callerId,
    callerModel,
    receiverId,
    receiverModel,
    callerName = '',
    callerImage = '',
    receiverName = '',
    receiverImage = '',
    onClose
}) => {
    const { profileData } = useContext(DoctorContext)

    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [error, setError] = useState(null)
    const [callStatus, setCallStatus] = useState('idle')
    const [duration, setDuration] = useState(0)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const pendingSignalsRef = useRef([])
    const streamRef = useRef(null)
    const timerRef = useRef(null)
    const peerRef = useRef(null)
    const [incomingCallState, setIncomingCallState] = useState(incomingCall || null)
    useEffect(() => {
        const socket = socketRef.current
        if (!socket) return

        // ✅ Socket useEffect mein ye update karo
        const onCallAccepted = () => {
            setCallStatus('accepted')
            if (peerRef.current) {
                console.warn('Peer already exists — skip')
                return
            }

            if (!streamRef.current) return
            // ✅ Doctor initiator hai — peer banao
            try {
                const peer = new Peer({
                    initiator: true,   // ✅ doctor caller hai
                    trickle: false,
                    stream: streamRef.current
                })

                peer.on('signal', (signalData) => {
                    socketRef.current.emit('signal', { roomId, signalData })
                })

                peer.on('stream', (stream) => setRemoteStream(stream))

                peer.on('error', (err) => {
                    console.error('Peer error:', err)
                    setError('Connection failed')
                })

                peerRef.current = peer

                pendingSignalsRef.current.forEach(sig => {
                    try {
                        peer.signal(sig)
                    } catch (err) {
                        console.warn('Queued signal error:', err.message)
                    }
                })
                pendingSignalsRef.current = []

            } catch (err) {
                console.error('Peer creation failed:', err)
                setError('Cannot create peer connection')
            }

        }
        const onCallRejected = () => { setCallStatus('rejected'); onClose() }
        const onCallEnded = () => endCall()
        const onSignal = ({ signalData }) => {
            console.log('Signal received, type:', signalData?.type)
            console.log('Peer exists:', !!peerRef.current)
            console.log('Peer destroyed:', peerRef.current?.destroyed)
            if (peerRef.current) {
                try {
                    if (!peerRef.current.destroyed) {
                        peerRef.current.signal(signalData)
                    }
                } catch (err) {
                    console.warn('Signal ignored:', err.message)
                }
            } else {
                // ✅ Queue signal if peer not ready yet
                pendingSignalsRef.current.push(signalData)
            }
        }

        socket.on('call-accepted', onCallAccepted)
        socket.on('call-rejected', onCallRejected)
        socket.on('call-ended', onCallEnded)
        socket.on('signal', onSignal)

        return () => {
            socket.off('call-accepted', onCallAccepted)
            socket.off('call-rejected', onCallRejected)
            socket.off('call-ended', onCallEnded)
            socket.off('signal', onSignal)
        }
    }, [socketRef, onClose])



    // Local stream
    useEffect(() => {
        const startLocalStream = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setError('Camera/Mic supported nahi — HTTPS use karo ya localhost pe chalao')
                    return
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: callType === 'video',
                    audio: true
                })
                setLocalStream(stream)
                streamRef.current = stream
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera/Mic permission do')
                } else if (err.name === 'NotFoundError') {
                    setError('Camera/Mic nahi mila')
                } else {
                    setError('Camera/Mic access nahi mila — HTTPS use karo')
                }
            }
        }
        startLocalStream()

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop())
            clearInterval(timerRef.current)
        }
    }, [])

    // Remote stream
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // Timer
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

    const handleCallClick = () => {
        if (!streamRef.current) {
            setError('Camera/Mic abhi ready nahi hai')
            return
        }
        initiateCall()
    }

    const formatDuration = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0')
        const sec = (s % 60).toString().padStart(2, '0')
        return `${m}:${sec}`
    }

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
        setIsMuted(prev => !prev)
    }

    const toggleVideo = () => {
        localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
        setIsVideoOff(prev => !prev)
    }

    const endCall = () => {
        peerRef.current?.destroy()
        streamRef.current?.getTracks().forEach(t => t.stop())
        socketRef.current?.emit('call-ended', { roomId })
        clearInterval(timerRef.current)
        setCallStatus('ended')
        setDuration(0)
        onClose()
    }

    const initiateCall = () => {

        if (!streamRef.current) {
            setError('Camera/Mic abhi ready nahi hai')
            return
        }
        setCallStatus('ringing')

        socketRef.current.emit('join-room', roomId)
        socketRef.current.emit('call-user', {  // ✅ call-user — incoming-call nahi
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

    const acceptCall = () => {
        if (!streamRef.current) {
            setError('Camera/Mic abhi ready nahi hai')
            return
        }
        if (peerRef.current) {
            peerRef.current.destroy()
            peerRef.current = null
        }

        setIncomingCallState(null)
        setCallStatus('accepted')

        socketRef.current.emit('join-room', roomId)
        socketRef.current.emit('call-accepted', { roomId })

        try {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: streamRef.current  // ✅ ref use karo
            })

            peer.on('signal', (signalData) => {
                socketRef.current.emit('signal', { roomId, signalData })
            })

            peer.on('stream', (stream) => setRemoteStream(stream))

            peer.on('error', (err) => {
                console.error('Peer error:', err)
                setError('Connection failed')
            })

            peerRef.current = peer

            pendingSignalsRef.current.forEach(sig => {
                try {
                    peer.signal(sig)
                } catch (err) {
                    console.warn('Queued signal error:', err.message)
                }
            })
            pendingSignalsRef.current = []

        } catch (err) {
            console.error('Peer creation failed:', err)
            setError('Cannot create peer connection')
        }
    }

    const rejectCall = () => {
        setIncomingCallState(null)
        socketRef.current.emit('call-rejected', { roomId })
        setCallStatus('idle')
        onClose()
    }

    return (
        <div className='fixed inset-0 bg-black z-50 flex flex-col'>

            {/* Error */}
            {error && (
                <div className='absolute top-4 left-0 right-0 flex justify-center z-10'>
                    <p className='bg-red-500 text-white px-4 py-2 rounded-full text-sm'>{error}</p>
                </div>
            )}

            {/* Timer */}
            {callStatus === 'accepted' && (
                <div className='absolute top-4 left-0 right-0 flex justify-center z-10'>
                    <p className='bg-black/50 text-white px-4 py-1 rounded-full text-sm'>
                        ⏱️ {formatDuration(duration)}
                    </p>
                </div>
            )}

            {/* Remote Video */}
            <div className='flex-1 relative bg-gray-900'>
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className='w-full h-full object-cover' />
                ) : (
                    <div className='w-full h-full flex flex-col items-center justify-center bg-gray-800'>
                        <div className='w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl mb-3'>
                            {receiverImage
                                ? <img src={receiverImage} className='w-full h-full rounded-full object-cover' />
                                : '👤'
                            }
                        </div>
                        <p className='text-white text-sm'>
                            {callStatus === 'idle' && '📞 Calling...'}
                            {callStatus === 'ringing' && `🔔 Calling ${receiverName}...`}
                            {callStatus === 'ended' && '📵 Call Ended'}
                        </p>
                    </div>
                )}

                {/* Local Video */}
                <div className='absolute bottom-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white shadow-lg'>
                    {!isVideoOff ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className='w-full h-full object-cover' />
                    ) : (
                        <div className='w-full h-full bg-gray-700 flex items-center justify-center text-2xl'>👤</div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className='bg-black/80 py-6 flex items-center justify-center gap-6'>
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${isMuted ? 'bg-red-500' : 'bg-gray-600'}`}
                >
                    {isMuted ? '🔇' : '🎙️'}
                </button>

                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${isVideoOff ? 'bg-red-500' : 'bg-gray-600'}`}
                    >
                        {isVideoOff ? '📷' : '📹'}
                    </button>
                )}

                <button
                    onClick={handleCallClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${!localStream ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'
                        }`}
                    disabled={!localStream}
                >
                    📞
                </button>

                <button
                    onClick={endCall}
                    className='w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl'
                >
                    📵
                </button>
            </div>

            {/* Incoming Call Popup */}
            {incomingCallState && callStatus !== 'accepted' && (
                <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center'>
                    <div className='bg-white rounded-2xl p-6 w-72 flex flex-col items-center gap-4'>
                        {incomingCallState?.callerImage
                            ? <img src={incomingCallState.callerImage} className='w-20 h-20 rounded-full object-cover' />
                            : <div className='w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl'>👤</div>
                        }
                        <p className='text-gray-800 font-semibold text-lg'>{incomingCallState?.callerName}</p>
                        <p className='text-gray-500 text-sm'>
                            {incomingCallState?.callType === 'video' ? '📹 Video Call' : '📞 Audio Call'}
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

export default DoctorVideoCall