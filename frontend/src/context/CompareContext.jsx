import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '../Hooks/useToast';

const CompareContext = createContext(null);

const MAX_COMPARE = 4;

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]); // array of full car objects
  const toast = useToast();

  const isInCompare = useCallback(
    (carId) => compareList.some((c) => c._id === carId),
    [compareList]
  );

  const addToCompare = useCallback(
    (car) => {
      if (isInCompare(car._id)) {
        toast.info('This car is already in your comparison list.');
        return;
      }
      if (compareList.length >= MAX_COMPARE) {
        toast.warning(`⚠️ You can compare up to ${MAX_COMPARE} cars at a time.`);
        return;
      }
      setCompareList((prev) => [...prev, car]);
      toast.success(`✅ ${car.brand} ${car.model} added to compare!`);
    },
    [compareList, isInCompare, toast]
  );

  const removeFromCompare = useCallback((carId) => {
    setCompareList((prev) => prev.filter((c) => c._id !== carId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        isInCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
        compareCount: compareList.length,
        maxCompare: MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
};
