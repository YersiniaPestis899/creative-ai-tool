import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/auth'
import { useAuth } from '../lib/auth'

const HistoryViewer = () => {
  const { user, session } = useAuth() // セッション情報も取得
  const [stories, setStories] = useState([])
  const [characters, setCharacters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stories')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && session) {
      fetchHistory()
    }
  }, [activeTab, user, session])

  const fetchHistory = async () => {
    if (!user || !session) {
      console.log('Auth state:', { user, session })
      setError('ユーザーが認証されていません')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching data for user:', user.id)
      
      const { data, error: fetchError } = await supabase
        .from(activeTab === 'stories' ? 'story_settings' : 'character_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      console.log('Fetched data:', data)

      if (activeTab === 'stories') {
        setStories(data || [])
      } else {
        setCharacters(data || [])
      }
    } catch (error) {
      console.error('History fetch error:', error)
      setError(error.message || '履歴の取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 認証状態のデバッグ情報表示
  if (!user || !session) {
    console.log('Not authenticated:', { user, session })
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            認証情報を確認中... ログイン状態: {user ? 'ログイン済み' : '未ログイン'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">作成履歴</h2>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('stories')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'stories'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } font-medium text-sm`}
          >
            ストーリー
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-4 px-1 ${
              activeTab === 'characters'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } font-medium text-sm`}
          >
            キャラクター
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          {/* デバッグ情報の表示 */}
          <p className="text-sm text-red-400 mt-2">
            認証状態: {user ? 'ログイン済み' : '未ログイン'}
            {user && ` (ユーザーID: ${user.id})`}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : activeTab === 'stories' ? (
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{story.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(story.created_at)}</p>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{story.world_building}</p>
              </div>
            </div>
          ))}
          {stories.length === 0 && (
            <p className="text-center text-gray-500">ストーリーの履歴がありません</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {characters.map((character) => (
            <div key={character.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{character.name}</h3>
                <p className="text-sm text-gray-500">{formatDate(character.created_at)}</p>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{character.description}</p>
              </div>
            </div>
          ))}
          {characters.length === 0 && (
            <p className="text-center text-gray-500">キャラクターの履歴がありません</p>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryViewer