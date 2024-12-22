import React from 'react'
import { signInWithGoogle } from '../lib/auth'

const LoginButton = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center px-4 py-2 space-x-2 text-gray-600 transition-colors duration-300 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      <span>Googleでログイン</span>
    </button>
  )
}

export default LoginButton