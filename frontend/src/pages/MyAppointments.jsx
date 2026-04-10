import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const navigate = useNavigate()
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1] - 1)] + " " + dateArray[2]

  }

  const getUserAppointments = async () => {
    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { 'Authorization': `Bearer ${token}` } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments);
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)

    }
  }


  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment cancelled successfully");

        // refresh list
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);

    }
  }

  
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount, // must be in paise
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,

      handler: async (response) => {
        console.log(response)

        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            { response },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.success) {
            getUserAppointments();
            navigate('/my-appointments')
          } else {
            toast.error("Payment verification failed");
          }
        }
        catch (error) {
          console.error("Verification error:", error);
          toast.error(
            error?.response?.data?.message || "Payment verification error"
          );
        }
      },

      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };



  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }


    } catch (error) {

    }


  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])



  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[lfr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32  bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className=' flex-1 text-sm text-zinc-600'>
              <p className='  text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className=' text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>

              {item.cancelled && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                  Appointment cancelled
                </button>
              )}

              {!item.cancelled && !item.isCompleted && (
                <>
                  {item.payment ? (
                    <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>
                      Paid
                    </button>
                  ) : (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className='text-sm text-center sm:min-w-48 py-2 border bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:text-white transition-all duration-300'
                    >
                      Pay Online
                    </button>
                  )}

                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'
                  >
                    Cancel appointment
                  </button>
                </>
              )}

              {!item.cancelled && item.isCompleted && (
                <>
                  <button className='sm:min-w-48 py-2 border border-green-500 text-green-500'>
                    Completed
                  </button>

                  {item.payment && (
                    <button
                      onClick={() =>
                        navigate(`/appointment/${item.docId}`, {
                          state: { review: true, canReview: true,appointmentId: item._id  }
                        })
                      }
                      className='sm:min-w-48 py-2 border bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:text-white transition-all duration-300'
                    >
                      Give Review
                    </button>
                  )}
                </>
              )}

            </div>


          </div>
        ))}
      </div>
    </div >
  )

}

export default MyAppointments