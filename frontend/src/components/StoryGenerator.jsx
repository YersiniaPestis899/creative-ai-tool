import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';
import httpClient from '../lib/httpClient';
import StoryGenerationControls from './StoryGenerationControls';

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
          console.log(`Processing attempt ${attempt + 1}`);
          return data;
        }, 45000); // 45秒タイムアウト
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

  // 生成関数の更新
  const generateWithBedrock = async (promptText) => {
    try {
      console.group('Story Generation Process');
      console.log('Generating story with prompt:', promptText);
      
      const response = await httpClient.post('/generate', {
        type: 'story',  // 追加：タイプの明示
        prompt: promptText
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

  // 設定の抽出関数
  const extractSettingDetails = (content) => {
    console.group('Data Extraction Process');
    console.log('Raw content:', content);

    const sections = content.split('\n\n').filter(section => section.trim());
    let details = {
      title: '',
      summary: '',
      content: content
    };

    try {
      sections.forEach(section => {
        if (section.startsWith('タイトル：')) {
          details.title = section.split('：')[1].trim();
        } else if (section.includes('世界観：')) {
          details.summary = section.split('：')[1].trim();
        }
      });

      return details;
    } catch (error) {
      console.error('Extraction error:', error);
      throw new Error('設定の解析に失敗しました');
    }
  };

  // Supabaseへの保存関数
  const saveToSupabase = async (worldBuildingContent) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    console.group('Data Save Process');
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const processedContent = await processLargeData(worldBuildingContent);
      console.log('Processing content for save:', processedContent);
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
        console.log('Prepared save data:', saveData);
        const { data, error: saveError } = await supabase
          .from('story_settings')
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
      setError('世界観・設定の要素を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      console.log('Starting story generation process');
      const generatedWorld = await executeWithTimeout(
        () => generateWithBedrock(prompt.trim()),
        45000
      );
      
      setGeneratedContent(generatedWorld);
      console.log('Starting save process');
      
      await saveToSupabase(generatedWorld);
    } catch (error) {
      console.error('Process failed:', error);
      setError(error.message || '設定の生成中にエラーが発生しました。もう一度お試しください。');
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">物語世界観・設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールは物語の世界観や設定を生成するためのものです。キーとなる要素を入力することで、簡潔な世界観を生成します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            '世界観・設定を生成'
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