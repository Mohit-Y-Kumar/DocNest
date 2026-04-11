import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) getDashData()
  }, [dToken])

  const weekData = [
    { day: 'Mon', new: 62, ret: 38 },
    { day: 'Tue', new: 75, ret: 55 },
    { day: 'Wed', new: 48, ret: 42 },
    { day: 'Thu', new: 90, ret: 60 },
    { day: 'Fri', new: 82, ret: 70 },
    { day: 'Sat', new: 55, ret: 30 },
    { day: 'Sun', new: 30, ret: 18 },
  ]
  const maxVal = Math.max(...weekData.map(d => d.new + d.ret))

  return dashData && (
    <div className='ml-24 md:ml-64  m-5 space-y-5'>

      {/* ── Page Heading ── */}
      <div>
        <h1 className='text-xl font-bold text-brand-dark'>Dashboard Overview</h1>
        <p className='text-xs text-gray-400 mt-0.5'>Welcome back, Doctor</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>

        {/* Earnings */}
        <div className='relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group'>
          <div className='absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-2xl' />
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xs font-semibold uppercase tracking-widest text-primary'>Earnings</span>
            <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <img className='w-5 h-5 object-contain' src={assets.earning_icon} alt='earnings' />
            </div>
          </div>
          <p className='text-3xl font-bold text-brand-dark'>{currency}{dashData.earnings}</p>
          <p className='text-xs text-gray-400 mt-1'>Total lifetime earnings</p>
          <span className='inline-flex items-center gap-1 mt-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600'>↑ 8.2% this month</span>
        </div>

        {/* Appointments */}
        <div className='relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group'>
          <div className='absolute top-0 left-0 right-0 h-[3px] bg-brand-pink rounded-t-2xl' />
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xs font-semibold uppercase tracking-widest text-brand-pink'>Appointments</span>
            <div className='w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <img className='w-5 h-5 object-contain' src={assets.appointments_icon} alt='appointments' />
            </div>
          </div>
          <p className='text-3xl font-bold text-brand-dark'>{dashData.appointments}</p>
          <p className='text-xs text-gray-400 mt-1'>Total bookings</p>
          <span className='inline-flex items-center gap-1 mt-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-brand-pink'>↑ 5 from yesterday</span>
        </div>

        {/* Patients */}
        <div className='relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group'>
          <div className='absolute top-0 left-0 right-0 h-[3px] bg-green-500 rounded-t-2xl' />
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xs font-semibold uppercase tracking-widest text-green-500'>Patients</span>
            <div className='w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <img className='w-5 h-5 object-contain' src={assets.patients_icon} alt='patients' />
            </div>
          </div>
          <p className='text-3xl font-bold text-brand-dark'>{dashData.patients}</p>
          <p className='text-xs text-gray-400 mt-1'>Unique patients seen</p>
          <span className='inline-flex items-center gap-1 mt-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600'>↑ 12.4% this week</span>
        </div>

      </div>

      {/* ── Middle Grid: Appointments + Chart ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>

        {/* Latest Bookings */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-primary rounded-full' />
              <p className='font-semibold text-brand-dark text-sm'>Latest Bookings</p>
            </div>
            <span className='text-xs text-gray-400'>{dashData?.latestAppointments?.length || 0} records</span>
          </div>

          {/* Table Header */}
          <div className='hidden sm:grid grid-cols-[2fr_1.5fr_1fr] px-5 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
            <span>Patient</span>
            <span>Date</span>
            <span className='text-right'>Status</span>
          </div>

          {dashData?.latestAppointments?.length > 0 ? (
            <div className='divide-y divide-gray-50 max-h-72 overflow-y-auto'>
              {dashData.latestAppointments.map((item) => (
                <div
                  key={item._id}
                  className='grid grid-cols-[2fr_1.5fr_1fr] items-center px-5 py-3 hover:bg-blue-50/30 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <img className='w-8 h-8 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0' src={item.userData?.image} alt='' />
                    <p className='text-sm font-semibold text-gray-800 truncate'>{item.userData?.name}</p>
                  </div>
                  <p className='text-xs text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                  <div className='flex justify-end'>
                    {item.cancelled ? (
                      <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500'>Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600'>Completed</span>
                    ) : (
                      <div className='flex gap-1.5'>
                        <button onClick={() => cancelAppointment(item._id)} className='w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition' title='Cancel'>
                          <img className='w-3.5 h-3.5' src={assets.cancel_icon} alt='cancel' />
                        </button>
                        <button onClick={() => completeAppointment(item._id)} className='w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center transition' title='Complete'>
                          <img className='w-3.5 h-3.5' src={assets.tick_icon} alt='complete' />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3'>
                <img className='w-6' src={assets.appointments_icon} alt='' />
              </div>
              <p className='text-sm text-gray-400'>No recent appointments</p>
            </div>
          )}
        </div>

        {/* Patient Visits Chart */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-brand-pink rounded-full' />
              <p className='font-semibold text-brand-dark text-sm'>Patient Visits — This Week</p>
            </div>
          </div>

          <div className='p-5'>
            {/* Bars */}
            <div className='flex items-end gap-2 h-32 mb-3'>
              {weekData.map((d) => {
                const total = d.new + d.ret
                const newH = Math.round((d.new / maxVal) * 100)
                const retH = Math.round((d.ret / maxVal) * 100)
                return (
                  <div key={d.day} className='flex-1 flex flex-col items-center gap-1 h-full'>
                    <div className='flex-1 w-full flex flex-col justify-end gap-0.5'>
                      <div
                        className='w-full rounded-t bg-primary transition-all duration-500'
                        style={{ height: `${newH}%` }}
                      />
                      <div
                        className='w-full bg-primary/20'
                        style={{ height: `${retH}%` }}
                      />
                    </div>
                    <span className='text-[9px] text-gray-400 font-medium'>{d.day}</span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className='flex gap-4 text-[10px] text-gray-400'>
              <span className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-primary inline-block' />
                New Patients
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-primary/30 inline-block' />
                Returning
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Grid: Quick Actions + Activity ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>

        {/* Quick Actions */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='flex items-center gap-2 px-5 py-4 border-b border-gray-100'>
            <div className='w-1 h-5 bg-green-500 rounded-full' />
            <p className='font-semibold text-brand-dark text-sm'>Quick Actions</p>
          </div>
          <div className='grid grid-cols-3 gap-3 p-4'>
            {[
              { icon: '📋', label: 'Add Patient' },
              { icon: '🗓️', label: 'Book Slot' },
              { icon: '💊', label: 'Prescriptions' },
              { icon: '📊', label: 'Analytics' },
              { icon: '🧾', label: 'Invoices' },
              { icon: '📤', label: 'Export Data' },
            ].map((action) => (
              <button
                key={action.label}
                className='flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-primary hover:text-primary text-gray-500 transition-all text-xs font-semibold'
              >
                <span className='text-xl'>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-5 bg-amber-400 rounded-full' />
              <p className='font-semibold text-brand-dark text-sm'>Recent Activity</p>
            </div>
          </div>

          <div className='divide-y divide-gray-50 max-h-56 overflow-y-auto'>
            {dashData?.latestAppointments?.length > 0 ? (
              dashData.latestAppointments.slice(0, 6).map((item, i) => {
                const dotColors = ['bg-primary', 'bg-green-500', 'bg-brand-pink', 'bg-amber-400', 'bg-primary', 'bg-green-500']
                return (
                  <div key={i} className='flex gap-3 px-5 py-3 hover:bg-gray-50 transition-colors'>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColors[i]}`} />
                    <div>
                      <p className='text-xs text-gray-700'>
                        <span className='font-semibold'>{item.userData?.name}</span>
                        {item.cancelled
                          ? ' cancelled their appointment'
                          : item.isCompleted
                            ? ' — consultation completed'
                            : ' booked an appointment'}
                      </p>
                      <p className='text-[10px] text-gray-400 mt-0.5'>{slotDateFormat(item.slotDate)}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className='px-5 py-8 text-sm text-center text-gray-400'>No recent activity</p>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default DoctorDashboard