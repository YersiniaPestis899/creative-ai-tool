import React, { useState } from 'react';
import axios from 'axios';
import { characterTemplates } from '../data/characterTemplates';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);

  const generateCharacterPrompt = () => {
    const template = selectedTemplate 
      ? characterTemplates.find(t => t.id === selectedTemplate)?.template 
      : '';
    
    return `${template}
    ${prompt}
    
    キャラクターの詳細な設定を作成してください。
    以下の情報を含めて回答してください：
    - 名前と基本的な属性
    - 性格特性
    - 経歴
    - 目標と動機
    - 外見的特徴（髪型、髪の色、目の色、服装など、できるだけ具体的に）
    - 特殊能力やスキル（該当する場合）
    - 重要な人間関係
    
    できるだけ具体的に、物語に組み込みやすい形で設定を作成してください。`;
  };

  const translateAppearance = (description) => {
    const appearance = description.toLowerCase();
    const features = [];
    
    // 髪の色
    if (appearance.includes('ピンク')) features.push('pink hair');
    if (appearance.includes('赤')) features.push('red hair');
    if (appearance.includes('金')) features.push('blonde hair');
    if (appearance.includes('銀')) features.push('silver hair');
    if (appearance.includes('青')) features.push('blue hair');
    if (appearance.includes('緑')) features.push('green hair');
    if (appearance.includes('茶')) features.push('brown hair');
    if (appearance.includes('黒')) features.push('black hair');
    if (!features.some(f => f.includes('hair'))) features.push('black hair');

    // 髪型
    if (appearance.includes('ロング')) features.push('long hair');
    if (appearance.includes('ショート')) features.push('short hair');
    if (appearance.includes('ツインテール')) features.push('twin tails');
    if (appearance.includes('ポニーテール')) features.push('ponytail');
    if (appearance.includes('三つ編み')) features.push('braid');
    if (appearance.includes('お団子')) features.push('hair bun');

    // その他の特徴
    if (appearance.includes('メガネ')) features.push('glasses');
    if (appearance.includes('制服')) features.push('school uniform');
    if (appearance.includes('ドレス')) features.push('dress');
    if (appearance.includes('リボン')) features.push('ribbon');
    if (appearance.includes('赤い目')) features.push('red eyes');
    if (appearance.includes('青い目')) features.push('blue eyes');
    if (appearance.includes('緑の目')) features.push('green eyes');
    if (appearance.includes('茶色い目')) features.push('brown eyes');
    if (appearance.includes('紫の目')) features.push('purple eyes');

    return features;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const characterResponse = await axios.post(`${API_URL}/generate`, {
        prompt: generateCharacterPrompt(),
        type: 'character'
      });

      if (!characterResponse.data.success) {
        throw new Error('キャラクター生成に失敗しました');
      }

      const generatedContent = characterResponse.data.data;
      const lines = generatedContent.split('\n').filter(line => line.trim());
      const name = lines.find(line => line.includes('名前'))?.split('：')[1]?.trim() || '名前未設定';
      const description = lines.find(line => line.includes('外見'))?.split('：')[1]?.trim() || '説明なし';

      setGeneratedCharacter({
        name,
        description,
        generatedContent,
        imageUrl: null
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedCharacter) return;
    setIsGeneratingImage(true);
    setError(null);

    try {
      const features = translateAppearance(generatedCharacter.description);
      const imagePrompt = `best quality masterpiece, ultra high res, beautiful anime girl character design, ${features.join(', ')}, expressive eyes, detailed shading, dynamic lighting, trending on artstation`;

      const imageResponse = await axios.post(`${API_URL}/generate-image`, {
        prompt: imagePrompt
      });

      if (!imageResponse.data.success) {
        throw new Error('画像生成に失敗しました');
      }

      setGeneratedCharacter(prev => ({
        ...prev,
        imageUrl: `data:image/jpeg;base64,${imageResponse.data.data}`
      }));
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const openImageInNewTab = (imageUrl) => {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>Generated Character Image</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f0f0f0;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Generated Character">
          </body>
        </html>
      `);
      newTab.document.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AIキャラクター作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            テンプレートを選択
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">テンプレートを選択してください</option>
            {characterTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キャラクターの設定
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="6"
            placeholder="キャラクターの特徴や設定を入力してください..."
          />
          <p className="mt-2 text-sm text-gray-500">
            テンプレートを選択するか、自由に設定を入力してください。両方選択することもできます。
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            'キャラクターを生成'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </form>

      {generatedCharacter && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-bold">{generatedCharacter.name}</h2>
          
          {!generatedCharacter.imageUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    イラスト生成中...
                  </>
                ) : (
                  'イラストを生成'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative w-full h-[512px]">
                <img
                  src={generatedCharacter.imageUrl}
                  alt={generatedCharacter.name}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageInNewTab(generatedCharacter.imageUrl)}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  画像をクリックすると新しいタブで開きます
                </p>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isGeneratingImage ? '生成中...' : '再生成'}
                </button>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">キャラクター設定</h3>
            <p className="whitespace-pre-wrap">{generatedCharacter.generatedContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;