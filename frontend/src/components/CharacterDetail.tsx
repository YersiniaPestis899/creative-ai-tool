import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CharacterDetail = () => {
  // ... 前の部分は同じ ...

  const generateImagePrompt = (character: any) => {
    return `portrait of ${character.name}, ${character.description}, digital art, highly detailed, realistic, best quality, detailed face, artstation quality, beautiful, ultra detailed`;
  };

  const handleGenerateImage = async () => {
    if (!character) return;
    setIsGeneratingImage(true);

    try {
      const response = await axios.post(`${API_URL}/generate-image`, {
        prompt: generateImagePrompt(character)
      });

      if (response.data.success) {
        updateCharacter(id || '', {
          imageUrl: response.data.data
        });
        
        // ローカルのステートも更新
        setCharacter(prev => prev ? {
          ...prev,
          imageUrl: response.data.data
        } : null);
      }
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像の生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ... 残りの部分は同じ ...
}

export default CharacterDetail;