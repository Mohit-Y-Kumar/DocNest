import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'
import Review from '../components/Review'
import ChatWindow from '../components/ChatWindow'
import VideoCall from '../components/VideoCall'


const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData, userData } = useContext(AppContext)
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()
  const location = useLocation();
  const isReviewMode = location.state?.review;
  const canReview = location.state?.canReview;
  const appointmentId = location.state?.appointmentId;
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);


  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const [showChat, setShowChat] = useState(false)

  const fetchDoctorReviews = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/reviews/doctor/${docId}`
      );
      if (data.success) {
        setDoctorReviews(data.reviews);
        setReviewSummary(data.summary);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDocInfo = () => {
    if (doctors.length > 0) {
      const foundDoc = doctors.find(doc => doc._id?.toString() === docId)
      setDocInfo(foundDoc)
    }
  }

  const getAvailableSlots = async () => {
    setDocSlots([])

    //get curr date
    let today = new Date()
    for (let i = 0; i < 7; i++) {
      // get date with idx
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      //setting end time of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)
      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime

        const isSlotAvailable = !(docInfo?.slots_booked?.[slotDate]?.includes(slotTime));

        if (isSlotAvailable) {
          // add time slots
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })

        }




        // Increment current time by 30 min.
        currentDate.setMinutes(currentDate.getMinutes() + 30)

      }

      setDocSlots(prev => ([...prev, timeSlots]))

    }

  }



  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }


    try {
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        {
          docId,
          slotDate,
          slotTime
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message);
      }


    } catch (error) {
      console.log(error)
      toast.error(error.message)

    }
  }




  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  useEffect(() => {
    console.log(docSlots)
  }, [docSlots])

  useEffect(() => {
    fetchDoctorReviews();
  }, [docId]);

  if (!docInfo) {
    return <p className="text-center mt-20">Loading...</p>
  }
  return docInfo && (
    <div>
       
      {/* doctor detail */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className=' rounded-xl'>
          <img className='p-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full sm:max-w-72 rounded-lg bg-white' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 rounded-xl p-8 py-7 bg-white shadow-xl mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* details */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'> {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" /></p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p> {docInfo.degree} - {docInfo.speciality} </p>
            <button className='py-0.5 px-2 border text-xs rounded-full'> {docInfo.experience}</button>
          </div>

          {/* about */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'> {docInfo.about} </p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee:  <span className='text-gray-600'>{currencySymbol} {docInfo.fees}</span>
          </p>

          {token ? (
            <button
              onClick={() => setShowChat(true)}
              className='mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm hover:scale-105 transition-all duration-300'
            >
              💬 Chat with Doctor
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='mt-4 flex items-center gap-2 border border-indigo-400 text-indigo-600 px-6 py-2 rounded-full text-sm'
            >
              💬 Login to Chat
            </button>
          )}

         

        </div>
      </div>

      {/*  BOOKING SLOTS*/}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className=' flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer
               text-gray-900 ${slotIndex === index ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`} key={index}>
                <p> {item[0] && dayOfWeek[item[0].datetime.getDay()]} </p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots[slotIndex]?.map((item, index) => (

            <p
              onClick={() => setSlotTime(item.time)}
              key={index}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer
            text-gray-900
           ${item.time === slotTime
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100 transition'}`}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          disabled={!slotTime}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-light px-14 py-3 rounded-full my-6 ${!slotTime ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Book an appointment
        </button>
        {/* Review Section */}
        {isReviewMode && canReview && (
          <Review
            canReview={true}
            appointmentId={appointmentId}
            doctorId={docId}
            onReviewSubmit={fetchDoctorReviews}
          />
        )}

        {/* Public Reviews — Sab dekh sakte hain */}
        <Review
          readOnly={true}
          reviewData={doctorReviews}
          summary={reviewSummary}
          onReviewSubmit={fetchDoctorReviews}
        />
      </div>
      {/* Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

      {showChat && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='w-full max-w-md'>
            <ChatWindow
              appointmentId={`chat_${docId}_${userData._id}`}
              doctorId={docId}  
              doctorName={docInfo.name}
              doctorImage={docInfo.image}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}

    </div>
  )


}

export default Appointment
