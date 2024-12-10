import React from 'react';

export const CharacterDetails = ({
  character,
  onCreateNew,
  onGenerateImage,
  onOpenImage,
  isGeneratingImage,
  error
}) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{character.name}</h2>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          新しいキャラクターを作成
        </button>
      </div>
      
      {!character.imageUrl ? (
        <div className="flex justify-center">
          <button
            onClick={onGenerateImage}
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
              src={character.imageUrl}
              alt={character.name}
              className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onOpenImage(character.imageUrl)}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              画像をクリックすると新しいタブで開きます
            </p>
            <button
              onClick={onGenerateImage}
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
        <p className="whitespace-pre-wrap">{character.generatedContent}</p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
