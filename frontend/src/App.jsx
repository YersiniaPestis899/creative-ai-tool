import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import StoryGenerator from './components/StoryGenerator'
import LoginButton from './components/LoginButton'
import { useAuth } from './contexts/AuthContext'

const AppContent = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Creative AI Story Tool
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              物語の世界観を AI と一緒に創造しましょう
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    )
  }

  return <StoryGenerator />
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App