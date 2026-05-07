'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { useLanguage } from '@/lib/LanguageContext';

// Reusable component for a single category section
function CategorySection({ title, products, sectionId, onSelectProduct }) {
  const scrollRef = useRef(null);
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { t, lang } = useLanguage();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || '',
      price: product.price,
      image: product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
      selectedSize: product.selectedSize,
      cartKey: product.cartKey,
    });
  };

  const handleToggleFavorite = (product, e) => {
    e?.stopPropagation();
    toggleFavorite({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || '',
      price: product.price,
      image: product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full py-4 scroll-mt-20" id={sectionId}>
      {/* Title */}
      <h2 className={`text-2xl font-normal text-[#000000] px-6 md:px-21 mb-4 ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
        {title}
      </h2>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="overflow-x-auto scrollbar-hide px-4 pb-4">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isMobile={true}
                onClick={() => onSelectProduct(p)}
                onAddToCart={(e) => handleAddToCart(p, e)}
                onToggleFavorite={(e) => handleToggleFavorite(p, e)}
                isFavorite={isFavorite(p.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="relative w-full">
          <div className="flex items-center gap-4 px-4">
            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="flex-shrink-0 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label={t('ariaNext')}
            >
              <ChevronRight className="h-6 w-6 text-[#3d2817]" />
            </button>

            {/* Products Container */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-auto pb-4"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none !important;
                }
              `}</style>
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isMobile={false}
                    onClick={() => onSelectProduct(p)}
                    onAddToCart={(e) => handleAddToCart(p, e)}
                    onToggleFavorite={(e) => handleToggleFavorite(p, e)}
                    isFavorite={isFavorite(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="flex-shrink-0 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
              aria-label={t('ariaPrev')}
            >
              <ChevronLeft className="h-6 w-6 text-[#3d2817]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component - Dynamic Sections
export default function CategoryProducts({ categories = [], products = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { lang, t } = useLanguage();

  const { addToCart, toggleFavorite, isFavorite } = useCart();

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || '',
      price: product.price,
      image: product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
      selectedSize: product.selectedSize,
      cartKey: product.cartKey,
    });
  };

  const handleToggleFavorite = (product, e) => {
    e?.stopPropagation();
    toggleFavorite({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || '',
      price: product.price,
      image: product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
    });
  };

  return (
    <>
      <section className="w-full bg-[#f5f5f5]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>

        {/* Render a section for each category that has products */}
        {categories.map(cat => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <CategorySection
              key={cat.id}
              title={lang === 'tr' && cat.name_tr ? cat.name_tr : cat.name_ar}
              products={catProducts}
              sectionId={`cat-${cat.id}`}
              onSelectProduct={setSelectedProduct}
            />
          );
        })}

        {/* Render products without a category if any */}
        {(() => {
          const uncategorized = products.filter(p => !p.category_id);
          if (uncategorized.length === 0) return null;
          return (
            <CategorySection
              key="uncategorized"
              title={t('otherProducts')}
              products={uncategorized}
              sectionId="cat-other"
              onSelectProduct={setSelectedProduct}
            />
          );
        })()}
      </section>

      {/* Reusable Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
      />
    </>
  );
}