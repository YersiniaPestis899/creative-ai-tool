import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [character, setCharacter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePrompt = (fields) => {
    return `以下の情報を含む詳細なキャラクタープロフィールを作成してください：
    ${prompt}
    
    含めるべき情報：
    - 名前と基本的な属性
    - 性格特性
    - 経歴
    - 目標と動機
    - 外見的特徴
    - 特殊能力やスキル（該当する場合）
    - 重要な人間関係
    
    わかりやすく整理された形式で回答してください。`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/generate`, {
        prompt: generatePrompt(),
        type: 'character'
      });

      if (response.data.success) {
        setCharacter(response.data.data);
      } else {
        throw new Error('キャラクターの生成に失敗しました');
      }
    } catch (error) {
      console.error('キャラクター生成エラー:', error);
      setError(error.response?.data?.error || 'キャラクターの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AIキャラクター作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            キャラクターの設定
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
            placeholder="作成したいキャラクターの設定を入力してください..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              作成中...
            </>
          ) : (
            'キャラクターを作成'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {character && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">作成されたキャラクター</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="whitespace-pre-wrap">{character}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;