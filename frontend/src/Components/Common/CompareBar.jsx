import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';

/**
 * CompareBar — a sticky bottom tray that appears whenever the user
 * has 1+ cars in the compare list. Disappears when empty.
 */
const CompareBar = () => {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare, compareCount, maxCompare } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div 
      id="compare-bar"
      className="fixed bottom-0 left-0 right-0 z-[1500] bg-gradient-to-br from-slate-900 to-blue-900 text-white py-3 px-6 flex flex-wrap items-center justify-between gap-4 shadow-[0_-6px_30px_rgba(59,130,246,0.35)] border-t-2 border-blue-400/40"
    >
      {/* Left: cars */}
      <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
        <span className="font-bold text-sm whitespace-nowrap text-blue-200">
          ⚖️ Compare ({compareCount}/{maxCompare})
        </span>
        
        <div className="flex flex-wrap gap-3">
          {compareList.map((car) => (
            <div 
              key={car._id} 
              className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl py-1.5 pl-2 pr-3 relative min-w-[130px] max-w-[170px]"
            >
              {car.images?.[0] ? (
                <img src={car.images[0]} alt={car.brand} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-lg shrink-0 bg-white/10 flex items-center justify-center text-lg text-white/60">
                  🚗
                </div>
              )}
              <span className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-blue-100">
                {car.brand} {car.model}
              </span>
              <button
                className="bg-red-500/20 text-red-300 rounded-full w-5 h-5 flex items-center justify-center text-sm cursor-pointer shrink-0 transition-colors hover:bg-red-500/50"
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
            <div 
              key={`empty-${i}`} 
              className="flex items-center gap-2 bg-white/5 border border-white/20 border-dashed opacity-60 rounded-xl py-1.5 pl-2 pr-3 relative min-w-[130px] max-w-[170px]"
            >
              <div className="w-9 h-9 rounded-lg shrink-0 bg-white/5 flex items-center justify-center text-lg text-white/40">
                +
              </div>
              <span className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-white/40 italic">
                Add a car
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          className="bg-transparent border-2 border-white/30 text-white/80 rounded-lg py-2 px-4 text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/50 hover:text-white"
          onClick={clearCompare}
        >
          Clear All
        </button>
        <button
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg py-2 px-5 text-sm font-bold shadow-[0_3px_12px_rgba(59,130,246,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(59,130,246,0.55)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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