'use client';

import { useState, useEffect } from 'react';
import { Search, X, Plus, Heart } from 'lucide-react';
import Header from '@/app/components/Header';
import BottomBar from '@/components/Bar/BottomBar';
import { useCart } from '@/app/components/CartContext';
import { productsApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { t, lang } = useLanguage();

  useEffect(() => {
    productsApi.getPublic()
      .then((res) => {
        setAllProducts(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim() === '' 
    ? allProducts 
    : allProducts.filter(product => {
        const query = searchQuery.toLowerCase();
        const nameAr = product.name_ar?.toLowerCase() || '';
        const nameEn = product.name_en?.toLowerCase() || '';
        const nameTr = product.name_tr?.toLowerCase() || '';
        return nameAr.includes(query) || nameEn.includes(query) || nameTr.includes(query);
      });

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

  return (
    <>
      <div className={`min-h-screen bg-[#F5F5F5] pb-32 md:pb-0`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header categories={[]} />

        {/* Search Section */}
        <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-[#000000] mb-4 text-center">
                {t('searchPageTitle')}
              </h1>
              
              <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-3 shadow-sm">
                <input
                  type="text"
                  placeholder={t('searchPagePlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-right bg-transparent text-gray-800 placeholder:text-gray-400"
                  style={{ textAlign: lang === 'tr' ? 'left' : 'right' }}
                  autoFocus
                />
                <Search className="h-5 w-5 text-[#231F20]" />
              </div>
              
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2 text-right px-4" style={{ textAlign: lang === 'tr' ? 'left' : 'right' }}>
                  {filteredProducts.length} {t('searchResults')}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="py-20 text-center">{t('loadingText')}</div>
          ) : filteredProducts.length === 0 ? (
            // No results
            <div className="text-center py-20">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-xl font-bold text-gray-600 mb-2">
                {t('noResults')}
              </h2>
              <p className="text-gray-500">
                {t('tryDifferentWords')}
              </p>
            </div>
          ) : (
            // Results grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {/* Badge */}
                  {(product.badge || product.badge_tr) && (
                    <div className="absolute top-2 right-2 bg-[#3d2817]/90 text-white text-[10px] px-2 py-1 rounded-md z-10 shadow-sm">
                      {lang === 'tr' && product.badge_tr ? product.badge_tr : product.badge}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(product, e)}
                    className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-1.5 z-10 transition-all"
                  >
                    <Heart 
                      className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>

                  {/* Image */}
                  <div className="relative h-[140px] w-full overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee'}
                      alt={product.name_ar}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-[#3d2817] mb-1 truncate">
                      {lang === 'tr' && product.name_tr ? product.name_tr : product.name_ar}
                    </h3>
                    <p className="text-xs text-[#6b4423] mb-2 truncate">
                      {product.name_en || '\u00A0'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-[#3d2817]">
                        ₺{Number(product.price).toFixed(2)}
                      </span>
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-full h-7 w-7 flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal Popup */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scaleUp {
              from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
          <div 
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Close Button */}
            <button
               onClick={() => setSelectedProduct(null)}
              className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
            >
              <X className="h-5 w-5 text-[#3d2817]" />
            </button>

            {/* Favorite Button in Modal */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(selectedProduct, e);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
            >
              <Heart 
                className={`h-6 w-6 ${isFavorite(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>

            {/* Product Image */}
            <div className="relative h-64 w-full overflow-hidden rounded-t-3xl bg-gray-100">
              <img
                src={selectedProduct.image_url || 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee'}
                alt={selectedProduct.name_ar}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="p-6" dir={lang === 'tr' ? 'ltr' : 'rtl'}>
              <h3 className="text-2xl font-bold text-[#3d2817] mb-2">
                {lang === 'tr' && selectedProduct.name_tr ? selectedProduct.name_tr : selectedProduct.name_ar}
              </h3>
              <p className="text-sm text-[#6b4423] mb-4">
                {selectedProduct.name_en}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <span className="text-3xl font-bold text-[#3d2817]">
                  ₺{Number(selectedProduct.price).toFixed(2)}
                </span>
                <button 
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-full px-6 py-3 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('addToCart')}</span>
                </button>
              </div>

              {/* Ingredients */}
              {(selectedProduct.ingredients || selectedProduct.ingredients_tr) && (
                <div>
                  <h4 className="text-lg font-bold text-[#3d2817] mb-3">
                    {t('ingredients')}
                  </h4>
                  <div className="bg-[#f5f5f5] rounded-2xl p-4">
                    <p className="text-[#6b4423] leading-relaxed">
                      {lang === 'tr' && selectedProduct.ingredients_tr ? selectedProduct.ingredients_tr : selectedProduct.ingredients}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )} 
      <BottomBar/>
    </>
  );
}