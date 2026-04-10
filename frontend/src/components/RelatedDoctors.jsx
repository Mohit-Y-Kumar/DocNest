import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import DoctorCard from './DoctorCard'  // ✅ sirf ye import

const RelatedDoctors = ({ speciality, docId }) => {
    const { doctors } = useContext(AppContext)
    const navigate = useNavigate()
    const [relDoc, setRelDocs] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter(
                (doc) => doc.speciality === speciality && doc._id !== docId
            )
            setRelDocs(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
            <p className='sm:w-1/3 text-center text-sm'>
                Simply browse through our extensive list of trusted doctors.
            </p>

            <div className='w-full grid gap-4 gap-y-6 pt-5 px-3 sm:px-0 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]'>
                {relDoc.slice(0, 5).map((item, index) => (
                    <DoctorCard key={index} item={item} />  // ✅ sirf ye
                ))}
            </div>

            <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-12 py-3 rounded-full mt-10'
            >
                more
            </button>
        </div>
    )
}

export default RelatedDoctors