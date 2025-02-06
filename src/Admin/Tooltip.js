// Tooltip.jsx
import React from 'react';

const Tooltip = ({ text }) => {
  return (
    <div className="absolute bottom-full mb-2 left-1/3 transform -translate-x-1 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
      {text}
    </div>
  );
};

export default Tooltip;
