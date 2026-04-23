import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useDashboardStats } from '../../utils/DashboardStats'
import OverviewCards       from '../../components/OverviewCards'
import AppointmentCharts   from '../../components/AppointmentCharts'
import RevenueCharts       from '../../components/RevenueCharts'
import DoctorPatientCharts from '../../components/DoctorPatientCharts'
import RecentActivity      from '../../components/RecentActivity'

const Dashboard = () => {
  const {
    aToken, getDashData, dashData,
    getAllAppointments, appointments,
    getAllDoctors, doctors,
  } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
      getAllAppointments()
      getAllDoctors()
    }
  }, [aToken])

  const stats = useDashboardStats(appointments, doctors)

  if (!dashData) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin' />
          <p className='text-slate-400 text-sm'>Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-5 mt-5 md:p-6 max-w-[1400px]'>

      {/* Top bar */}
      <div className='flex items-center justify-between mb-5 pb-4 border-b border-slate-100'>
        <div>
          <h1 className='text-lg font-semibold text-slate-800'>Admin Dashboard</h1>
          <p className='text-xs text-slate-400 mt-0.5'>
            DocNest &nbsp;·&nbsp;
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <OverviewCards
        dashData={dashData}
        doctors={doctors}
        stats={stats}
      />

      <AppointmentCharts stats={stats} />

      <RevenueCharts stats={stats} />

      <DoctorPatientCharts
        stats={stats}
        dashData={dashData}
        doctors={doctors}
      />

      <RecentActivity
        dashData={dashData}
        doctors={doctors}
      />

    </div>
  )
}

export default Dashboard
