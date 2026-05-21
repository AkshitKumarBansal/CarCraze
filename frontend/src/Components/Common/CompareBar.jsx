import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import './CompareBar.css';

/**
 * CompareBar — a sticky bottom tray that appears whenever the user
 * has 1+ cars in the compare list. Disappears when empty.
 */
const CompareBar = () => {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare, compareCount, maxCompare } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div className="compare-bar" id="compare-bar">
      {/* Left: cars */}
      <div className="compare-bar-cars">
        <span className="compare-bar-label">
          ⚖️ Compare ({compareCount}/{maxCompare})
        </span>
        <div className="compare-bar-slots">
          {compareList.map((car) => (
            <div key={car._id} className="compare-bar-slot">
              {car.images?.[0] ? (
                <img src={car.images[0]} alt={car.brand} className="compare-bar-thumb" />
              ) : (
                <div className="compare-bar-thumb compare-bar-thumb-placeholder">🚗</div>
              )}
              <span className="compare-bar-name">{car.brand} {car.model}</span>
              <button
                className="compare-bar-remove"
                onClick={() => removeFromCompare(car._id)}
                title="Remove"
                aria-label={`Remove ${car.brand} ${car.model}`}
              >
                ×
              </button>
            </div>
          ))}
          {/* Empty placeholder slots */}
          {Array.from({ length: maxCompare - compareCount }).map((_, i) => (
            <div key={`empty-${i}`} className="compare-bar-slot compare-bar-slot-empty">
              <div className="compare-bar-thumb compare-bar-thumb-empty">+</div>
              <span className="compare-bar-name compare-bar-name-empty">Add a car</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: actions */}
      <div className="compare-bar-actions">
        <button className="compare-bar-clear" onClick={clearCompare}>
          Clear All
        </button>
        <button
          className="compare-bar-cta"
          onClick={() => navigate('/compare')}
          disabled={compareCount < 2}
          title={compareCount < 2 ? 'Select at least 2 cars' : 'Compare now'}
        >
          Compare Now →
        </button>
      </div>
    </div>
  );
};

export default CompareBar;
