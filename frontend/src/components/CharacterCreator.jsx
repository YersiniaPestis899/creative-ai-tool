import React, { useState } from 'react';
import axios from 'axios';
import { characterTemplates } from '../data/characterTemplates';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    - 外見的特徴
    - 特殊能力やスキル（該当する場合）
    - 重要な人間関係
    
    できるだけ具体的に、物語に組み込みやすい形で設定を作成してください。`;
  };

  const generateImagePrompt = (character) => {
    return `portrait of ${character.name}, ${character.description}, digital art, highly detailed, realistic, best quality, detailed face, artstation quality, beautiful, ultra detailed`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // キャラクター設定の生成
      console.log('Generating character...');
      const characterResponse = await axios.post(`${API_URL}/generate`, {
        prompt: generateCharacterPrompt(),
        type: 'character'
      });

      if (!characterResponse.data.success) {
        throw new Error('キャラクター生成に失敗しました');
      }

      const generatedContent = characterResponse.data.data;
      console.log('Generated content:', generatedContent);

      // 生成された設定から名前と説明を抽出
      const lines = generatedContent.split('\n').filter(line => line.trim());
      const name = lines.find(line => line.includes('名前'))?.split('：')[1]?.trim() || '名前未設定';
      const description = lines.find(line => line.includes('外見'))?.split('：')[1]?.trim() || '説明なし';

      console.log('Extracted name and description:', { name, description });

      // 画像生成
      console.log('Generating image...');
      const imageResponse = await axios.post(`${API_URL}/generate-image`, {
        prompt: generateImagePrompt({ name, description })
      });

      console.log('Image generation response:', imageResponse.data);

      if (!imageResponse.data.success) {
        throw new Error('画像生成に失敗しました');
      }

      // Base64画像データをデータURLに変換
      const imageDataUrl = `data:image/jpeg;base64,${imageResponse.data.data}`;

      setGeneratedCharacter({
        name,
        description,
        generatedContent,
        imageUrl: imageDataUrl
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
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
          
          {generatedCharacter.imageUrl && (
            <div className="space-y-2">
              <div className="relative w-full h-[512px]">
                <img
                  src={generatedCharacter.imageUrl}
                  alt={generatedCharacter.name}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageInNewTab(generatedCharacter.imageUrl)}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                画像をクリックすると新しいタブで開きます
              </p>
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