import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';
import httpClient from '../lib/httpClient';
import StoryGenerationControls from './StoryGenerationControls';
import GenerateButton from './GenerateButton';

const StoryGenerator = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // データ処理の最適化関数
  const processLargeData = async (data, maxAttempts = 3) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await executeWithTimeout(async () => {
          return data;
        }, 45000);
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

  // 生成関数の更新
  const generateWithBedrock = async (promptText) => {
    try {
      const response = await httpClient.post('/generate', {
        type: 'story',
        prompt: promptText
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '生成に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

  // 設定の抽出関数
  const extractSettingDetails = (content) => {
    const sections = content.split('\n\n').filter(section => section.trim());
    let details = {
      title: '',
      summary: '',
      content: content
    };

    sections.forEach(section => {
      if (section.startsWith('設定タイトル：')) {
        details.title = section.split('：')[1].trim();
      } else if (section.includes('世界観：')) {
        details.summary = section.split('：')[1].trim();
      }
    });

    return details;
  };

  // Supabaseへの保存関数
  const saveToSupabase = async (worldBuildingContent) => {
    if (!user) throw new Error('ユーザーが認証されていません');
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const processedContent = await processLargeData(worldBuildingContent);
      const details = extractSettingDetails(processedContent);

      const saveData = {
        user_id: user.id,
        title: details.title || '無題',
        setting_prompt: prompt,
        world_building: processedContent,
        summary: details.summary,
        created_at: new Date().toISOString()
      };

      await executeWithTimeout(async () => {
        const { error: saveError } = await supabase
          .from('story_settings')
          .insert([saveData])
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
      setError('世界観・設定の要素を入力してください');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const generatedWorld = await executeWithTimeout(
        () => generateWithBedrock(prompt.trim()),
        45000
      );
      
      setGeneratedContent(generatedWorld);
      await saveToSupabase(generatedWorld);
      return true;
    } catch (error) {
      setError(error.message || '設定の生成中にエラーが発生しました。もう一度お試しください。');
      return false;
    } finally {
      setIsLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">物語世界観・設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールは物語の世界観や設定を生成するためのものです。キーとなる要素を入力することで、簡潔な世界観を生成します。
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-700 mb-2">
            世界観・設定の要素
          </label>
          <p className="text-sm text-gray-600 mb-2">
            含めたい要素（時代設定、テーマ、重要な概念など）を自由に入力してください。
          </p>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="6"
            placeholder="例：
- 未来の宇宙開拓時代
- 人工知能と人類の共存
- 古代文明の遺産が重要な役割を果たす
- 複数の惑星間での政治的対立"
          />
        </div>

        <GenerateButton
          onClick={handleGenerate}
          disabled={!user}
        >
          {isLoading ? "生成中..." : !user ? "ログインが必要です" : "世界観・設定を生成"}
        </GenerateButton>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">設定が正常に保存されました</p>
        </div>
      )}

      {generatedContent && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">生成された世界観・設定</h2>
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

export default StoryGenerator;