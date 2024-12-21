import React, { useState } from 'react';
import axios from 'axios';
import { characterTemplates } from '../data/characterTemplates';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);

  const resetForm = () => {
    setPrompt('');
    setSelectedTemplate('');
    setError(null);
  };

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

  const extractCharacterFeatures = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    let features = [];

    // 外見的特徴を含む行を探す
    const appearanceLines = lines.filter(line => 
      line.includes('外見的特徴') || 
      line.includes('髪') || 
      line.includes('目') || 
      line.includes('服')
    );

    // 各行から特徴を抽出
    appearanceLines.forEach(line => {
      // 髪の色
      if (line.includes('ピンク')) features.push('pink hair');
      else if (line.includes('金')) features.push('blonde hair');
      else if (line.includes('赤')) features.push('red hair');
      else if (line.includes('青')) features.push('blue hair');
      else if (line.includes('緑')) features.push('green hair');
      else if (line.includes('黒')) features.push('black hair');
      else if (line.includes('茶')) features.push('brown hair');

      // 髪型
      if (line.includes('ツインテール')) features.push('twin tails');
      if (line.includes('ポニーテール')) features.push('ponytail');
      if (line.includes('ショート')) features.push('short hair');
      if (line.includes('ロング')) features.push('long hair');
      if (line.includes('三つ編み')) features.push('braid');
      if (line.includes('お団子')) features.push('hair bun');

      // 目の色
      if (line.includes('紫色の目') || line.includes('紫の目')) features.push('purple eyes');
      else if (line.includes('青い目') || line.includes('青目')) features.push('blue eyes');
      else if (line.includes('赤い目') || line.includes('赤目')) features.push('red eyes');
      else if (line.includes('緑の目')) features.push('green eyes');
      else if (line.includes('茶色の目') || line.includes('茶色目')) features.push('brown eyes');

      // 服装
      if (line.includes('セーラー服')) features.push('sailor uniform');
      if (line.includes('制服')) features.push('school uniform');
      if (line.includes('ワンピース')) features.push('dress');

      // その他の特徴
      if (line.includes('メガネ')) features.push('glasses');
      if (line.includes('そばかす')) features.push('freckles');
      if (line.includes('リボン')) features.push('ribbon');
    });

    // 重複を除去
    features = [...new Set(features)];
    return features;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // キャラクター生成
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

      // キャラクター情報をステートに保存
      const newCharacter = {
        name,
        description,
        generatedContent,
        imageUrl: null
      };
      
      setGeneratedCharacter(newCharacter);

      // Supabaseに保存
      try {
        const { error: saveError } = await supabase
          .from('characters')
          .insert([{
            name: newCharacter.name,
            description: newCharacter.description,
            generated_content: newCharacter.generatedContent,
            image_url: newCharacter.imageUrl
          }]);

        if (saveError) {
          console.error('保存エラー:', saveError);
        }
      } catch (saveError) {
        console.error('キャラクター保存エラー:', saveError);
      }

      // フォームをリセット
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setGeneratedCharacter(null);
    resetForm();
  };

  const handleGenerateImage = async () => {
    if (!generatedCharacter) return;
    setIsGeneratingImage(true);
    setError(null);

    try {
      const features = extractCharacterFeatures(generatedCharacter.generatedContent);
      console.log('Extracted features:', features);

      const imagePrompt = `${generatedCharacter.description}, beautiful anime girl, ${features.join(', ')}, 
        best quality masterpiece, ultra high res, detailed face, perfect anatomy,
        expressive eyes, detailed shading, dynamic lighting, trending on artstation,
        professional digital art`;

      console.log('Image generation prompt:', imagePrompt);

      const imageResponse = await axios.post(`${API_URL}/generate-image`, {
        prompt: imagePrompt
      });

      if (!imageResponse.data.success) {
        throw new Error('画像生成に失敗しました');
      }

      const imageUrl = `data:image/jpeg;base64,${imageResponse.data.data}`;

      // ステート更新
      setGeneratedCharacter(prev => ({
        ...prev,
        imageUrl
      }));

      // Supabaseの画像URLを更新
      try {
        const { error: updateError } = await supabase
          .from('characters')
          .update({ image_url: imageUrl })
          .eq('name', generatedCharacter.name)
          .eq('generated_content', generatedCharacter.generatedContent);

        if (updateError) {
          console.error('画像URL更新エラー:', updateError);
        }
      } catch (updateError) {
        console.error('画像URL更新エラー:', updateError);
      }

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
                justify-center: center;
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
      {!generatedCharacter ? (
        <>
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
        </>
      ) : (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{generatedCharacter.name}</h2>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              新しいキャラクターを作成
            </button>
          </div>
          
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