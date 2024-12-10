// ... 前半部分は同じ ...

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

      const imageUrl = imageResponse.data.data;
      console.log('Image URL received');

      setGeneratedCharacter({
        name,
        description,
        generatedContent,
        imageUrl
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

// ... 残りの部分は同じ ...