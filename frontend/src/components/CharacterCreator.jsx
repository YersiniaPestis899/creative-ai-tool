// ... 前のコードはそのまま ...

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