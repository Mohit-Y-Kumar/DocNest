import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    if (aToken) { setAToken(''); localStorage.removeItem('aToken') }
    if (dToken) { setDToken(''); localStorage.removeItem('dToken') }
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-8 py-3 border-b border-gray-100 bg-white shadow-sm'>

      {/* Left — Logo */}
      <div className='flex items-center gap-3'>
        <img
          className='w-32 sm:w-36 cursor-pointer'
          src={assets.admin_logo}
          alt='DocNest'
        />
        {/* Role pill */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border
          ${aToken
            ? 'bg-blue-50 text-primary border-primary/20'
            : 'bg-pink-50 text-brand-pink border-brand-pink/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${aToken ? 'bg-primary' : 'bg-brand-pink'}`} />
          {aToken ? 'Admin' : 'Doctor'}
        </span>
      </div>

      {/* Right — Logout */}
      <button
        onClick={logout}
        className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all'
      >
        <svg width='14' height='14' viewBox='0 0 20 20' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round'>
          <path d='M13 15l5-5-5-5M18 10H7M10 3H4a1 1 0 00-1 1v12a1 1 0 001 1h6'/>
        </svg>
        Logout
      </button>

    </div>
  )
}

export default Navbar