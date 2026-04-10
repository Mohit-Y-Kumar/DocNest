import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='md:mx-10'>

      {/* Heading */}
      <div className='text-center text-3xl pt-12 text-gray-600'>
        <p>CONTACT <span className='text-gray-900 font-semibold'>DOCNEST</span></p>
      </div>

      {/* Content */}
      <div className='my-12 flex flex-col md:flex-row items-center gap-12'>

        {/* Image */}
        <img 
          className='w-full md:max-w-[420px] rounded-xl shadow-md' 
          src={assets.contact_image} 
          alt="contact" 
        />

        {/* Info */}
        <div className='flex flex-col justify-center items-start gap-6 text-gray-600'>

          <div>
            <p className='font-semibold text-lg text-gray-800'>Our Office</p>
            <p className='text-gray-500 mt-2 leading-6'>
              546, Gaur City, 5th Floor <br /> 
              Noida, Sector 122, India
            </p>
          </div>

          <div>
            <p className='font-semibold text-lg text-gray-800'>Contact Info</p>
            <p className='text-gray-500 mt-2 leading-6'>
              Tel: +91 98765 43210 <br /> 
              Email: support@docnest.com
            </p>
          </div>

          <div>
            <p className='font-semibold text-lg text-gray-800'>Careers at DocNest</p>
            <p className='text-gray-500 mt-2'>
              Join our team and help us build the future of healthcare.
            </p>
          </div>

          <button className='mt-2 border border-gray-800 px-8 py-3 text-sm rounded-full 
          hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'>
            Explore Jobs →
          </button>

        </div>

      </div>

    </div>
  )
}

export default Contact