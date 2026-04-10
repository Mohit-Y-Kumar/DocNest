import React, { useState, useRef, useContext } from 'react'
import { AppContext } from '../context/AppContext'

const VoiceChat = ({ onTranscript, onSpeak }) => {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const recognitionRef = useRef(null)

    // ⭐ Speech to Text
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert('Tumhara browser voice support nahi karta. Chrome use karo.')
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.lang = 'hi-IN'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => {
            setIsListening(true)

             window.speechSynthesis.cancel()
    setIsSpeaking(false)
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            onTranscript(transcript)  // ← parent ko bhejo
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.onerror = (event) => {
            setIsListening(false)
            console.log('Voice error:', event.error)
        }

        recognition.start()
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
    }

    // 🔊 Text to Speech
    const speakText = (text) => {
        if (!window.speechSynthesis) return

        window.speechSynthesis.cancel()

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'hi-IN'
            utterance.rate = 0.9   // thoda slow — samajhne mein easy
            utterance.pitch = 1
            utterance.volume = 1

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)

            window.speechSynthesis.speak(utterance)
        }, 500)
    }

    const stopSpeaking = () => {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }


    React.useEffect(() => {
        if (onSpeak) {
            onSpeak(speakText)  // parent ko speakText function do
        }
    }, [])

    return (
        <div className='flex items-center gap-2'>

            {/* 🎤 Mic Button */}
            <button
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop' : 'Voice se bolo'}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                {isListening ? '⏹' : '🎤'}
            </button>

            {/* 🔊 Speaker Button — AI reply band karo */}
            {isSpeaking && (
                <button
                    onClick={stopSpeaking}
                    title='Stop speaking'
                    className='w-9 h-9 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition animate-pulse'
                >
                    🔊
                </button>
            )}

            {/* Status Text */}
            {isListening && (
                <span className='text-xs text-red-500 animate-pulse'>
                    🔴 Listening...
                </span>
            )}
            {isSpeaking && (
                <span className='text-xs text-indigo-500'>
                    🔊 Speaking...
                </span>
            )}
        </div>
    )
}

export default VoiceChat