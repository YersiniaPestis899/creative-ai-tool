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

  // ランダムな要素を生成するヘルパー関数
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // プロンプトからキーワードを抽出
  const extractKeywords = (text) => {
    return text.split(/[\n,]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  const generateWorldBuilding = (prompt) => {
    const keywords = extractKeywords(prompt);
    
    // ジャンルや世界観の特徴を定義
    const genres = ['ファンタジー', 'SF', '歴史', 'ポストアポカリプス', '現代'];
    const themes = ['希望', '対立', '成長', '革新', '伝統', '共生', '冒険'];
    const conflicts = ['内なる闘い', '社会との対立', '自然との調和', '技術の発展と代償', '伝統と革新の衝突'];
    
    // プロンプトの長さに応じてタイトルを生成
    const title = keywords.length > 1 
      ? `${keywords[0]}と${keywords[1]}の交わる世界`
      : `${keywords[0] || 'New'}の世界`;

    // 世界観の要素を生成
    const mainSetting = keywords.map(keyword => {
      const genre = getRandomElement(genres);
      const theme = getRandomElement(themes);
      return `${keyword}を中心とした${genre}的要素と${theme}のテーマが織り込まれた世界`;
    }).join('、');

    // 重要な場所や組織を生成
    const locations = keywords.map(keyword => 
      `・${keyword}にまつわる重要拠点：独自の文化と歴史を持つ特別な場所`
    ).join('\n');

    const organizations = keywords.map(keyword =>
      `・${keyword}に関連する組織：世界の秩序や変革に関わる重要な集団`
    ).join('\n');

    // キャラクター関係を生成
    const characters = keywords.map(keyword =>
      `・${keyword}に関わる重要人物：独自の背景と動機を持つ存在`
    ).join('\n');

    // 特殊要素を生成
    const specialElements = keywords.map(keyword =>
      `・${keyword}から派生する特殊な力や技術：世界を特徴付ける重要な要素`
    ).join('\n');

    // 中心的な対立を生成
    const centralConflict = getRandomElement(conflicts);

    // テンプレートを組み立て
    return `設定タイトル：${title}

世界観：
${mainSetting}
この世界では、${centralConflict}を中心とした物語が展開されます。

主要設定：
【重要な場所】
${locations}

【重要な組織】
${organizations}

重要な登場人物：
${characters}

特殊な要素：
${specialElements}

物語の核となる要素：
・中心的なテーマ：${getRandomElement(themes)}
・主要な対立構造：${centralConflict}
・物語を動かす原動力：${keywords.join('と')}の相互作用がもたらす変化と進化

※この設定は基本的な枠組みであり、さらなる詳細や展開の可能性を秘めています。`;
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
      const generatedWorldBuilding = generateWorldBuilding(prompt.trim());
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