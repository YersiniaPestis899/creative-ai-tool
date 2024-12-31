import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';
import httpClient from '../lib/httpClient';
import StoryGenerationControls from './StoryGenerationControls';

const CharacterCreator = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // プロンプトの前処理関数
  const preprocessPrompt = (input) => {
    const sections = input
      .split(/[*・]/)
      .filter(s => s.trim())
      .map(s => s.trim());

    const formattedSections = sections.map(section => {
      // "名前: " のような形式を処理
      if (section.includes(':')) {
        const [key, ...valueParts] = section.split(':');
        return `${key.trim()}：${valueParts.join(':').trim()}`;
      }
      // その他のフォーマットを処理
      return section;
    });

    return formattedSections.join('\n');
  };

  // データ処理の最適化関数
  const processLargeData = async (data, maxAttempts = 3) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await executeWithTimeout(async () => {
          console.log(`Processing attempt ${attempt + 1}`);
          return data;
        }, 45000);
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // タイムアウト付き実行関数
  const executeWithTimeout = (func, timeout) => {
    return Promise.race([
      func(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      )
    ]);
  };

  // 改善されたキャラクター設定の生成関数
  const generateWithBedrock = async (promptText) => {
    try {
      console.group('Character Generation Process');
      console.log('Original prompt:', promptText);
      const processedPrompt = preprocessPrompt(promptText);
      console.log('Processed prompt:', processedPrompt);

      const response = await httpClient.post('/generate', {
        type: 'character',  // 追加：タイプの明示
        prompt: processedPrompt
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '生成に失敗しました');
      }

      console.log('Generated content:', response.data.data);
      console.groupEnd();
      return response.data.data;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  };

  // 強化されたキャラクター詳細の抽出関数
  const extractCharacterDetails = (content) => {
    console.group('Data Extraction Process');
    console.log('Raw content:', content);

    // より柔軟な行分割
    const sections = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const details = {
      character_name: '',
      age: null,
      personality: '',
      background: '',
      appearance: '',
      role: '',
      relationships: ''
    };

    try {
      sections.forEach(line => {
        // 改善された正規表現マッチング
        const nameMatch = line.match(/^1\.?\s*名前[:：](.+)/);
        const attrMatch = line.match(/^2\.?\s*属性[:：](.+)/);
        const appearanceMatch = line.match(/^3\.?\s*外見[:：](.+)/);
        const personalityMatch = line.match(/^4\.?\s*性格[:：](.+)/);
        const backgroundMatch = line.match(/^5\.?\s*背景[:：](.+)/);
        const traitsMatch = line.match(/^6\.?\s*特徴[:：](.+)/);

        if (nameMatch) {
          details.character_name = nameMatch[1].trim();
        } else if (attrMatch) {
          const ageMatch = attrMatch[1].match(/(\d+)歳/);
          if (ageMatch) {
            details.age = parseInt(ageMatch[1], 10);
          }
          details.role = attrMatch[1].trim();
        } else if (appearanceMatch) {
          details.appearance = appearanceMatch[1].trim();
        } else if (personalityMatch) {
          details.personality = personalityMatch[1].trim();
        } else if (backgroundMatch) {
          details.background = backgroundMatch[1].trim();
        } else if (traitsMatch) {
          details.relationships = traitsMatch[1].trim();
        }
      });

      // バリデーションの強化
      const missingFields = [];
      if (!details.character_name) missingFields.push('名前');
      if (!details.personality) missingFields.push('性格');
      if (!details.background) missingFields.push('背景');

      console.log('Extracted details:', details);
      console.log('Validation check - Missing fields:', missingFields);

      if (missingFields.length > 0) {
        throw new Error(`以下の情報が不足しています: ${missingFields.join(', ')}`);
      }

      console.groupEnd();
      return details;
    } catch (error) {
      console.error('Extraction error:', error);
      console.groupEnd();
      throw error;
    }
  };

  // Supabaseへの保存関数
  const saveToSupabase = async (characterContent) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    console.group('Data Save Process');
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const processedContent = await processLargeData(characterContent);
      console.log('Processing content for save:', processedContent);
      const details = extractCharacterDetails(processedContent);

      const saveData = {
        user_id: user.id,
        character_name: details.character_name,
        age: details.age,
        personality: details.personality,
        background: details.background,
        appearance: details.appearance,
        role: details.role,
        relationships: details.relationships,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 保存処理の最適化
      await executeWithTimeout(async () => {
        console.log('Prepared save data:', saveData);
        const { data, error: saveError } = await supabase
          .from('character_settings')
          .insert([saveData])
          .select();

        if (saveError) {
          console.error('Save error:', saveError);
          throw saveError;
        }

        console.log('Save successful:', data);
        setSaveSuccess(true);
      }, 45000);
      
    } catch (error) {
      console.error('Save operation failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
      console.groupEnd();
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group('Form Submission Process');

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
      console.log('Starting character generation process');
      const generatedCharacter = await executeWithTimeout(
        () => generateWithBedrock(prompt.trim()),
        45000
      );
      
      setGeneratedContent(generatedCharacter);
      console.log('Starting save process');
      
      await saveToSupabase(generatedCharacter);
    } catch (error) {
      console.error('Process failed:', error);
      const errorMessage = error.message.includes('情報が不足') 
        ? error.message 
        : 'キャラクター設定の生成中にエラーが発生しました。もう一度お試しください。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  // クリア処理ハンドラ
  const handleClear = () => {
    if (window.confirm('生成された内容をクリアしてもよろしいですか？')) {
      setGeneratedContent('');
      setPrompt('');
      setError(null);
      setSaveSuccess(false);
    }
  };

  // UI実装
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">キャラクター設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールはキャラクター設定を生成するためのものです。性格、背景、特徴などの基本的な設定を簡潔に出力します。
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
- 特殊な実験に関わっている"
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
            <StoryGenerationControls 
              result={generatedContent}
              onClear={handleClear}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;