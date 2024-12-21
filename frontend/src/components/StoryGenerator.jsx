import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const StoryGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // タイトルと概要を抽出する関数
  const extractTitleAndSummary = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const titleLine = lines.find(line => line.includes('タイトル') || line.includes('題名'));
    const title = titleLine ? titleLine.split(/[：:]/)[1]?.trim() : '無題';

    // 最初の段落を概要として使用
    const summary = lines.slice(1).find(line => line.length > 10) || '';

    return { title, summary };
  };

  // ストーリーを保存する関数
  const saveToSupabase = async (generatedContent) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { title, summary } = extractTitleAndSummary(generatedContent);
      
      const { data, error: saveError } = await supabase
        .from('stories')
        .insert([{
          title,
          content: prompt,
          generated_content: generatedContent,
          summary
        }])
        .select();

      if (saveError) throw saveError;

      setSaveSuccess(true);
      console.log('Story saved successfully:', data);
    } catch (error) {
      console.error('Error saving story:', error);
      setError('ストーリーの保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await axios.post(`${API_URL}/generate`, {
        prompt: `以下の設定でストーリーを生成してください。タイトルを必ず最初につけてください：

${prompt}

形式：
タイトル：[タイトル]

[ストーリー本文]`,
        type: 'story'
      });

      if (!response.data.success) {
        throw new Error('ストーリーの生成に失敗しました');
      }

      const generatedContent = response.data.data;
      setGeneratedStory(generatedContent);

      // 生成されたストーリーを自動的に保存
      await saveToSupabase(generatedContent);

    } catch (error) {
      console.error('ストーリー生成エラー:', error);
      setError(error.response?.data?.error || 'ストーリーの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AIストーリー作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            ストーリーの設定
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
            placeholder="ストーリーのアイデアや設定を入力してください..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
          ) : (
            'ストーリーを生成'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">ストーリーが正常に保存されました</p>
        </div>
      )}

      {generatedStory && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">生成されたストーリー</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="whitespace-pre-wrap">{generatedStory}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;