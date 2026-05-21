import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../Hooks/useToast';

const WishlistButton = ({ carId, className = '', size = 'md' }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [animating, setAnimating] = useState(false);

  const wishlisted = isWishlisted(carId);

  const sizeMap = {
    sm: { fontSize: '1.1rem', width: '30px', height: '30px' },
    md: { fontSize: '1.35rem', width: '38px', height: '38px' },
    lg: { fontSize: '1.7rem', width: '48px', height: '48px' },
  };
  const sz = sizeMap[size] || sizeMap.md;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/signin');
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);

    const result = await toggleWishlist(carId);
    if (result === true) toast.success('❤️ Added to Wishlist!');
    else if (result === false) toast.success('💔 Removed from Wishlist');
  };

  return (
    <button
      id={`wishlist-btn-${carId}`}
      onClick={handleClick}
      title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      style={{
        width: sz.width,
        height: sz.height,
        borderRadius: '50%',
        border: 'none',
        background: wishlisted ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        boxShadow: wishlisted
          ? '0 2px 12px rgba(239,68,68,0.25)'
          : '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: sz.fontSize,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.2s ease',
        transform: animating ? 'scale(1.35)' : 'scale(1)',
        flexShrink: 0,
      }}
      className={className}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  );
};

export default WishlistButton;
