import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export const History = () => {
  const [characters, setCharacters] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('characters');
  const { getCharacters, getStories, loading, error } = useSupabase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersData, storiesData] = await Promise.all([
          getCharacters(),
          getStories()
        ]);
        setCharacters(charactersData);
        setStories(storiesData);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">履歴</h2>

      {/* タブ切り替え */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'characters'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            onClick={() => setActiveTab('characters')}
          >
            キャラクター
          </button>
          <button
            className={`${
              activeTab === 'stories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            onClick={() => setActiveTab('stories')}
          >
            小説設定
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div>
          {activeTab === 'characters' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  {character.image_url && (
                    <img
                      src={character.image_url}
                      alt={character.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{character.description}</p>
                  <p className="text-xs text-gray-500">
                    作成日: {new Date(character.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                  <p className="text-gray-600 whitespace-pre-wrap mb-2">
                    {story.generated_content}
                  </p>
                  <p className="text-xs text-gray-500">
                    作成日: {new Date(story.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;