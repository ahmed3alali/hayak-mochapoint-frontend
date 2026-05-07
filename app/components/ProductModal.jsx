import { Plus, X, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { productSizesApi } from '@/lib/api';

/**
 * ProductModal Component
 * Displays product details including selectable size options with individual pricing.
 */
export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite
}) {
  const { lang, t } = useLanguage();
  const [sizes, setSizes]             = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loadingSizes, setLoadingSizes] = useState(true);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Fetch sizes for this product
  useEffect(() => {
    if (!product?.id) return;
    setLoadingSizes(true);
    productSizesApi.getPublicByProduct(product.id)
      .then(res => {
        const active = (res.data || []).filter(s => s.is_active);
        setSizes(active);
        if (active.length > 0) setSelectedSize(active[0]);
      })
      .catch((err) => {
        console.error("Failed to fetch product sizes:", err);
        setSizes([]);
      })
      .finally(() => setLoadingSizes(false));
  }, [product?.id]);

  if (!product) return null;

  // Effective price: selected size price OR product base price
  const displayPrice = selectedSize
    ? Number(selectedSize.price).toFixed(2)
    : Number(product.price).toFixed(2);

  // What gets added to cart
  const handleAddToCart = (e) => {
    const cartItem = selectedSize
      ? {
          ...product,
          price: Number(selectedSize.price),
          selectedSize: {
            id: selectedSize.id,
            name: lang === 'tr' && selectedSize.name_tr ? selectedSize.name_tr : selectedSize.name_ar,
          },
          // Unique cart key per product+size combo
          cartKey: `${product.id}-size-${selectedSize.id}`,
        }
      : product;
    onAddToCart(cartItem, e);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
        >
          <X className="h-5 w-5 text-[#3d2817]" />
        </button>

        {/* Favourite */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(product, e); }}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
        >
          <Heart className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden rounded-t-3xl bg-gray-100">
          <img
            src={product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee'}
            alt={product.name_ar}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="p-6" dir={lang === 'tr' ? 'ltr' : 'rtl'}>
          <h3 className="text-2xl font-bold text-[#3d2817] mb-1">
            {lang === 'tr' && product.name_tr ? product.name_tr : product.name_ar}
          </h3>
          <p className="text-sm text-[#6b4423] mb-4">{product.name_en}</p>

          {/* ── Size selector ── */}
          {!loadingSizes && sizes.length > 0 && (
            <div className="mb-5">
              <h4 className="text-base font-bold text-[#3d2817] mb-3">
                {lang === 'tr' ? 'Boyut Seçin' : 'اختر الحجم'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const isSelected = selectedSize?.id === size.id;
                  const label = lang === 'tr' && size.name_tr ? size.name_tr : size.name_ar;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        flex flex-col items-center px-4 py-2.5 rounded-2xl border-2 transition-all font-medium text-sm
                        ${isSelected
                          ? 'border-[#3d2817] bg-[#3d2817] text-white shadow-md scale-105'
                          : 'border-gray-200 bg-gray-50 text-[#3d2817] hover:border-[#3d2817]/50'}
                      `}
                    >
                      <span>{label}</span>
                      <span className={`text-xs mt-0.5 ${isSelected ? 'text-[#D5C69E]' : 'text-[#6b4423]'}`}>
                        ₺{Number(size.price).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <span className="text-3xl font-bold text-[#3d2817]">₺{displayPrice}</span>
              {selectedSize && (
                <p className="text-xs text-[#6b4423] mt-0.5">
                  {lang === 'tr' && selectedSize.name_tr ? selectedSize.name_tr : selectedSize.name_ar}
                </p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-full px-6 py-3 flex items-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span>{t('addToCart')}</span>
            </button>
          </div>

          {/* Ingredients */}
          {(product.ingredients || product.ingredients_tr) && (
            <div>
              <h4 className="text-lg font-bold text-[#3d2817] mb-3">{t('ingredients')}</h4>
              <div className="bg-[#f5f5f5] rounded-2xl p-4">
                <p className="text-[#6b4423] leading-relaxed">
                  {lang === 'tr' && product.ingredients_tr ? product.ingredients_tr : product.ingredients}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
