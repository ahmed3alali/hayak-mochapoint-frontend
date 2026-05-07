"use client"
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import CategoryProducts from '@/app/components/CategoryProducts';
import OffersAndDailyPicks from '@/app/components/Offers';
import ReviewsSection from '@/app/components/Reviews';
import BottomBar from '@/components/Bar/BottomBar';
import { homeApi } from '@/lib/api';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();
  const [homeData, setHomeData] = useState({
    categories: [],
    products: [],
    offers: [],
    dailyPicks: [],
    reviews: []
  });

  useEffect(() => {
    homeApi.getPublic()
      .then((res: any) => {
        setHomeData(res.data || res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mp-loader-overlay">
        <div className="mp-loader-card">
          <div className="mp-logo-wrap">
            <span className="mp-ring mp-ring-1" />
            <span className="mp-ring mp-ring-2" />
            <img src="/mochapoint-logo.svg" alt="Mocha Point" width={88} height={88} className="mp-logo-img" />
          </div>
          <p className="mp-brand">Mocha Point</p>
          <div className="mp-dots">
            <span className="mp-dot" />
            <span className="mp-dot" />
            <span className="mp-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`min-h-screen bg-[#f5f5f5] pb-32 md:pb-0`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header categories={homeData.categories} />
      
      {/* Categories */}
      <div className="bg-[#faf7f3]">
        <section className="bg-[#F5F5F5] py-2"> 
          <div className="container mx-auto">
            {/* Mobile Layout */}
            <div className="md:hidden">
              <h2 className="text-2xl font-normal text-[#000000] mb-4 text-right px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: lang === 'tr' ? 'left' : 'right' }}> 
                {t('ourMenu')}
              </h2>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-3 px-6 snap-x snap-mandatory scrollbar-hide">
                {homeData.categories.map((cat: any) => (
                  <Link
                    href={`#cat-${cat.id}`}
                    key={cat.id}
                    className="min-w-[85px] flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer snap-start group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#1b1b1b] flex items-center justify-center overflow-hidden text-3xl group-hover:bg-[#3d2817] transition-colors duration-300">
                      {cat.icon && cat.icon.startsWith('http') ? (
                        <img src={cat.icon} alt={cat.name_ar} className="w-full h-full object-cover" />
                      ) : (
                        cat.icon || '☕'
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#3d2817] group-hover:text-[#1b1b1b] transition-colors duration-300">
                      {lang === 'tr' && cat.name_tr ? cat.name_tr : cat.name_ar}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-col items-center px-4 mt-5 mb-10">
              <h2 className="text-2xl font-normal  text-[#000000] mb-5">
                {t('ourMenu')}
              </h2>
              
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {homeData.categories.map((cat: any) => (
                  <Link
                    href={`#cat-${cat.id}`}
                    key={cat.id}
                    className="w-[100px] flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#1b1b1b] flex items-center justify-center overflow-hidden text-4xl group-hover:bg-[#3d2817] group-hover:rotate-12 transition-all duration-300">
                      {cat.icon && cat.icon.startsWith('http') ? (
                        <img src={cat.icon} alt={cat.name_ar} className="w-full h-full object-cover" />
                      ) : (
                        cat.icon || '☕'
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#3d2817] group-hover:text-[#1b1b1b] transition-colors duration-300">
                      {lang === 'tr' && cat.name_tr ? cat.name_tr : cat.name_ar}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </section>

        <CategoryProducts categories={homeData.categories} products={homeData.products} />
        <OffersAndDailyPicks offers={homeData.offers} dailyPicks={homeData.dailyPicks} />
        <ReviewsSection reviews={homeData.reviews} />
      </div>

      <BottomBar/>
    </div>
    </>
  )
}
