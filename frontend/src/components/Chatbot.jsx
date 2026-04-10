import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import VoiceChat from './VoiceChat';

const quickButtons = [
    { label: '🤒 Fever', message: 'Mujhe bukhar hai, kaun sa doctor dikhau?' },
    { label: '🤕 Headache', message: 'Mujhe sir dard ho raha hai, kaun sa doctor dikhau?' },
    { label: '🤢 Stomach', message: 'Mujhe pet dard ho raha hai, kaun sa doctor dikhau?' },
    { label: '👁️ Eyes', message: 'Mujhe aankhon mein problem hai, kaun sa doctor dikhau?' },
    { label: '🧒 Child', message: 'Mera bachha beemar hai, kaun sa doctor dikhau?' },
    { label: '🌸 Women', message: 'Mujhe gynecologist se milna hai' },
    { label: '🧴 Skin', message: 'Mujhe skin problem hai, kaun sa doctor dikhau?' },
    { label: '📅 Book Appt', message: 'Mujhe appointment book karni hai' },
];


const Chatbot = () => {
    const { backendUrl, token, doctors } = useContext(AppContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! 👋 Main aapka medical assistant hun. Apne symptoms batao ya appointment book karo!' }
    ]);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState([])

    // Booking states
    const [bookingStep, setBookingStep] = useState(null); // null | 'doctor' | 'date' | 'slot' | 'confirm'
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    const messagesEndRef = useRef(null);
    const speakFnRef = useRef(null)


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, doctors]);



    // Reset all booking related states
    const resetBooking = () => {
        setBookingStep(null);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedSlot('');
        setAvailableSlots([]);
    };

    // Generate available slots (Fixed date parsing)
    const generateSlots = (doctor, dateStr) => {
        if (!doctor || !dateStr) return [];

        const [year, month, day] = dateStr.split('-'); // Correct: YYYY-MM-DD
        const slotDate = `${parseInt(day)}_${parseInt(month)}_${year}`;

        const booked = doctor.slots_booked?.[slotDate] || [];
        const allSlots = [];

        for (let h = 10; h <= 20; h++) {
            ['00', '30'].forEach(m => {
                const time = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
                if (!booked.includes(time)) allSlots.push(time);
            });
        }
        return allSlots;
    };

    // Book Appointment
    const bookAppointment = async () => {
        console.log("🚀 bookAppointment called");

        if (!token) {
            console.log("❌ No token");
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Pehle login karo!' }]);
            resetBooking();
            return;
        }

        if (!selectedDoctor || !selectedDate || !selectedSlot) {
            console.log("❌ Missing data", { selectedDoctor, selectedDate, selectedSlot });
            setMessages(prev => [...prev, { role: 'bot', text: '❌ Kuch details missing hain.' }]);
            return;
        }

        try {
            const [year, month, day] = selectedDate.split('-');
            const slotDate = `${parseInt(day)}_${parseInt(month)}_${year}`;

            console.log("📤 Sending booking request", {
                docId: selectedDoctor._id,
                slotDate,
                slotTime: selectedSlot
            });

            setMessages(prev => [...prev, { role: 'bot', text: '🔄 Booking create ho rahi hai...' }]);

            const { data } = await axios.post(
                `${backendUrl}/api/user/book-appointment`,
                {
                    docId: selectedDoctor._id,
                    slotDate,
                    slotTime: selectedSlot
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("📥 Booking response:", data);

            if (data.success && data.appointmentId) {

                const doctorName = selectedDoctor.name
                const bookingDate = selectedDate
                const bookingSlot = selectedSlot
                const bookingFees = selectedDoctor.fees

                resetBooking()

                initiatePayment(data.appointmentId, doctorName, bookingDate, bookingSlot, bookingFees)
            } else {
                console.log("❌ Booking failed:", data);
                setMessages(prev => [...prev, { role: 'bot', text: '❌ Booking failed' }]);
                resetBooking();
            }

        } catch (error) {
            console.error("❌ Booking error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: '❌ Booking error' }]);
            resetBooking();
        }
    };

    // Razorpay Payment
    const initiatePayment = async (appointmentId, doctorName, bookingDate, bookingSlot, bookingFees) => {
        console.log("💳 initiatePayment called with:", appointmentId);

        if (!appointmentId) return;
        if (!window.Razorpay) {
            console.error('❌ Razorpay not loaded!')
            setMessages(prev => [...prev, {
                role: 'bot',
                text: '❌ Payment system load nahi hua — page refresh karo!'
            }])
            return
        }
        try {
            setLoading(true);

            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-razorpay`,
                { appointmentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Payment data:', data)

            if (!data.success || !data.order) {
                console.log('❌ Order failed:', data)
                return
            }

            console.log('✅ Opening Razorpay...')


            // ✅ window.Razorpay directly use karo — script already loaded hai
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Appointment Payment",
                description: "Doctor Appointment",
                order_id: data.order.id,

                handler: async (response) => {
                    try {
                        const verify = await axios.post(
                            `${backendUrl}/api/user/verifyRazorpay`,
                            { response },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (verify.data.success) {
                            setMessages(prev => [...prev, {
                                role: 'bot',
                                text: `💳 Payment successful! ✅\n👨‍⚕️ ${doctorName}\n📅 ${bookingDate}\n⏰ ${bookingSlot}\n💰 ₹${bookingFees}\nAppointment confirm ho gayi!`
                            }]);

                            setTimeout(() => {
                                navigate('/my-appointments');
                            }, 2000);

                        } else {
                            setMessages(prev => [...prev, {
                                role: 'bot',
                                text: '❌ Payment verification failed.'
                            }]);
                        }
                    } catch (err) {
                        console.error("❌ Verify error:", err);
                    }
                },
                modal: {
                    // ✅ Modal close hone pe bhi handle karo
                    ondismiss: () => {
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            text: '⚠️ Payment cancel ho gayi.'
                        }])
                    }
                },

                theme: { color: "#6366f1" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("❌ Payment error:", error)
            setMessages(prev => [...prev, {
                role: 'bot',
                text: '❌ Payment mein error aa gayi.'
            }])
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (directMessage = null) => {
        const userMessage = directMessage || input.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);
        setSuggestedDoctors([])  // ✅ reset suggested doctors

        // Booking Intent Check
        const lowerMsg = userMessage.toLowerCase();
        if (lowerMsg.includes('appointment') || lowerMsg.includes('book') || lowerMsg.includes('booking')) {
            if (token) {
                setBookingStep('doctor');
                setMessages(prev => [...prev, {
                    role: 'bot',
                    text: '📅 Konse doctor se appointment book karni hai? Neeche se select karo:'
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    text: '⚠️ Appointment book karne ke liye pehle login karo!'
                }]);
            }
            setLoading(false);
            return;
        }

        // Normal AI Chat
        const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/chat/message`,
                {
                    message: userMessage,
                    conversationHistory,
                    doctors: doctors?.slice(0, 10)
                }
            );

            if (data.success) {
                let reply = data.reply
                let detectedSpeciality = null

                // ✅ SPECIALITY tag detect karo
                if (reply.includes('SPECIALITY:')) {
                    const parts = reply.split('SPECIALITY:')
                    reply = parts[0].trim()
                    detectedSpeciality = parts[1].trim()

                    const filtered = doctors?.filter(
                        doc => doc.speciality === detectedSpeciality
                    ).slice(0, 3)

                    setSuggestedDoctors(filtered || [])
                }

                setConversationHistory([...newHistory, { role: 'assistant', content: reply }])
                setMessages(prev => [...prev, { role: 'bot', text: reply }])

                if (speakFnRef.current) {
                    speakFnRef.current(reply)
                }
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, kuch error aa gaya.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Server se connect nahi ho pa raha.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className='fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300'
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className='fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden'>

                    {/* Header */}
                    <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center gap-3'>
                        <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg'>🤖</div>
                        <div>
                            <p className='text-white font-semibold text-sm'>Medical Assistant</p>
                            <p className='text-blue-100 text-xs'>Online • Kuch bhi pucho</p>
                        </div>
                        <button
                            onClick={() => {
                                setMessages([{ role: 'bot', text: 'Hello! 👋 Main aapka medical assistant hun!' }]);
                                setConversationHistory([]);
                                resetBooking();
                            }}
                            className='ml-auto text-blue-100 text-xs hover:text-white'
                        >
                            Clear
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-3 max-h-80'>

                        {/* Quick Buttons - Show only at start */}
                        {messages.length === 1 && (
                            <div className='mb-3'>
                                <p className='text-xs text-gray-400 mb-2 text-center'>Quick select karo 👇</p>
                                <div className='flex flex-wrap gap-2'>
                                    {quickButtons.map((btn, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(btn.message)}
                                            className='text-xs bg-indigo-50 border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition'
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, index) => (


                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {/* Suggested Doctors */}
                        {suggestedDoctors.length > 0 && (
                            <div className='bg-indigo-50 p-3 rounded-xl'>
                                <p className='text-xs text-gray-500 mb-2'>
                                    👨‍⚕️ Suggested Doctors:
                                </p>
                                {suggestedDoctors.map((doc, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            navigate(`/appointment/${doc._id}`)
                                            setIsOpen(false)
                                        }}
                                        className='bg-white p-2 rounded-lg mb-2 cursor-pointer hover:bg-indigo-50 transition border border-indigo-100'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <img
                                                src={doc.image}
                                                alt={doc.name}
                                                className='w-10 h-10 rounded-full object-cover'
                                            />
                                            <div className='flex-1'>
                                                <p className='text-sm font-medium text-gray-800'>{doc.name}</p>
                                                <p className='text-xs text-gray-500'>{doc.speciality}</p>
                                                <div className='flex items-center gap-1'>
                                                    <span className='text-yellow-400 text-xs'>⭐</span>
                                                    <span className='text-xs text-gray-500'>{doc.averageRating || '0.0'}</span>
                                                    <span className='text-xs text-gray-400 ml-2'>₹{doc.fees}</span>
                                                </div>
                                            </div>
                                            <button className='text-xs bg-indigo-600 text-white px-2 py-1 rounded-full'>
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Booking Steps */}
                        {bookingStep === 'doctor' && (
                            <div className='bg-indigo-50 p-3 rounded-xl'>
                                <p className='text-xs text-gray-500 mb-2'>Doctor select karo:</p>
                                <select
                                    onChange={(e) => {
                                        const doc = doctors.find(d => d._id === e.target.value);
                                        setSelectedDoctor(doc);
                                    }}
                                    className='w-full border rounded-lg p-2 text-sm mb-2'
                                >
                                    <option value=''>-- Doctor chuno --</option>
                                    {doctors?.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.name} — {doc.speciality} — ₹{doc.fees}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        if (!selectedDoctor) return;
                                        setBookingStep('date');
                                        setMessages(prev => [...prev, {
                                            role: 'bot',
                                            text: `✅ ${selectedDoctor.name} select kiya. Ab date chuno:`
                                        }]);
                                    }}
                                    disabled={!selectedDoctor}
                                    className='w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm disabled:opacity-50'
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {bookingStep === 'date' && (
                            <div className='bg-indigo-50 p-3 rounded-xl'>
                                <p className='text-xs text-gray-500 mb-2'>Date select karo:</p>
                                <input
                                    type='date'
                                    min={new Date().toISOString().split('T')[0]}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className='w-full border rounded-lg p-2 text-sm mb-2'
                                />
                                <button
                                    onClick={() => {
                                        if (!selectedDate) return;
                                        const slots = generateSlots(selectedDoctor, selectedDate);
                                        setAvailableSlots(slots);
                                        setBookingStep('slot');
                                        setMessages(prev => [...prev, {
                                            role: 'bot',
                                            text: `📅 ${selectedDate} select kiya. Ab time slot chuno:`
                                        }]);
                                    }}
                                    disabled={!selectedDate}
                                    className='w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm disabled:opacity-50'
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {bookingStep === 'slot' && (
                            <div className='bg-indigo-50 p-3 rounded-xl'>
                                <p className='text-xs text-gray-500 mb-2'>Time slot select karo:</p>
                                <div className='flex flex-wrap gap-1 mb-2 max-h-32 overflow-y-auto'>
                                    {availableSlots.map((slot, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`text-xs px-3 py-1 rounded-full border transition ${selectedSlot === slot
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        if (!selectedSlot) return;
                                        setBookingStep('confirm');
                                        setMessages(prev => [...prev, {
                                            role: 'bot',
                                            text: `⏰ ${selectedSlot} select kiya.\n\n📋 Confirm karo:\n👨‍⚕️ ${selectedDoctor.name}\n📅 ${selectedDate}\n⏰ ${selectedSlot}\n💰 ₹${selectedDoctor.fees}`
                                        }]);
                                    }}
                                    disabled={!selectedSlot}
                                    className='w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm disabled:opacity-50'
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {bookingStep === 'confirm' && (
                            <div className='bg-indigo-50 p-3 rounded-xl'>
                                <p className='text-xs text-gray-500 mb-2'>Final confirm karo:</p>
                                <button
                                    onClick={bookAppointment}
                                    disabled={loading}
                                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg text-sm font-medium mb-2 disabled:opacity-50'
                                >
                                    {loading ? '⏳ Processing...' : `💳 Book & Pay ₹${selectedDoctor?.fees}`}
                                </button>
                                <button
                                    onClick={() => {
                                        setMessages(prev => [...prev, { role: 'bot', text: 'Booking cancelled.' }]);
                                        resetBooking();
                                    }}
                                    disabled={loading}
                                    className='w-full border text-gray-500 py-1.5 rounded-lg text-sm disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className='flex justify-start'>
                                <div className='bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none'>
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

                    {/* Input Area - Disabled during booking */}
                    <div className='border-t p-3 flex gap-2'>

                        <VoiceChat
                            onTranscript={(text) => sendMessage(text)}
                            onSpeak={(fn) => { speakFnRef.current = fn }}
                        />
                        <input
                            type='text'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={bookingStep ? 'Booking chal rahi hai...' : 'Kuch bhi pucho...'}
                            className='flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-400'
                            disabled={loading || bookingStep !== null}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim() || bookingStep !== null}
                            className='bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition'
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;