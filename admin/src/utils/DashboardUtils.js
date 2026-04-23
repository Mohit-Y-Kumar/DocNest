export const C = {
  primary: '#4F46E5', violet: '#7C3AED', teal: '#0D9488',
  rose: '#E11D48', amber: '#D97706', sky: '#0284C7',
  green: '#16A34A', slate: '#475569', pink: '#db2777',
}

export const PIE_COLORS = [C.primary, C.violet, C.sky, C.amber, C.teal, C.rose, C.pink, C.slate]

export const TS = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 11,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  itemStyle: { color: '#334155' },
}

export const fmtR = (v = 0) => {
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  if (v >= 1000)   return '₹' + (v / 1000).toFixed(1) + 'K'
  return '₹' + v
}

export const card = 'bg-white rounded-2xl border border-slate-100 shadow-sm p-5'

export const parseSlot = (slotDate) => {
  if (!slotDate) return null
  const p = slotDate.split('_')
  if (p.length !== 3) return null
  return { day: p[0], mo: p[1], yr: p[2] }
}
