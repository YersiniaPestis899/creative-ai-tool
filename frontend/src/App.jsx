import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StoryGenerator from './components/StoryGenerator'
import { useAuth, signInWithGoogle } from './lib/auth'

function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              創作支援ツール
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ログインして創作を始めましょう
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<StoryGenerator />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App