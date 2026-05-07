import { Plus, Heart } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * ProductCard Component
 * @param {Object} props
 * @param {Object} props.product - The product object from the API
 * @param {Function} props.onClick - Handler for clicking the card (opens modal)
 * @param {Function} props.onAddToCart - Handler for adding to cart
 * @param {Function} props.onToggleFavorite - Handler for toggling favorite status
 * @param {boolean} props.isFavorite - Whether the product is currently favorited
 * @param {boolean} [props.isMobile=false] - If true, renders a narrower card suitable for mobile scrolling
 */
export default function ProductCard({ 
  product, 
  onClick, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite, 
  isMobile = false 
}) {
  const cardWidth = isMobile ? '160px' : '280px';
  const imgHeight = isMobile ? 'h-[120px]' : 'h-[200px]';
  const { lang } = useLanguage();

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
      style={{ width: cardWidth, minWidth: cardWidth }}
    >
      {/* Badge - show category name or custom badge */}
      {(product.badge || product.badge_tr || product.category_name) && (
        <div className={`absolute ${isMobile ? 'top-2 right-2 text-[10px]' : 'top-3 right-3 text-xs'} bg-[#3d2817]/90 text-white px-2 py-1 rounded-md z-10 shadow-sm`}>
          {lang === 'tr'
            ? (product?.badge_tr )
            : (product.badge )}
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={onToggleFavorite}
        className={`absolute ${isMobile ? 'top-2 left-2 p-1.5' : 'top-3 left-3 p-2'} bg-white/90 hover:bg-white rounded-full z-10 transition-all`}
        aria-label="Toggle favorite"
      >
        <Heart 
          className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </button>

      {/* Image */}
      <div className={`relative ${imgHeight} w-full overflow-hidden bg-gray-100`}>
        <img
          src={product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee'}
          alt={product.name_ar}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className={isMobile ? 'p-3' : 'p-4'}>
        <h3 className={`${isMobile ? 'text-sm mb-1 truncate' : 'text-lg mb-1'} font-bold text-[#3d2817]`}>
          {lang === 'tr' && product.name_tr ? product.name_tr : product.name_ar}
        </h3>
        
   
        <div className={`flex items-center justify-between ${isMobile ? 'mt-2' : ''}`}>
          <span className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-[#3d2817]`}>
            ₺{Number(product.price).toFixed(2)}
          </span>
          <button 
            onClick={onAddToCart}
            className={`bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-full ${isMobile ? 'h-7 w-7' : 'h-10 w-10'} flex items-center justify-center transition-all hover:scale-110`}
            aria-label="Add to cart"
          >
            <Plus className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        </div>
      </div>
    </div>
  );
}
