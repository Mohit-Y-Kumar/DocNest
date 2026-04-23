import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className='bg-gray-900 text-gray-300 mt-20'>

            <div className='md:mx-10 px-6 py-12 grid gap-10 sm:grid-cols-[2fr_1fr_1fr]'>

                {/* Left */}
                <div>
                    <img
                        className='mb-5 w-40 bg-white p-2 rounded-md'
                        src={assets.logo}
                        alt="DocNest logo"
                    />
                    <p className='text-gray-400 leading-6 text-sm md:w-2/3'>
                        DocNest connects you with trusted doctors for fast, reliable,
                        and convenient healthcare services — anytime, anywhere.
                    </p>
                </div>

                {/* Center */}
                <div>
                    <p className='text-base font-semibold mb-5 text-white'>Company</p>
                    <ul className='flex flex-col gap-3 text-sm'>
                        <li>
                            <NavLink to='/' onClick={() => window.scrollTo(0, 0)}
                                className='hover:text-white transition-colors'>
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/about' onClick={() => window.scrollTo(0, 0)}
                                className='hover:text-white transition-colors'>
                                About Us
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/contact' onClick={() => window.scrollTo(0, 0)}
                                className='hover:text-white transition-colors'>
                                Contact Us
                            </NavLink>
                        </li>
                        <li>
                            <span className='hover:text-white transition-colors cursor-pointer'>
                                Privacy Policy
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Right */}
                <div>
                    <p className='text-base font-semibold mb-5 text-white'>Get in Touch</p>
                    <ul className='flex flex-col gap-3 text-sm'>
                        <li>
                            <a href='tel:+919876543210'
                                className='hover:text-white transition-colors'>
                                +91 98765 43210
                            </a>
                        </li>
                        <li>
                            <a href='mailto:support@docnest.com'
                                className='hover:text-white transition-colors break-all'>
                                support@docnest.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div className='border-t border-gray-700 text-center py-5 text-xs text-gray-500'>
                © {new Date().getFullYear()} DocNest. All Rights Reserved.
            </div>
        </footer>
    )
}

export default Footer