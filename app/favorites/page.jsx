'use client';

import { Heart, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import BottomBar from '@/components/Bar/BottomBar';
import { useCart } from '@/app/components/CartContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart } = useCart();
  const { t, lang } = useLanguage();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <>
      <div className={`min-h-screen bg-[#F5F5F5]`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header />

        <section className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-[#3d2817] mb-6">
            {t('favorites')}
          </h1>

          {favorites.length === 0 ? (
            // Empty Favorites
            <div className="text-center py-20">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">
                {t('noFavorites')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('startAddFavorites')}
              </p>
              <Link href="/">
                <button className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white px-8 py-3 rounded-full font-medium transition-all">
                  {t('browseProducts')}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-[#3d2817]/90 text-white text-[10px] px-2 py-1 rounded-md z-10 shadow-sm">
                    {product.badge}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 z-10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Image */}
                  <div className="relative h-[140px] w-full overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-[#3d2817] mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#6b4423] mb-2 truncate">
                      {product.nameEn}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-[#3d2817]">
                        ₺{product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
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

      <BottomBar />
    </>
  );
}