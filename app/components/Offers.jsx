"use client";

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { offersApi, dailyPicksApi } from '@/lib/api';
import { useCart } from '@/app/components/CartContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function OffersAndDailyPicks({ offers = [], dailyPicks = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  
  const offerSlides = offers;

  // Auto-play للسلايدر
  useEffect(() => {
    if (offerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [offerSlides.length]);

  const handleAddToCart = (pick, e) => {
    e.stopPropagation();
    // Use the linked product if available, else create a generic cart item from the daily pick
    if (pick.product_id) {
      // In a full implementation, you'd fetch the product details here, 
      // but for now we create a mock cart item based on the pick
      addToCart({
        id: pick.product_id,
        name: pick.title,
        nameEn: '',
        price: pick.price, // Fallback, real price would be fetched
        image: 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
      });
    } else {
      addToCart({
        id: `pick-${pick.id}`,
        name: pick.title,
        nameEn: '',
        price: pick.price, // Assuming bundle price isn't directly on daily pick in current DB schema
        image: 'https://placehold.co/400x400/1e1e1e/D5C69E?text=Coffee',
      });
    }
  };

  if (offerSlides.length === 0 && dailyPicks.length === 0) return null;

  return (
    <section className="w-full bg-[#F5F5F5] py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 md:px-6">

        {/* MOBILE LAYOUT */}
        <div className="md:hidden">
          {/* Offers Slider - Mobile */}
          {offerSlides.length > 0 && (
            <div className="relative w-full mb-8">
              <h2 className="text-2xl font-normal text-[#000000] mb-4 px-2">
                {t('activeOffers')}
              </h2>

              <div className="relative w-full h-[200px] bg-white rounded-2xl overflow-hidden shadow-md">
                {offerSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : index < currentSlide
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                      }`}
                  >
                    <img
                      src={slide.image_url || 'https://placehold.co/800x400/1e1e1e/D5C69E?text=Offer'}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {offerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/70'
                        }`}
                      aria-label={`${t('ariaSlide')} ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Picks - Mobile */}
          {dailyPicks.length > 0 && (
            <div className="w-full">
              <h2 className="text-2xl font-normal text-[#000000] mb-4 px-2">
                {t('dailyPicks')}
              </h2>

              <div className="space-y-3">
                {dailyPicks.slice(0, 2).map((pick) => (
                  <div
                    key={pick.id}
                    className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-3xl">{pick.emoji || '✨'}</span>

                      <div className={`flex-1 ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                        <h3 className="text-base font-bold text-[#3d2817] leading-tight mb-1">
                          {lang === 'tr' && pick.title_tr ? pick.title_tr : pick.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {lang === 'tr' && pick.subtitle_tr ? pick.subtitle_tr : pick.subtitle}
                        </p>


                        <p className={`text-sm text-gray-500 mb-4 font-bold ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                          {pick.price}

                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleAddToCart(pick, e)}
                          className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-lg p-2 transition-all hover:scale-110"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:block">
          {/* Offers Slider - Desktop */}
          {offerSlides.length > 0 && (
            <div className="relative w-full mb-8">
              <h2 className="text-2xl font-normal text-[#000000] mb-5 text-center">
                {t('activeOffers')}
              </h2>

              <div className="relative w-full h-[400px] bg-white rounded-3xl overflow-hidden shadow-lg">
                {offerSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : index < currentSlide
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                      }`}
                  >
                    <img
                      src={slide.image_url || 'https://placehold.co/1200x400/1e1e1e/D5C69E?text=Offer'}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {offerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/70'
                        }`}
                      aria-label={`${t('ariaSlide')} ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Picks Desktop */}
          {dailyPicks.length > 0 && (
            <div className="w-full">
              <h2 className="text-2xl font-normal text-center text-[#000000] mb-5 px-6">
                {t('dailyPicks')}
              </h2>

              <div className="grid grid-cols-4 gap-4">
                {dailyPicks.map((pick) => (
                  <div
                    key={pick.id}
                    className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex justify-start mb-3">
                      <span className="text-4xl">{pick.emoji || '✨'}</span>
                    </div>

                    <h3 className={`text-base font-bold text-[#3d2817] mb-2 leading-tight ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                      {lang === 'tr' && pick.title_tr ? pick.title_tr : pick.title}
                    </h3>

                    <p className={`text-xs text-gray-500 mb-4 ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                      {lang === 'tr' && pick.subtitle_tr ? pick.subtitle_tr : pick.subtitle}
                    </p>

                    <p className={`text-sm text-gray-500 mb-4 font-bold ${lang === 'tr' ? 'text-left' : 'text-right'}`}>
                      {pick.price}
                    </p>


                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => handleAddToCart(pick, e)}
                        className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white rounded-lg p-2 transition-all hover:scale-110"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}