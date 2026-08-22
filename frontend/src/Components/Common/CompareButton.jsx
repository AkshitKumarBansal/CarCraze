import React from 'react';
import { useCompare } from '../../context/CompareContext';

/**
 * CompareButton — small toggle button to add/remove a car from the comparison tray.
 * Pass the full `car` object so it can be stored in context.
 */
const CompareButton = ({ car, size = 'sm' }) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  if (!car?._id) return null;

  const active = isInCompare(car._id);

  // Map sizes to Tailwind classes
  const sizeMap = {
    sm: 'text-xs py-1 px-3',
    md: 'text-sm py-1.5 px-4',
  };
  const szClass = sizeMap[size] || sizeMap.sm;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      removeFromCompare(car._id);
    } else {
      addToCompare(car);
    }
  };

  return (
    <button
      id={`compare-btn-${car._id}`}
      onClick={handleClick}
      title={active ? 'Remove from comparison' : 'Add to comparison'}
      aria-pressed={active}
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap backdrop-blur-sm
        ${szClass}
        ${active 
          ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_2px_10px_rgba(59,130,246,0.4)]' 
          : 'border-2 border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-600'
        }
      `}
    >
      {active ? '✓ Comparing' : '⚖️ Compare'}
    </button>
  );
};

export default CompareButton;