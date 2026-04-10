import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='flex flex-col md:flex-row  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
         flex-wrap rounded-lg px-4 md:px-8 lg:px-8'>
            {/* left */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[8vw] md:mb-[-70px]'>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight '
                >Find & Book Trusted Doctors Instantly</p>
                <p>Your Health, Our Priority — Book with Confidence</p>
                <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
                    <img className='w-24' src={assets.group_profiles} alt="" />
                    <p> Explore verified doctors, compare profiles, and book appointments in just a few clicks.</p>
                </div>
                <a className='flex items-center gap-2 bg-white px-8 py-3 rounded-full
                 text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all
                  duration-300' href="#speciality"> Book Now <img className='w-3'
                   src={assets.arrow_icon} alt="" /></a>
            </div>

            {/* right */}
            <div className='md:w-1/2 relative'>
                <img className='w-full md:absolute bottom-0 h-auto rounded-lg ' src={assets.header_img} alt="" />
            </div>
        </div>
    )
}

export default Header
