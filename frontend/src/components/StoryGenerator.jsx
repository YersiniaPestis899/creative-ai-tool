// ... 前のコード内容はそのまま ...

const saveToSupabase = async (worldBuildingContent) => {
  setIsSaving(true);
  setSaveSuccess(false);
  
  try {
    // テーブル存在確認
    const { error: checkError } = await supabase
      .from('story_settings')
      .select('count')
      .limit(1);

    if (checkError) {
      console.error('Table check error:', checkError);
      throw new Error('テーブルへのアクセスに失敗しました');
    }

    const { title, summary } = extractSettingDetails(worldBuildingContent);
    
    const { data, error: saveError } = await supabase
      .from('story_settings')
      .insert([{
        title,
        setting_prompt: prompt,
        world_building: worldBuildingContent,
        summary,
        created_at: new Date().toISOString()
      }])
      .select();

    console.log('Save attempt response:', { data, error: saveError });

    if (saveError) {
      console.error('Save error details:', saveError);
      throw saveError;
    }

    setSaveSuccess(true);
    console.log('Settings saved successfully:', data);
    
  } catch (error) {
    console.error('Detailed save error:', error);
    setError(error.message || 'データの保存中にエラーが発生しました');
    throw error;
  } finally {
    setIsSaving(false);
  }
};

// ... 残りのコード内容はそのまま ...