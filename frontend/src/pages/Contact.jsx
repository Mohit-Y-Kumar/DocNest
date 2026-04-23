import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-6xl mx-auto'>

      {/* Heading */}
      <div className='text-center pt-10 sm:pt-14'>
        <p className='text-2xl sm:text-3xl text-gray-500'>
          CONTACT <span className='text-gray-900 font-semibold'>DOCNEST</span>
        </p>
      </div>

      {/* Content */}
      <div className='my-10 sm:my-14 flex flex-col md:flex-row items-center gap-8 md:gap-12'>

        <img
          className='w-full max-w-sm md:max-w-[400px] rounded-xl shadow-md object-cover'
          src={assets.contact_image}
          alt='Contact DocNest'
          loading='lazy'
        />

        <div className='flex flex-col justify-center items-start gap-6 text-gray-600 w-full'>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Our Office</p>
            <p className='text-gray-500 mt-2 leading-6 text-sm sm:text-base'>
              546, Gaur City, 5th Floor <br />
              Noida,  India
            </p>
          </div>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Contact Info</p>
            <p className='text-gray-500 mt-2 leading-6 text-sm sm:text-base'>
              Tel:{' '}
              <a href='tel:+919876543210' className='hover:text-indigo-600 transition'>
                +91 98765 43210
              </a>
              <br />
              Email:{' '}
              <a href='mailto:support@docnest.com' className='hover:text-indigo-600 transition'>
                support@docnest.com
              </a>
            </p>
          </div>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Careers at DocNest</p>
            <p className='text-gray-500 mt-2 text-sm sm:text-base'>
              Join our team and help us build the future of healthcare.
            </p>
          </div>

          <a
            href='mailto:careers@docnest.com'
            className='mt-1 border border-gray-800 px-6 sm:px-8 py-2.5 sm:py-3 text-sm rounded-full
              hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md
              text-gray-800 font-medium inline-block'
          >
            Explore Jobs &rarr;
          </a>

        </div>
      </div>

    </div>
  )
}

export default Contact