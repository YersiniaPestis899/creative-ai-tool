import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // キャラクター保存
  const saveCharacter = async (character) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: saveError } = await supabase
        .from('characters')
        .insert([
          {
            name: character.name,
            description: character.description,
            generated_content: character.generatedContent,
            image_url: character.imageUrl
          }
        ])
        .select();

      if (saveError) throw saveError;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // キャラクター一覧取得
  const getCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 小説設定保存
  const saveStory = async (story) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: saveError } = await supabase
        .from('stories')
        .insert([
          {
            title: story.title || '無題',
            content: story.content,
            generated_content: story.generatedContent
          }
        ])
        .select();

      if (saveError) throw saveError;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 小説設定一覧取得
  const getStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveCharacter,
    getCharacters,
    saveStory,
    getStories
  };
};