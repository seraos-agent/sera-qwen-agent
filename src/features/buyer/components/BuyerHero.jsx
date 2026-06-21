import React from 'react';
import { useBuyerContext } from '../BuyerContext';

export const BuyerHero = () => {
  const { isDarkMode } = useBuyerContext();

  return (
    <div style={{ width: '100%', marginBottom: 24 }}>
      <div style={{
        width: '100%',
        background: isDarkMode ? '#0f0f10' : '#fff',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <img
          src="/buyer-hero.jpg"
          alt="Start Shopping Powered by AI"
          style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block', margin: '0 auto' }}
        />
      </div>
    </div>
  );
};
