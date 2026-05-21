import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistCars, setWishlistCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'customer') {
      setWishlistIds(new Set());
      setWishlistCars([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.WISHLIST, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const cars = Array.isArray(data.wishlist) ? data.wishlist : [];
        setWishlistCars(cars);
        setWishlistIds(new Set(cars.map(c => c._id)));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (carId) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.WISHLIST}/${carId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.wishlisted) {
          setWishlistIds(prev => new Set([...prev, carId]));
        } else {
          setWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(carId);
            return next;
          });
          setWishlistCars(prev => prev.filter(c => c._id !== carId));
        }
        return data.wishlisted;
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
    return null;
  }, []);

  const isWishlisted = useCallback((carId) => wishlistIds.has(carId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      wishlistCars,
      loading,
      toggleWishlist,
      isWishlisted,
      fetchWishlist,
      wishlistCount: wishlistIds.size
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
