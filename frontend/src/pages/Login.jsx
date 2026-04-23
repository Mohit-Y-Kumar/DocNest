import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      if (state === 'Sign Up') {

        const { data } = await axios.post(
          backendUrl + '/api/user/register',
          { name, email, password }
        )
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully! Welcome to DocNest ')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(
          backendUrl + '/api/user/login',
          { email, password }
        )
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Welcome back! Logged in successfully ')
        } else {
          toast.error(data.message)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4'>
      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-4 w-full max-w-sm bg-white border rounded-xl p-6 sm:p-8 shadow-lg text-zinc-600 text-sm'
      >
        <div>
          <p className='text-xl sm:text-2xl font-semibold text-zinc-800'>
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </p>
          <p className='text-xs sm:text-sm mt-1 text-zinc-500'>
            Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment
          </p>
        </div>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <label className='block mb-1 text-xs font-medium text-zinc-500'>Full Name</label>
            <input
              required
              type='text'
              placeholder='John Doe'
              value={name}
              onChange={e => setName(e.target.value)}
              className='border border-zinc-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:border-indigo-400 transition text-sm'
            />
          </div>
        )}

        <div className='w-full'>
          <label className='block mb-1 text-xs font-medium text-zinc-500'>Email</label>
          <input
            required
            type='email'
            placeholder='you@email.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='border border-zinc-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:border-indigo-400 transition text-sm'
          />
        </div>

        <div className='w-full'>
          <label className='block mb-1 text-xs font-medium text-zinc-500'>Password</label>
          <input
            required
            type='password'
            placeholder='••••••••'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='border border-zinc-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:border-indigo-400 transition text-sm'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-full py-2.5 text-sm font-medium
            transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {loading && (
            <svg className='animate-spin h-4 w-4 text-white' viewBox='0 0 24 24' fill='none'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
            </svg>
          )}
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        <p className='text-center text-xs sm:text-sm'>
          {state === 'Sign Up' ? (
            <>Already have an account?{' '}
              <span onClick={() => setState('Login')} className='text-indigo-600 underline cursor-pointer hover:text-indigo-800'>
                Login here
              </span>
            </>
          ) : (
            <>Don&apos;t have an account?{' '}
              <span onClick={() => setState('Sign Up')} className='text-indigo-600 underline cursor-pointer hover:text-indigo-800'>
                Sign up
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export default Login