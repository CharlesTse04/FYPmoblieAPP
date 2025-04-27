// src/components/CustomLogo.jsx
import * as React from 'react';

function CustomLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="90" fill="blue" />
      <text x="20" y="25" fontSize="90" textAnchor="middle" fill="white">卡店</text>
    </svg>
  );
}

export default CustomLogo;