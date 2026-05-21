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

  const sizeMap = {
    sm: { fontSize: '0.7rem', padding: '0.28rem 0.6rem', borderRadius: '20px' },
    md: { fontSize: '0.82rem', padding: '0.4rem 0.9rem', borderRadius: '20px' },
  };
  const sz = sizeMap[size] || sizeMap.sm;

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
      style={{
        ...sz,
        border: active ? '1.5px solid #6366f1' : '1.5px solid #d1d5db',
        background: active
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : 'rgba(255,255,255,0.9)',
        color: active ? '#fff' : '#374151',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        boxShadow: active ? '0 2px 10px rgba(99,102,241,0.35)' : '0 1px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(6px)',
      }}
    >
      {active ? '✓ Comparing' : '⚖️ Compare'}
    </button>
  );
};

export default CompareButton;
