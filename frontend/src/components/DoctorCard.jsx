import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import StateBadge from './StateBadge'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorCard = ({ item }) => {
    const { backendUrl, token, userData } = useContext(AppContext)


    const navigate = useNavigate()
    const [liked, setLiked] = useState(
        item.likedBy?.includes(userData?._id) || false
    )
    const [likes, setLikes] = useState(item.likes || 0)
    const [views, setViews] = useState(item.views || 0)

    useEffect(() => {
        if (userData?._id) {
            setLiked(item.likedBy?.includes(userData._id) || false)
        }
    }, [userData, item.likedBy])
    // 👁️ View increment
    const handleCardClick = async () => {
        try {
            await axios.post(backendUrl + `/api/doctor/view/${item._id}`)
            setViews(prev => prev + 1)
        } catch (error) {
            console.log(error)
        }
        navigate(`/appointment/${item._id}`)
        scrollTo(0, 0)
    }

    // ❤️ Like toggle
    const handleLike = async (e) => {
        e.stopPropagation()
        if (!token) {
            toast.warn('Like karne ke liye login karo')
            return
        }
        try {
            const { data } = await axios.post(
                backendUrl + `/api/doctor/like/${item._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setLiked(data.liked)
                setLikes(prev => data.liked ? prev + 1 : prev - 1)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className='relative border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
        >
            <img
                className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full'
                src={item.image}
                alt=""
            />

            {/* ✅ Stats Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">

                {/* 👁️ Views */}
                <StateBadge
                    icon={assets.eye}
                    value={views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views}
                />

                {/* ❤️ Likes */}
                <div onClick={handleLike}>
                    <StateBadge
                        icon={liked ? assets.filledheart : assets.heart}
                        value={likes >= 1000 ? (likes / 1000).toFixed(1) + 'k' : likes}
                    />
                </div>

                {/* 💬 Reviews */}
                <StateBadge
                    icon={assets.comment}
                    value={item.totalReviews || 0}
                />
            </div>

            <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
                    <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-500'}`}></p>
                    <p className='text-xs'>{item.available ? 'Available' : 'Not Available'}</p>
                </div>
                <div className='flex items-center justify-between mt-1'>
                    <p className='text-gray-900 text-lg font-medium'>{item.name}</p>

                    {/* ⭐ Rating — name ke right side */}
                    <div className='flex items-center gap-1'>
                        <img src={assets.filledStar} alt="star" className='w-4 h-4' />
                        <p className='text-sm text-gray-600'>
                            {item.averageRating > 0 ? item.averageRating : '0.0'}
                        </p>
                    </div>
                </div>
                <p className='text-gray-600 text-sm'>{item.speciality}</p>


            </div>
        </div>
    )
}

export default DoctorCard