import React from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { Link } from 'react-router-dom';

const CharacterList = () => {
  const { characters, deleteCharacter } = useCharacter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <div
          key={character.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          {character.imageUrl && (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {character.description}
          </p>
          <div className="flex justify-between items-center">
            <Link
              to={`/characters/${character.id}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              詳細を見る
            </Link>
            <button
              onClick={() => deleteCharacter(character.id)}
              className="text-red-600 hover:text-red-800"
            >
              削除
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            作成日: {new Date(character.createdAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;