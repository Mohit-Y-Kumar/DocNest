import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import StateBadge from '../components/StateBadge'
import DoctorCard from '../components/DoctorCard'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [likedDoctors, setLikedDoctors] = useState({})

  const { doctors, backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])


  const handleCardClick = async (docId) => {
    try {
      await axios.post(backendUrl + `/api/doctor/view/${docId}`);
    } catch (error) {
      console.log(error);
    }
    navigate(`/appointment/${docId}`)
  };

  const handleLike = async (e, docId) => {
    e.stopPropagation(); // card click event rok do

    if (!token) {
      toast.warn('Like karne ke liye login karo');
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + `/api/doctor/like/${docId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Local state update karo
        setLikedDoctors(prev => ({ ...prev, [docId]: data.liked }));

        // doctors list mein bhi count update karo
        setFilterDoc(prev => prev.map(doc =>
          doc._id === docId
            ? { ...doc, likes: data.liked ? doc.likes + 1 : doc.likes - 1 }
            : doc
        ));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div>
      <p className='text-gray-1000'>Browse through the doctors specialist.</p>
      <div className=' flex flex-col sm:flex-row items-start gap-5 mt-5
      '>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p
            onClick={() => speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "General physician" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            General physician
          </p>

          <p
            onClick={() => speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "Gynecologist" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            Gynecologist
          </p>

          <p
            onClick={() => speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "Dermatologist" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            Dermatologist
          </p>

          <p
            onClick={() => speciality === 'Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "Pediatricians" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            Pediatricians
          </p>

          <p
            onClick={() => speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "Neurologist" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            Neurologist
          </p>

          <p
            onClick={() => speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-2 pr-16 border border-gray-300 rounded transition-all cursor-pointer
      ${speciality === "Gastroenterologist" ? "bg-indigo-500 text-gray-900 font-medium" : "bg-white text-gray-600 hover:bg-indigo-50"}
    `}
          >
            Gastroenterologist
          </p>
        </div>
        <div className=' w-full grid grid-cols gap-4 gap-y-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]'>
          {
            filterDoc.map((item, index) => (
             <DoctorCard key={index} item={item} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default Doctors
