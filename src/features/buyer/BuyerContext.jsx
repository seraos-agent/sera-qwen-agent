import React, { createContext, useContext } from 'react';

const BuyerContext = createContext(null);

export const BuyerProvider = ({ children, value }) => {
  return (
    <BuyerContext.Provider value={value}>
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyerContext = () => {
  const ctx = useContext(BuyerContext);
  if (!ctx) {
    throw new Error('useBuyerContext must be used within a BuyerProvider');
  }
  return ctx;
};
