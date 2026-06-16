import { useState, useEffect, useCallback } from 'react';
import { supabase, getSessionId } from '../lib/supabase';
import type { FavoriteCity, City } from '../types/weather';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const sessionId = getSessionId();

  const loadFavorites = useCallback(async () => {
    const { data } = await supabase
      .from('favorite_cities')
      .select('*')
      .eq('user_session', sessionId)
      .order('created_at', { ascending: false });
    if (data) setFavorites(data);
  }, [sessionId]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const addFavorite = async (city: City) => {
    const exists = favorites.some(f => f.latitude === city.lat && f.longitude === city.lon);
    if (exists) return;
    const { data } = await supabase
      .from('favorite_cities')
      .insert({ user_session: sessionId, city_name: city.name, country: city.country, latitude: city.lat, longitude: city.lon })
      .select()
      .single();
    if (data) setFavorites(prev => [data, ...prev]);
  };

  const removeFavorite = async (id: string) => {
    await supabase.from('favorite_cities').delete().eq('id', id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const isFavorite = (lat: number, lon: number) =>
    favorites.some(f => Math.abs(f.latitude - lat) < 0.01 && Math.abs(f.longitude - lon) < 0.01);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<FavoriteCity[]>([]);
  const sessionId = getSessionId();

  const loadRecents = useCallback(async () => {
    const { data } = await supabase
      .from('recent_searches')
      .select('*')
      .eq('user_session', sessionId)
      .order('searched_at', { ascending: false })
      .limit(5);
    if (data) setRecents(data);
  }, [sessionId]);

  useEffect(() => { loadRecents(); }, [loadRecents]);

  const addRecent = async (city: City) => {
    await supabase.from('recent_searches').delete()
      .eq('user_session', sessionId)
      .eq('city_name', city.name)
      .eq('country', city.country);

    const { data } = await supabase
      .from('recent_searches')
      .insert({ user_session: sessionId, city_name: city.name, country: city.country, latitude: city.lat, longitude: city.lon })
      .select()
      .single();
    if (data) setRecents(prev => [data, ...prev].slice(0, 5));
  };

  return { recents, addRecent };
}
