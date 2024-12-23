import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';
import httpClient from '../lib/httpClient';

const CharacterCreator = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // キャラクター設定の生成
  const generateWithBedrock = async (promptText) => {
    try {
      const response = await httpClient.post('/generate', {
        prompt: `以下の要素に基づいて、魅力的なキャラクター設定を生成してください。

生成する際の注意点:
- 独創的で印象的な個性を持たせる
- 背景設定に一貫性を持たせる
- 他のキャラクターとの関係性を考慮する
- 成長の可能性を含める

要素：${promptText}

以下の形式で出力してください：

キャラクター名：[名前]

基本設定：
[性別、年齢、外見的特徴など]

性格：
[性格特性、価値観、行動パターンなど]

バックストーリー：
[生い立ち、重要な経験、現在の状況など]

特殊能力/スキル：
[特殊な力、得意分野、独自の技能など]

人間関係：
[重要な関係者との関係性、立場など]

成長要素：
[キャラクターの課題、可能性、変化の方向性など]`
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '生成に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  };

  // キャラクター詳細の抽出
  const extractCharacterDetails = (content) => {
    const sections = content.split('\n\n').filter(section => section.trim());
    const details = {};

    sections.forEach(section => {
      if (section.includes('キャラクター名：')) {
        details.character_name = section.split('：')[1].trim();
      } else if (section.startsWith('性格：')) {
        details.personality = section.split('：')[1].trim();
      } else if (section.startsWith('バックストーリー：') || section.startsWith('背景：')) {
        details.background = section.split('：')[1].trim();
      } else if (section.includes('外見') || section.includes('基本設定：')) {
        details.appearance = section.split('：')[1].trim();
      } else if (section.includes('人間関係：')) {
        details.relationships = section.split('：')[1].trim();
      } else if (section.includes('役割') || section.includes('立場')) {
        details.role = section.split('：')[1].trim();
      }
    });

    // 年齢の抽出（基本設定または外見から）
    const ageMatch = details.appearance?.match(/(\d+)歳/);
    details.age = ageMatch ? parseInt(ageMatch[1]) : null;

    return details;
  };

  // Supabaseへの保存
  const saveToSupabase = async (characterContent) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const details = extractCharacterDetails(characterContent);
      
      const { data, error: saveError } = await supabase
        .from('character_settings')
        .insert([{
          user_id: user.id,
          character_name: details.character_name || '名前未設定',
          age: details.age || null,
          personality: details.personality || null,
          background: details.background || null,
          appearance: details.appearance || null,
          role: details.role || null,
          relationships: details.relationships || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (saveError) {
        console.error('Save error details:', saveError);
        throw saveError;
      }

      setSaveSuccess(true);
      console.log('Character saved successfully:', data);
      
    } catch (error) {
      console.error('Detailed save error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('ログインが必要です');
      return;
    }

    if (!prompt.trim()) {
      setError('キャラクター設定の要素を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const generatedCharacter = await generateWithBedrock(prompt.trim());
      setGeneratedContent(generatedCharacter);
      await saveToSupabase(generatedCharacter);
    } catch (error) {
      console.error('設定生成エラー:', error);
      setError(error.message || 'キャラクター設定の生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // UI実装
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">キャラクター設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールは魅力的なキャラクター設定を生成するためのものです。性格、バックストーリー、特殊能力など、キャラクターの詳細な設定を出力します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-700 mb-2">
            キャラクター設定の要素
          </label>
          <p className="text-sm text-gray-600 mb-2">
            含めたい要素（性別、年齢、職業、特徴など）を自由に入力してください。
          </p>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="6"
            placeholder="例：
- 20代後半の女性科学者
- 天才的な頭脳を持つが社交性に難あり
- 幼少期のトラウマを抱えている
- 特殊な実験に関わっている
..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSaving || !user}
          className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : isSaving ? (
            '保存中...'
          ) : !user ? (
            'ログインが必要です'
          ) : (
            'キャラクター設定を生成'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">キャラクター設定が正常に保存されました</p>
        </div>
      )}

      {generatedContent && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">生成されたキャラクター設定</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="whitespace-pre-wrap">{generatedContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;