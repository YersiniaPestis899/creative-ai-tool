import React, { useState } from 'react';
import { supabase } from '../lib/auth';
import { useAuth } from '../lib/auth';

const StoryGenerator = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const generateWorldBuilding = (prompt) => {
    // ローカルでの世界観生成ロジック
    const baseTemplate = `
設定タイトル：${prompt.length > 10 ? prompt.slice(0, 10) + 'の世界' : prompt + 'の世界'}

世界観：
${prompt}から想起される独自の世界観を展開します。

主要設定：
- 重要な場所：この物語の中心となる場所や地域
- 重要な組織：物語に関わる主要な組織や団体
- 文化的特徴：この世界における独特の文化や習慣
- 技術レベル：この世界の科学技術や魔法の発展度

重要な登場人物：
- 主要な登場人物たち
- それぞれの立場や役割
- 人物間の関係性

特殊な要素：
- この世界特有のシステムや法則
- 特別な能力や技術
- ユニークな制限や特徴

物語の核となる要素：
- 中心的なテーマ
- 主要な対立構造
- 物語を動かす原動力
`;

    return baseTemplate;
  };

  const extractSettingDetails = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const titleLine = lines.find(line => line.includes('設定タイトル'));
    const title = titleLine ? titleLine.split(/[：:]/)[1]?.trim() : '無題';
    
    const summary = lines.find(line => 
      line.includes('世界観：')
    )?.replace(/^世界観：/, '').trim() || '';

    return { title, summary };
  };

  const saveToSupabase = async (worldBuildingContent) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const { title, summary } = extractSettingDetails(worldBuildingContent);
      
      const { data, error: saveError } = await supabase
        .from('story_settings')
        .insert([{
          user_id: user.id,
          title,
          setting_prompt: prompt,
          world_building: worldBuildingContent,
          summary,
          created_at: new Date().toISOString()
        }])
        .select();

      if (saveError) {
        console.error('Save error details:', saveError);
        throw saveError;
      }

      setSaveSuccess(true);
      console.log('Settings saved successfully:', data);
      
    } catch (error) {
      console.error('Detailed save error:', error);
      setError(error.message || 'データの保存中にエラーが発生しました');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      // ローカルで世界観を生成
      const generatedWorldBuilding = generateWorldBuilding(prompt);
      setGeneratedContent(generatedWorldBuilding);

      await saveToSupabase(generatedWorldBuilding);
    } catch (error) {
      console.error('設定生成エラー:', error);
      setError(error.message || '設定の生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">物語世界観・設定ジェネレーター</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          このツールは物語の世界観や設定を生成するためのものです。キャラクター間の関係性、世界の仕組み、重要な背景設定などを詳細に出力します。
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
- 複数の惑星間での政治的対立
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
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;