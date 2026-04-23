import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext }  from '../../context/DoctorContext'
import { AppContext }     from '../../context/AppContext'
import { BRAND, BRAND_DARK } from '../../utils/DoctorDashboardUtils'
import DoctorMetricCards   from '../../components/DoctorDashboard/DoctorMetricCards'
import DoctorCharts        from '../../components/DoctorDashboard/DoctorCharts'
import DoctorAnalytics     from '../../components/DoctorDashboard/DoctorAnalytics'
import DoctorAppointments  from '../../components/DoctorDashboard/DoctorAppointments'
import DoctorUpcomingToday from '../../components/DoctorDashboard/DoctorUpcomingToday'

const DoctorDashboard = () => {
    const {
        dToken, dashData, profileData, getDashData,
        cancelAppointment, completeAppointment,
        getDoctorRatings, getVisitStats, getRevenueData, getUpcomingToday,
    } = useContext(DoctorContext)

    const { currency, slotDateFormat } = useContext(AppContext)

    const [visitPeriod,  setVisitPeriod]  = useState('daily')
    const [visitData,    setVisitData]    = useState([])
    const [revPeriod,    setRevPeriod]    = useState('monthly')
    const [revenueData,  setRevenueData]  = useState([])
    const [ratingsData,  setRatingsData]  = useState(null)
    const [upcoming,     setUpcoming]     = useState([])
    const [loadingVisit, setLoadingVisit] = useState(false)
    const [loadingRev,   setLoadingRev]   = useState(false)

    const [earningsTrend,    setEarningsTrend]    = useState(null)
    const [appointmentDelta, setAppointmentDelta] = useState(null)
    const [patientTrend,     setPatientTrend]     = useState(null)

    useEffect(() => {
        if (!dToken) return
        getDashData()
        getDoctorRatings().then(r  => setRatingsData(r ?? null))
        getUpcomingToday().then(r  => setUpcoming(Array.isArray(r) ? r : []))
        loadVisit('daily')
        loadRevenue('monthly')
    }, [dToken])

    useEffect(() => {
        if (!revenueData || revenueData.length < 2) { setEarningsTrend(null); return }
        const last = revenueData[revenueData.length - 1]?.revenue ?? 0
        const prev = revenueData[revenueData.length - 2]?.revenue ?? 0
        if (prev === 0) { setEarningsTrend(null); return }
        setEarningsTrend(Math.round(((last - prev) / prev) * 100))
    }, [revenueData])

    useEffect(() => {
        if (!visitData || visitData.length < 2) { setAppointmentDelta(null); setPatientTrend(null); return }
        const last      = visitData[visitData.length - 1]
        const prev      = visitData[visitData.length - 2]
        const lastTotal = (last?.new ?? 0) + (last?.ret ?? 0)
        const prevTotal = (prev?.new ?? 0) + (prev?.ret ?? 0)
        setAppointmentDelta(lastTotal - prevTotal)
        if (prevTotal === 0) { setPatientTrend(null); return }
        setPatientTrend(Math.round(((lastTotal - prevTotal) / prevTotal) * 100))
    }, [visitData])

    const loadVisit = async (period) => {
        setLoadingVisit(true)
        try   { setVisitData(await getVisitStats(period) || []) }
        catch { setVisitData([]) }
        setLoadingVisit(false)
    }

    const loadRevenue = async (period) => {
        setLoadingRev(true)
        try   { setRevenueData(await getRevenueData(period) || []) }
        catch { setRevenueData([]) }
        setLoadingRev(false)
    }

    if (!dashData) return (
        <div className='flex items-center justify-center h-64'>
            <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin'
                style={{ borderColor: `${BRAND} ${BRAND} ${BRAND} transparent` }} />
        </div>
    )

    const latestAppts = dashData?.latestAppointments ?? []
    const total       = Math.max(dashData.appointments ?? 1, 1)
    const compCount   = latestAppts.filter(a => a.isCompleted).length
    const cancCount   = latestAppts.filter(a => a.cancelled).length
    const pendCount   = latestAppts.filter(a => !a.isCompleted && !a.cancelled).length
    const compPct     = Math.round((compCount / total) * 100)
    const cancPct     = Math.round((cancCount / total) * 100)
    const pendPct     = Math.round((pendCount / total) * 100)
    const patPct      = Math.min(Math.round(((dashData.patients ?? 0) / total) * 100), 100)
    const avgRating   = ratingsData?.average ?? 0

    return (
        <div className='m-3 sm:m-5 space-y-4 sm:space-y-5 max-w-[1200px]'>

            {/* Top Bar */}
            <div className='flex items-start sm:items-center justify-between gap-2'>
                <div>
                    <h1 className='text-xl font-bold' style={{ color: BRAND_DARK }}>Dashboard Overview</h1>
                    <p className='text-lg sm:text-2xl text-gray-800 font-bold mt-0.5'>
                        Welcome back, {profileData?.name || 'Doctor'}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                    <span className='text-xs text-gray-400 font-medium'>Live data</span>
                </div>
            </div>

            {/* Metric Cards */}
            <DoctorMetricCards
                dashData={dashData}
                currency={currency}
                ratingsData={ratingsData}
                earningsTrend={earningsTrend}
                appointmentDelta={appointmentDelta}
                patientTrend={patientTrend}
            />

            {/* Charts */}
            <DoctorCharts
                visitData={visitData}   visitPeriod={visitPeriod}   onVisitPeriod={(p) => { setVisitPeriod(p); loadVisit(p) }}   loadingVisit={loadingVisit}
                revenueData={revenueData} revPeriod={revPeriod}     onRevPeriod={(p)  => { setRevPeriod(p);  loadRevenue(p) }}   loadingRev={loadingRev}
                currency={currency}
            />

            {/* Analytics */}
            <DoctorAnalytics
                compPct={compPct} pendPct={pendPct} cancPct={cancPct} patPct={patPct}
                ratingsData={ratingsData} avgRating={avgRating}
            />

            {/* Appointments + Upcoming */}
            <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-4'>
                <DoctorAppointments
                    latestAppts={latestAppts}
                    currency={currency}
                    slotDateFormat={slotDateFormat}
                    cancelAppointment={cancelAppointment}
                    completeAppointment={completeAppointment}
                />
                <DoctorUpcomingToday
                    upcoming={upcoming}
                    latestAppts={latestAppts}
                    currency={currency}
                    slotDateFormat={slotDateFormat}
                />
            </div>

        </div>
    )
}

export default DoctorDashboard