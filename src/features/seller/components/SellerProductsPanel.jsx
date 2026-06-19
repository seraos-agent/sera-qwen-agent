import React from 'react';
import { useSeller } from '../SellerContext';
import { ProductsTab } from './panels/ProductsTab';
import { PromotionsTab } from './panels/PromotionsTab';

export const SellerProductsPanel = () => {
  const { activeNav } = useSeller();
  return (
    <>
      <ProductsTab />
      <PromotionsTab />
    </>
  );
};
