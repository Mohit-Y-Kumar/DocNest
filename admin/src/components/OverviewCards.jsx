import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { fmtR } from '../utils/DashboardUtils'
import { MetricCard, SectionLabel } from './DashboardWidgets'

const OverviewCards = ({ dashData, doctors, stats }) => {
  const navigate = useNavigate()

  return (
    <>
      <SectionLabel>Overview</SectionLabel>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3'>
        <MetricCard
          icon={{ emoji: assets.regIcon, bg: '#ede9fe' }}
          label='Registered Doctors'
          value={dashData.doctors}
          sub={`${(doctors || []).filter(d => d.available).length} available now`}
          onClick={() => navigate('/doctor-list')}
        />
        <MetricCard
          icon={{ emoji: assets.TotalAppIcon, bg: '#e0f2fe' }}
          label='Total Appointments'
          value={dashData.appointments}
          sub={`+${stats.bookedToday || 0} booked today`}
          onClick={() => navigate('/all-appointments')}
        />
        <MetricCard
          icon={{ emoji: assets.regUserIcon, bg: '#dcfce7' }}
          label='Total Patients'
          value={dashData.patients}
          sub='Registered users'
        />
        <MetricCard
          icon={{ emoji: assets.pendingIcon, bg: '#fef9c3' }}
          label='Pending'
          value={stats.pending || 0}
          sub='Awaiting confirmation'
          subColor='text-amber-600'
          onClick={() => navigate('/all-appointments')}
        />
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2'>
        <MetricCard
          icon={{ emoji: assets.collIcon, bg: '#ede9fe' }}
          label='Total Revenue'
          value={fmtR(stats.revenue || 0)}
          sub='From paid appointments'
          subColor='text-indigo-600'
        />
        <MetricCard
          icon={{ emoji: assets.appCancelIcon, bg: '#fee2e2' }}
          label='Cancelled Today'
          value={stats.cancelledToday || 0}
          sub='Monitor trend'
          subColor='text-red-500'
        />
        <MetricCard
          icon={{ emoji: assets.filledStar, bg: '#fef3c7' }}
          label='Avg Doctor Rating'
          value={stats.avgRating || 'N/A'}
          sub='Across all doctors'
          subColor='text-amber-600'
        />
        <MetricCard
          icon={{ emoji: assets.appCompIcon, bg: '#d1fae5' }}
          label='Completed'
          value={stats.completed || 0}
          sub='All time'
          subColor='text-emerald-600'
        />
      </div>
    </>
  )
}

export default OverviewCards
