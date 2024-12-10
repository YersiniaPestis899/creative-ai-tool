// ... 前半部分は同じ ...

  const generateImagePrompt = (character) => {
    // 外見の説明から特徴を抽出
    const appearance = character.description.toLowerCase();
    let hairColor = ''; 
    if (appearance.includes('ピンク')) hairColor = 'pink hair, ';
    else if (appearance.includes('赤')) hairColor = 'red hair, ';
    else if (appearance.includes('金')) hairColor = 'blonde hair, ';
    else if (appearance.includes('銀')) hairColor = 'silver hair, ';
    else if (appearance.includes('青')) hairColor = 'blue hair, ';
    else if (appearance.includes('緑')) hairColor = 'green hair, ';
    else hairColor = 'black hair, ';

    // アニメ調の画風を強調
    return `portrait of a beautiful anime style girl, ${hairColor}${character.description}, 
    ((masterpiece)), (best quality), ((ultra detailed)), professional digital art, 
    detailed face, perfect anatomy, vibrant colors, trending on artstation, 
    soft lighting, cinematic composition, warm colors, dynamic pose, expressive eyes, 
    anime key visual, character design, 8k uhd`;
  };

// ... 残りの部分は同じ ...