import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';

const HistoryViewer = () => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // データ取得関数
  const fetchHistory = async () => {
    try {
      console.group('History Fetch Operation');
      console.log('Fetching history for user:', user?.id);

      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const { data, error: fetchError } = await supabase
        .from('character_settings')
        .select(`
          id,
          character_name,
          age,
          personality,
          background,
          appearance,
          role,
          relationships,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Fetched Data:', data);
      
      if (fetchError) {
        console.error('Fetch Error:', fetchError);
        throw fetchError;
      }

      // データの加工と検証
      const processedData = data.map(character => {
        console.log('Processing character:', character);
        return {
          ...character,
          isValid: !!(character.character_name && character.personality && character.background)
        };
      });

      console.log('Processed Data:', processedData);
      setCharacters(processedData);

    } catch (error) {
      console.error('History fetch error:', error);
      setError(error.message || '履歴の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchHistory();
  }, [user]);

  // 日付フォーマット関数
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // UI実装部分
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">作成履歴</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {characters.length > 0 ? (
            characters.map((character) => (
              <div key={character.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {character.character_name || '名前なし'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(character.created_at)}
                  </p>
                </div>

                <div className="prose max-w-none space-y-4">
                  {character.age && (
                    <div>
                      <strong className="text-gray-700">年齢：</strong>
                      <span className="text-gray-600">{character.age}歳</span>
                    </div>
                  )}

                  {character.personality && (
                    <div>
                      <strong className="text-gray-700">性格：</strong>
                      <p className="text-gray-600 mt-1">{character.personality}</p>
                    </div>
                  )}

                  {character.background && (
                    <div>
                      <strong className="text-gray-700">背景：</strong>
                      <p className="text-gray-600 mt-1">{character.background}</p>
                    </div>
                  )}

                  {character.appearance && (
                    <div>
                      <strong className="text-gray-700">外見：</strong>
                      <p className="text-gray-600 mt-1">{character.appearance}</p>
                    </div>
                  )}

                  {character.role && (
                    <div>
                      <strong className="text-gray-700">役割：</strong>
                      <p className="text-gray-600 mt-1">{character.role}</p>
                    </div>
                  )}

                  {character.relationships && (
                    <div>
                      <strong className="text-gray-700">関係性：</strong>
                      <p className="text-gray-600 mt-1">{character.relationships}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              キャラクター設定の履歴がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryViewer;