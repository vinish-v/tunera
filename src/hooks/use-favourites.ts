
"use client";

import { useState, useEffect, useCallback } from 'react';

export type FavouriteTrack = SpotifyApi.SingleTrackResponse;

const FAVOURITES_KEY = 'tunera_favourites';

export const useFavourites = () => {
  const [favourites, setFavourites] = useState<FavouriteTrack[]>([]);
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

  const saveFavourites = (items: FavouriteTrack[]) => {
    try {
      const item = JSON.stringify(items);
      window.localStorage.setItem(FAVOURITES_KEY, item);
    } catch (error) {
      console.error("Failed to save favourites to localStorage", error);
    }
  };

  const addFavourite = useCallback((track: FavouriteTrack) => {
    setFavourites((prev) => {
      const newFavourites = [...prev, track];
      saveFavourites(newFavourites);
      return newFavourites;
    });
  }, []);

  const removeFavourite = useCallback((trackId: string) => {
    setFavourites((prev) => {
      const newFavourites = prev.filter((fav) => fav.id !== trackId);
      saveFavourites(newFavourites);
      return newFavourites;
    });
  }, []);

  const isFavourite = useCallback((trackId: string) => {
    if (!isLoaded) return false;
    return favourites.some((fav) => fav.id === trackId);
  }, [favourites, isLoaded]);

  return { favourites, addFavourite, removeFavourite, isFavourite, isLoaded };
};
