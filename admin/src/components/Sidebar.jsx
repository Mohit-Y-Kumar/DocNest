import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  const adminLinks = [
    { to: '/admin-dashboard',  icon: assets.home_icon,        label: 'Dashboard'    },
    { to: '/all-appointments', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/add-doctor',       icon: assets.add_icon,         label: 'Add Doctor'   },
    { to: '/doctor-list',      icon: assets.people_icon,      label: 'Doctor List'  },
  ]

  const doctorLinks = [
    { to: '/doctor-dashboard',    icon: assets.home_icon,        label: 'Dashboard'    },
    { to: '/doctor-appointments', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/doctor-profile',      icon: assets.people_icon,      label: 'Profile'      },
  ]

  const links = aToken ? adminLinks : dToken ? doctorLinks : []

  return (
    <div className='fixed top-[44px] left-0 h-[calc(100vh-44px)] mt-6 w-16 md:w-56 bg-brand-dark border-r border-white/10 flex flex-col z-40'>

      {/* Logo + Role zone */}
      <div className='px-3 md:px-5 py-5 border-b border-white/10'>
        <div className='flex items-center gap-2.5'>
          <div className='relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0'>
            <div className='absolute w-[3px] h-3.5 bg-white rounded-full' />
            <div className='absolute w-3.5 h-[3px] bg-white rounded-full' />
            <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-pink rounded-full border-2 border-brand-dark' />
          </div>
          <span className='hidden md:block text-white font-bold text-base tracking-tight'>
            <span className='text-primary'>Doc</span>Nest
          </span>
        </div>

        <div className='hidden md:inline-flex mt-3 items-center gap-1.5 bg-white/10 rounded-full px-3 py-1'>
          <span className='w-1.5 h-1.5 rounded-full bg-brand-pink' />
          <span className='text-[10px] font-semibold text-white/70 uppercase tracking-widest'>
            {aToken ? 'Admin Panel' : 'Doctor Panel'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <ul className='mt-4 flex flex-col gap-1 px-2 md:px-3 flex-1'>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 px-2 md:px-4 rounded-xl cursor-pointer transition-all
               justify-center md:justify-start
               ${isActive
                 ? 'bg-primary text-white font-semibold shadow-sm'
                 : 'text-white/50 hover:text-white hover:bg-white/10'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={icon}
                  alt=''
                  className='w-4 h-4 flex-shrink-0'
                  style={{ filter: isActive ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.5)' }}
                />
                <p className='hidden md:block text-sm'>{label}</p>
              </>
            )}
          </NavLink>
        ))}
      </ul>

      

    </div>
  )
}

export default Sidebar