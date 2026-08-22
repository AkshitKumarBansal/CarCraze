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

  // Map exact dimensions to Tailwind arbitrary values
  const sizeMap = {
    sm: 'text-[1.1rem] w-[30px] h-[30px]',
    md: 'text-[1.35rem] w-[38px] h-[38px]',
    lg: 'text-[1.7rem] w-[48px] h-[48px]',
  };
  const szClass = sizeMap[size] || sizeMap.md;

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
      className={`
        flex items-center justify-center shrink-0 rounded-full cursor-pointer backdrop-blur-sm
        transition-all duration-200 ease-out border-none
        ${szClass}
        ${wishlisted 
          ? 'bg-red-500/15 shadow-[0_2px_12px_rgba(239,68,68,0.25)]' 
          : 'bg-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white'
        }
        ${animating ? 'scale-[1.35]' : 'scale-100'}
        ${className}
      `}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  );
};

export default WishlistButton;