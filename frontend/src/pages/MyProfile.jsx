import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()

      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      image && formData.append('image', image)

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return userData && (
    <div className='max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10'>

      {/* PROFILE HEADER */}
      <div className='flex flex-col sm:flex-row items-center gap-6'>
        {
          isEdit ? (
            <label htmlFor="image" className='cursor-pointer'>
              <div className='relative'>
                <img
                  className='w-32 h-32 rounded-full object-cover border-4 border-gray-200'
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt=""
                />
                <div className='absolute bottom-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full'>
                  Change
                </div>
                <input
                  type="file"
                  id="image"
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </label>
          ) : (
            <img
              className='w-32 h-32 rounded-full object-cover border-4 border-gray-200'
              src={userData.image}
              alt=""
            />
          )
        }

        <div className='text-center sm:text-left'>
          {
            isEdit ? (
              <input
                className='text-2xl font-semibold border-b outline-none'
                value={userData.name}
                onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
              />
            ) : (
              <h2 className='text-2xl font-bold text-gray-800'>{userData.name}</h2>
            )
          }
          <p className='text-gray-500'>{userData.email}</p>
        </div>
      </div>

      {/* CONTACT INFO */}
      <div className='mt-8'>
        <h3 className='text-lg font-semibold text-gray-700 border-b pb-2'>Contact Information</h3>

        <div className='grid sm:grid-cols-2 gap-4 mt-4'>
          <div>
            <label className='text-sm text-gray-500'>Phone</label>
            {
              isEdit ? (
                <input
                  className='w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50'
                  value={userData.phone}
                  onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <p className='text-gray-700 mt-1'>{userData.phone}</p>
              )
            }
          </div>

          <div>
            <label className='text-sm text-gray-500'>Address</label>
            {
              isEdit ? (
                <>
                  <input
                    className='w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50'
                    placeholder="Line 1"
                    value={userData.address.line1}
                    onChange={e =>
                      setUserData(prev => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value }
                      }))
                    }
                  />
                  <input
                    className='w-full border rounded-lg px-3 py-2 mt-2 bg-gray-50'
                    placeholder="Line 2"
                    value={userData.address.line2}
                    onChange={e =>
                      setUserData(prev => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value }
                      }))
                    }
                  />
                </>
              ) : (
                <p className='text-gray-700 mt-1'>
                  {userData.address.line1} <br />
                  {userData.address.line2}
                </p>
              )
            }
          </div>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className='mt-8'>
        <h3 className='text-lg font-semibold text-gray-700 border-b pb-2'>Basic Information</h3>

        <div className='grid sm:grid-cols-2 gap-4 mt-4'>
          <div>
            <label className='text-sm text-gray-500'>Gender</label>
            {
              isEdit ? (
                <select
                  className='w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50'
                  value={userData.gender}
                  onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              ) : (
                <p className='text-gray-700 mt-1'>{userData.gender}</p>
              )
            }
          </div>

          <div>
            <label className='text-sm text-gray-500'>Date of Birth</label>
            {
              isEdit ? (
                <input
                  type="date"
                  className='w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50'
                  value={userData.dob?.substring(0, 10)}
                  onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                />
              ) : (
                <p className='text-gray-700 mt-1'>{userData.dob}</p>
              )
            }
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className='mt-10 text-center'>
        {
          isEdit ? (
            <button
              onClick={updateUserProfileData}
              className='bg-primary text-white px-8 py-2 rounded-full hover:opacity-90 transition'
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='border border-primary text-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition'
            >
              Edit Profile
            </button>
          )
        }
      </div>

    </div>
  )
}

export default MyProfile