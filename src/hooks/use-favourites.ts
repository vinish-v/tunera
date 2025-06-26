
"use client";

import { useState, useEffect, useCallback } from 'react';

export type FavouriteSong = { 
  id: string; 
  title: string; 
  artist: string; 
};

const FAVOURITES_KEY = 'tunera_favourites';

export const useFavourites = () => {
  const [favourites, setFavourites] = useState<FavouriteSong[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVOURITES_KEY);
      if (item) {
        setFavourites(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load favourites from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveFavourites = (items: FavouriteSong[]) => {
    try {
      const item = JSON.stringify(items);
      window.localStorage.setItem(FAVOURITES_KEY, item);
    } catch (error) {
      console.error("Failed to save favourites to localStorage", error);
    }
  };

  const addFavourite = useCallback((song: { title: string; artist: string }) => {
    setFavourites((prev) => {
      const newFav: FavouriteSong = {
        id: `${song.title}-${song.artist}`,
        title: song.title,
        artist: song.artist,
      };
      if (prev.find(f => f.id === newFav.id)) return prev; // Avoid duplicates
      
      const newFavourites = [...prev, newFav];
      saveFavourites(newFavourites);
      return newFavourites;
    });
  }, []);

  const removeFavourite = useCallback((songId: string) => {
    setFavourites((prev) => {
      const newFavourites = prev.filter((fav) => fav.id !== songId);
      saveFavourites(newFavourites);
      return newFavourites;
    });
  }, []);

  const isFavourite = useCallback((songId: string) => {
    if (!isLoaded) return false;
    return favourites.some((fav) => fav.id === songId);
  }, [favourites, isLoaded]);

  return { favourites, addFavourite, removeFavourite, isFavourite, isLoaded };
};
