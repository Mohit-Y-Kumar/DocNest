import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { Avatar, StatusBadge, SectionDot, FILTER_TABS, BRAND } from '../../utils/DoctorDashboardUtils'

const DoctorAppointments = ({ latestAppts, currency, slotDateFormat, cancelAppointment, completeAppointment }) => {
    const [activeTab, setActiveTab] = useState('all')

    const filterMap = {
        all:       latestAppts,
        pending:   latestAppts.filter(a => !a.cancelled && !a.isCompleted),
        completed: latestAppts.filter(a => a.isCompleted),
        cancelled: latestAppts.filter(a => a.cancelled),
    }

    const filteredAppts = filterMap[activeTab] ?? latestAppts

    return (
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-gray-100'>
                <div className='flex items-center gap-2'>
                    <SectionDot color={BRAND} />
                    <span className='text-sm font-semibold text-gray-800'>Latest Appointments</span>
                </div>
                <div className='flex gap-1.5 overflow-x-auto pb-0.5'>
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className='text-[10px] font-bold px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex-shrink-0'
                            style={{
                                background: activeTab === tab.key ? tab.color : tab.bg,
                                color:      activeTab === tab.key ? 'white'   : tab.color
                            }}
                        >
                            {tab.label} ({filterMap[tab.key].length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Column Headers */}
            <div className='hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_100px] px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                <span>Patient</span>
                <span className='pl-2'>Date</span>
                <span className='pl-2'>Fee</span>
                <span>Status</span>
                <span className='text-right'>Action</span>
            </div>

            {/* Rows */}
            <div className='max-h-80 overflow-y-auto divide-y divide-gray-100'>
                {filteredAppts.length > 0
                    ? filteredAppts.map((item, i) => (
                        <div key={item._id ?? i}
                            className='grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_1fr_100px] items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 hover:bg-blue-50/40 transition text-sm'>

                            {/* Patient */}
                            <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                                <Avatar image={item.userData?.image} name={item.userData?.name} idx={i} />
                                <div className='min-w-0'>
                                    <span className='font-medium text-gray-800 truncate block'>{item.userData?.name ?? '—'}</span>
                                    <span className='text-xs text-gray-400 sm:hidden'>
                                        {slotDateFormat(item.slotDate)} · {currency}{item.amount}
                                    </span>
                                </div>
                            </div>

                            <span className='text-gray-500 text-xs sm:text-sm hidden sm:block'>{slotDateFormat(item.slotDate)}</span>
                            <span className='font-semibold text-sm text-gray-900 pl-0 sm:pl-3 hidden sm:block'>{currency}{item.amount}</span>
                            <div className='hidden sm:block'><StatusBadge item={item} /></div>

                            <div className='flex justify-start sm:justify-end gap-2 min-w-[80px]'>
                                <StatusBadge item={item} />
                                {!item.cancelled && !item.isCompleted && (
                                    <>
                                        <button onClick={() => cancelAppointment(item._id)}
                                            className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition'>
                                            <img src={assets.cancel_icon} className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                                        </button>
                                        <button onClick={() => completeAppointment(item._id)}
                                            className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition'>
                                            <img src={assets.tick_icon} className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                    : <div className='flex items-center justify-center py-10'>
                        <p className='text-sm text-gray-400'>No {activeTab} appointments</p>
                      </div>
                }
            </div>
        </div>
    )
}

export default DoctorAppointments