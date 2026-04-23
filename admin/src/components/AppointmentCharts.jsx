import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { C, TS, card } from '../utils/DashboardUtils'
import { SectionLabel, renderPieLabel } from './DashboardWidgets'

const AppointmentCharts = ({ stats }) => {
  return (
    <>
      <SectionLabel>Appointments &amp; Distribution</SectionLabel>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3'>

        <div className={`${card} lg:col-span-2`}>
          <p className='text-sm font-semibold text-slate-700'>Monthly Appointments</p>
          <p className='text-xs text-slate-400 mb-4'>Last 6 months</p>
          <ResponsiveContainer width='100%' height={190}>
            <BarChart data={stats.monthlyData || []} barSize={28}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
              <XAxis dataKey='month' tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TS} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey='appointments' radius={[4, 4, 0, 0]}>
                {(stats.monthlyData || []).map((_, i) => (
                  <Cell key={i} fill={i === (stats.monthlyData?.length || 1) - 1 ? C.primary : '#c7d2fe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <p className='text-sm font-semibold text-slate-700'>Appointment Status</p>
          <p className='text-xs text-slate-400 mb-1'>Current distribution</p>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie data={stats.statusData || []} cx='50%' cy='42%'
                innerRadius={50} outerRadius={76} paddingAngle={3}
                dataKey='value' labelLine={false} label={renderPieLabel}>
                {(stats.statusData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconSize={8} iconType='circle'
                formatter={v => <span style={{ fontSize: 10, color: '#64748b' }}>{v}</span>} />
              <Tooltip {...TS} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

export default AppointmentCharts
