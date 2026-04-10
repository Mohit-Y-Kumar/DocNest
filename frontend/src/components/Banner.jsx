import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()
    return (
        <div className='flex  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg px-6 sm:px-10 md:px-14 lg:px-10 my-20 '>
            {/* left */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
                <div>
                    <p className='text-2xl md:text-3xl font-semibold text-white'>
                        Book Appointments Instantly
                    </p>

                    <p className='mt-4 text-white/90'>
                        Connect with 100+ verified doctors and get the care you need.
                    </p>
                </div>
                <button onClick={() => { navigate('/login'); scrollTo(0, 0) }} className='bg-white text-sm sm:text-base text-gray-700 px-8 py-3
                 rounded-full mt-6 hover:scale-105 transition-all duration-300 shadow-md'>Get Started →</button>

            </div>


            {/* right */}
            <div className='hidden md:block md:w-1/2 relative h-[350px] lg:h-[420px]'>
                <img
                    className='absolute bottom-0 right-0 w-[140%] lg:w-[170%] object-contain drop-shadow-2xl'
                    src={assets.appointment_img}
                    alt=""
                />
            </div>

        </div>
    )
}

export default Banner
