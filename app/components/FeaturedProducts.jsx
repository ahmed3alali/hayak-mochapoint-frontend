'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Link from "next/link";
import { useCart } from '@/app/components/CartContext';
import { productsApi } from '@/lib/api';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { useLanguage } from '@/lib/LanguageContext';

export default function FeaturedProducts() {
  const scrollRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { t, lang } = useLanguage();

  useEffect(() => {
    productsApi.getPublic()
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="py-20 text-center">{t('loadingText')}</div>;
  if (products.length === 0) return null;

  return (
    <>
      <section className="w-full bg-[#f5f5f5] py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="overflow-x-auto scrollbar-hide px-4 pb-4">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isMobile={true}
                  onClick={() => setSelectedProduct(p)}
                  onAddToCart={(e) => handleAddToCart(p, e)}
                  onToggleFavorite={(e) => handleToggleFavorite(p, e)}
                  isFavorite={isFavorite(p.id)}
                />
              ))}
            </div>
          </div>

          {/* All items button */}
          <div className="px-4 mt-4">
            <Link href="/menu">
              <button className="w-full bg-[#3d2817] hover:bg-[#5a3f2a] text-white py-3 rounded-2xl font-medium transition-all hover:shadow-lg">
                {t('allCategories')}
              </button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="relative w-full">
            <div className="flex items-center gap-4 px-8">
              {/* Right Arrow */}
              <button
                onClick={() => scroll('right')}
                className="flex-shrink-0 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110 z-10"
                aria-label={t('ariaNext')}
              >
                <ChevronRight className="h-6 w-6 text-[#3d2817]" />
              </button>

              {/* Products Container */}
              <div ref={scrollRef} className="flex-1 overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isMobile={false}
                      onClick={() => setSelectedProduct(p)}
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

            {/* All items button */}
            <div className="mt-8 px-8">
              <Link href="/menu">
                <button className="w-full max-w-md mx-auto block bg-[#3d2817] hover:bg-[#5a3f2a] text-white py-4 rounded-2xl font-medium text-lg transition-all hover:shadow-lg">
                  {t('allCategories')}
                </button>
              </Link>
            </div>
          </div>
        </div>
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