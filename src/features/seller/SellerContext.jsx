import React, { createContext, useContext } from 'react';

const SellerContext = createContext(null);

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};

export const SellerProvider = ({ children, value }) => {
  return (
    <SellerContext.Provider value={value}>
      {children}
    </SellerContext.Provider>
  );
};
