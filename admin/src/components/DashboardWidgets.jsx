import React from 'react'
import { card, TS, fmtR } from '../utils/DashboardUtils'

export function SectionLabel({ children }) {
  return (
    <p className='text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 mt-6'>
      {children}
    </p>
  )
}

export function MetricCard({ icon, label, value, sub, subColor = 'text-emerald-600', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${card} flex items-center gap-3 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} transition-all duration-200 min-w-0 overflow-hidden`}
    >
      <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0'
        style={{ background: icon.bg }}>
        <img src={icon.emoji} alt='' className='w-5 h-5 sm:w-6 sm:h-6 object-contain' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xl sm:text-2xl font-bold text-slate-800 leading-tight'>{value ?? '—'}</p>
        <p className='text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-tight break-words'>{label}</p>
        {sub && (
          <p className={`text-[10px] sm:text-xs font-medium mt-0.5 leading-tight break-words ${subColor}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle'
      dominantBaseline='central' fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export function RupeeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TS.contentStyle} className='px-3 py-2'>
      <p className='text-slate-500 text-[11px] mb-1'>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className='font-semibold text-[11px]'>
          {p.name}: {fmtR(p.value)}
        </p>
      ))}
    </div>
  )
}
