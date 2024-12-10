import React, { createContext, useContext, useState, useEffect } from 'react';

interface Character {
  id: string;
  name: string;
  description: string;
  prompt: string;
  generatedContent: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CharacterContextType {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const savedCharacters = localStorage.getItem('characters');
    return savedCharacters ? JSON.parse(savedCharacters) : [];
  });

  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Adding new character:', newCharacter);
    setCharacters(prev => [...prev, newCharacter]);
  };

  const updateCharacter = (id: string, characterData: Partial<Character>) => {
    setCharacters(prev =>
      prev.map(char =>
        char.id === id
          ? { ...char, ...characterData, updatedAt: new Date().toISOString() }
          : char
      )
    );
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const getCharacter = (id: string) => {
    return characters.find(char => char.id === id);
  };

  return (
    <CharacterContext.Provider
      value={{ characters, addCharacter, updateCharacter, deleteCharacter, getCharacter }}
    >
      {children}
    </CharacterProvider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};