// ... 前半は同じ ...

  const generateImagePrompt = (character) => {
    // 外見についての日本語の説明を英語に変換
    const appearance = character.description.toLowerCase();
    const features = [];
    
    // 髪の色
    if (appearance.includes('ピンク')) features.push('pink hair');
    else if (appearance.includes('赤')) features.push('red hair');
    else if (appearance.includes('金')) features.push('blonde hair');
    else if (appearance.includes('銀')) features.push('silver hair');
    else if (appearance.includes('青')) features.push('blue hair');
    else if (appearance.includes('緑')) features.push('green hair');
    else features.push('black hair');

    // その他の特徴を英語に変換
    if (appearance.includes('ロング')) features.push('long hair');
    if (appearance.includes('ショート')) features.push('short hair');
    if (appearance.includes('ツインテール')) features.push('twin tails');
    if (appearance.includes('ポニーテール')) features.push('ponytail');
    if (appearance.includes('メガネ')) features.push('glasses');
    if (appearance.includes('制服')) features.push('school uniform');

    return `beautiful anime girl, masterpiece, best quality, ultra detailed, ${features.join(', ')}, 
    detailed face, perfect anatomy, professional lighting, trending on artstation, 
    soft lighting, dynamic pose, expressive eyes, anime style character design`;
  };

// ... 残りは同じ ...