import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='bg-gray-900 text-gray-300 mt-20'>
            
            <div className='md:mx-10 px-6 py-12 grid gap-10 sm:grid-cols-[2fr_1fr_1fr]'>

                {/* LEFT */}
                <div>
                    <img className='mb-5 w-44 bg-white p-2 rounded-md text-5xl' src={assets.logo} alt="" />
                    
                    <p className='text-gray-400 leading-6 md:w-2/3'>
                        DocNest connects you with trusted doctors for fast, reliable,
                        and convenient healthcare services — anytime, anywhere.
                    </p>
                </div>

                {/* CENTER */}
                <div>
                    <p className='text-lg font-semibold mb-5 text-white'>Company</p>
                    
                    <ul className='flex flex-col gap-3'>
                        <li className='hover:text-white cursor-pointer'>Home</li>
                        <li className='hover:text-white cursor-pointer'>About Us</li>
                        <li className='hover:text-white cursor-pointer'>Contact Us</li>
                        <li className='hover:text-white cursor-pointer'>Privacy Policy</li>
                    </ul>
                </div>

                {/* RIGHT */}
                <div>
                    <p className='text-lg font-semibold mb-5 text-white'>Get in Touch</p>
                    
                    <ul className='flex flex-col gap-3'>
                        <li>+91 98765 43210</li>
                        <li>support@docnest.com</li>
                    </ul>
                </div>

            </div>

            {/* Bottom */}
            <div className='border-t border-gray-700 text-center py-5 text-sm text-gray-400'>
                © 2026 DocNest. All Rights Reserved.
            </div>

        </div>
    )
}

export default Footer