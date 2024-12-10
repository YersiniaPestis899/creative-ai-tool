import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCharacter, updateCharacter } = useCharacter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [character, setCharacter] = useState(getCharacter(id || ''));
  const [editedData, setEditedData] = useState({
    name: character?.name || '',
    description: character?.description || '',
    prompt: character?.prompt || '',
  });

  useEffect(() => {
    if (!character) {
      navigate('/characters');
    }
  }, [character, navigate]);

  const handleGenerateImage = async () => {
    if (!character) return;
    setIsGeneratingImage(true);

    try {
      const imagePrompt = `キャラクターイラスト、${character.name}、${character.description}、高品質、detailed、best quality`;
      const response = await axios.post(`${API_URL}/generate-image`, {
        prompt: imagePrompt
      });

      if (response.data.success) {
        updateCharacter(id || '', {
          imageUrl: response.data.data
        });
        
        // ローカルのステートも更新
        setCharacter(prev => prev ? {
          ...prev,
          imageUrl: response.data.data
        } : null);
      }
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像の生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 編集内容を保存
      updateCharacter(id || '', {
        ...editedData,
        updatedAt: new Date().toISOString(),
      });

      // 必要に応じて再生成
      const response = await axios.post(`${API_URL}/generate`, {
        prompt: editedData.prompt,
        type: 'character'
      });

      if (response.data.success) {
        updateCharacter(id || '', {
          generatedContent: response.data.data,
        });
      }

      setIsEditing(false);
      
      // ローカルのステートも更新
      setCharacter(getCharacter(id || ''));
    } catch (error) {
      console.error('キャラクター更新エラー:', error);
      alert('キャラクターの更新中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!character) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              value={editedData.description}
              onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              プロンプト
            </label>
            <textarea
              value={editedData.prompt}
              onChange={(e) => setEditedData({ ...editedData, prompt: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={5}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{character.name}</h1>
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                編集
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isGeneratingImage ? '画像生成中...' : 'イラストを生成'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {character.imageUrl && (
              <div className="relative">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full max-h-96 object-cover rounded-lg mb-4"
                />
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="absolute bottom-6 right-2 px-4 py-2 text-sm font-medium text-white bg-black bg-opacity-50 rounded-md hover:bg-opacity-70"
                >
                  {isGeneratingImage ? '生成中...' : '再生成'}
                </button>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-2">キャラクター説明</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{character.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">生成された設定</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{character.generatedContent}</p>
            </div>

            <div className="text-sm text-gray-500">
              <p>作成日: {new Date(character.createdAt).toLocaleDateString('ja-JP')}</p>
              <p>最終更新: {new Date(character.updatedAt).toLocaleDateString('ja-JP')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterDetail;