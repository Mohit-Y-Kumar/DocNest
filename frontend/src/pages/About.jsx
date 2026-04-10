import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='md:mx-10'>

      {/* Heading */}
      <div className='text-center text-3xl pt-12 text-gray-600'>
        <p>ABOUT <span className='text-gray-900 font-semibold'>DOCNEST</span></p>
      </div>

      {/* Section 1 */}
      <div className='my-12 flex flex-col md:flex-row items-center gap-12'>
        
        <img 
          className='w-full md:max-w-[420px] rounded-xl shadow-md' 
          src={assets.about_image} 
          alt="about" 
        />

        <div className='flex flex-col justify-center gap-6 md:w-1/2 text-gray-600 leading-7'>
          
          <p>
            Welcome to <span className='font-medium text-gray-800'>DocNest</span>, your trusted platform for booking doctor appointments 
            quickly and easily. We simplify healthcare access by connecting patients with verified medical professionals.
          </p>

          <p>
            At DocNest, we understand the challenges of managing appointments and maintaining health records. 
            Our platform is designed to provide a seamless and stress-free experience for users.
          </p>

          <p>
            We are committed to innovation in healthcare technology, continuously improving our platform 
            to deliver better services and user experience.
          </p>

          <div>
            <p className='font-semibold text-gray-800'>Our Vision</p>
            <p>
              To create a seamless healthcare ecosystem where patients can easily connect with doctors 
              and access quality medical care anytime, anywhere.
            </p>
          </div>

        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className='text-2xl my-6 text-gray-700 font-semibold'>
        WHY CHOOSE US
      </div>

      <div className='grid md:grid-cols-3 gap-6 mb-20'>

        {/* Card 1 */}
        <div className='border rounded-xl px-8 py-10 flex flex-col gap-4 text-gray-600 
        hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white 
        transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer'>
          
          <b className='text-lg'>Efficiency</b>
          <p>
            Book appointments in seconds with our fast and streamlined system.
          </p>
        </div>

        {/* Card 2 */}
        <div className='border rounded-xl px-8 py-10 flex flex-col gap-4 text-gray-600 
        hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white 
        transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer'>
          
          <b className='text-lg'>Convenience</b>
          <p>
            Access a wide network of trusted doctors from the comfort of your home.
          </p>
        </div>

        {/* Card 3 */}
        <div className='border rounded-xl px-8 py-10 flex flex-col gap-4 text-gray-600 
        hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white 
        transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer'>
          
          <b className='text-lg'>Personalization</b>
          <p>
            Get personalized recommendations and reminders for better healthcare management.
          </p>
        </div>

      </div>

    </div>
  )
}

export default About