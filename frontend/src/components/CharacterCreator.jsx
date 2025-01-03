import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';
import httpClient from '../lib/httpClient';
import StoryGenerationControls from './StoryGenerationControls';
import GenerateButton from './GenerateButton';

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

    return sections.map(section => {
      if (section.includes(':')) {
        const [key, ...valueParts] = section.split(':');
        return `${key.trim()}：${valueParts.join(':').trim()}`;
      }
      return section;
    }).join('\n');
  };

  // データ処理関数
  const processLargeData = async (data, maxAttempts = 3) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await executeWithTimeout(async () => data, 45000);
      } catch (error) {
        attempt++;
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

  // キャラクター生成関数
  const generateWithBedrock = async (promptText) => {
    try {
      const processedPrompt = preprocessPrompt(promptText);
      const response = await httpClient.post('/generate', {
        type: 'character',
        prompt: processedPrompt
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '生成に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

  // キャラクター詳細抽出関数
  const extractCharacterDetails = (content) => {
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

    const extractField = (line) => {
      const matches = {
        name: line.match(/^1\.?\s*名前[:：](.+)/),
        attr: line.match(/^2\.?\s*属性[:：](.+)/),
        appearance: line.match(/^3\.?\s*外見[:：](.+)/),
        personality: line.match(/^4\.?\s*性格[:：](.+)/),
        background: line.match(/^5\.?\s*背景[:：](.+)/),
        traits: line.match(/^6\.?\s*特徴[:：](.+)/)
      };

      if (matches.name) details.character_name = matches.name[1].trim();
      else if (matches.attr) {
        const ageMatch = matches.attr[1].match(/(\d+)歳/);
        if (ageMatch) details.age = parseInt(ageMatch[1], 10);
        details.role = matches.attr[1].trim();
      }
      else if (matches.appearance) details.appearance = matches.appearance[1].trim();
      else if (matches.personality) details.personality = matches.personality[1].trim();
      else if (matches.background) details.background = matches.background[1].trim();
      else if (matches.traits) details.relationships = matches.traits[1].trim();
    };

    sections.forEach(extractField);
    
    const validateDetails = () => {
      const missingFields = [];
      if (!details.character_name) missingFields.push('名前');
      if (!details.personality) missingFields.push('性格');
      if (!details.background) missingFields.push('背景');
      
      if (missingFields.length > 0) {
        throw new Error(`以下の情報が不足しています: ${missingFields.join(', ')}`);
      }
    };

    validateDetails();
    return details;
  };

  // Supabase保存関数
  const saveToSupabase = async (characterContent) => {
    if (!user) throw new Error('ユーザーが認証されていません');
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const processedContent = await processLargeData(characterContent);
      const details = extractCharacterDetails(processedContent);

      await executeWithTimeout(async () => {
        const { error: saveError } = await supabase
          .from('character_settings')
          .insert([{
            user_id: user.id,
            ...details,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (saveError) throw saveError;
        setSaveSuccess(true);
      }, 45000);
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 生成ハンドラ
  const handleGenerate = async () => {
    if (!user) {
      setError('ログインが必要です');
      return false;
    }

    if (!prompt.trim()) {
      setError('キャラクター設定の要素を入力してください');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const generatedCharacter = await executeWithTimeout(
        () => generateWithBedrock(prompt.trim()),
        45000
      );
      
      setGeneratedContent(generatedCharacter);
      await saveToSupabase(generatedCharacter);
      return true;
    } catch (error) {
      setError(error.message.includes('情報が不足')
        ? error.message
        : 'キャラクター設定の生成中にエラーが発生しました。もう一度お試しください。');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // クリアハンドラ
  const handleClear = () => {
    if (window.confirm('生成された内容をクリアしてもよろしいですか？')) {
      setGeneratedContent('');
      setPrompt('');
      setError(null);
      setSaveSuccess(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">キャラクター設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールはキャラクター設定を生成するためのものです。性格、背景、特徴などの基本的な設定を簡潔に出力します。
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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

        <GenerateButton
          onClick={handleGenerate}
          disabled={!user}
        >
          {isLoading ? "生成中..." : !user ? "ログインが必要です" : "キャラクター設定を生成"}
        </GenerateButton>
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