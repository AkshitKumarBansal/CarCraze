import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ImageModal = ({ src, alt, onClose }) => {
  useEffect(() => {
    // add modal-open to body while mounted
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900, width: '90%', maxHeight: '80vh', padding: 12, borderRadius: 8, background: 'transparent', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: 'calc(80vh - 40px)', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
