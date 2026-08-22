import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ImageModal = ({ src, alt, onClose }) => {
  useEffect(() => {
    // Prevent background scrolling using Tailwind's built-in utility class
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity" 
      onClick={onClose}
    >
      <div 
        className="w-[90%] max-w-[900px] max-h-[85vh] p-3 rounded-lg bg-transparent flex flex-col gap-2" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button 
            className="bg-white/20 hover:bg-white/30 text-white font-medium px-5 py-2 rounded-lg backdrop-blur-md transition-colors shadow-lg cursor-pointer" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[calc(85vh-70px)] object-contain rounded-lg shadow-2xl" 
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;