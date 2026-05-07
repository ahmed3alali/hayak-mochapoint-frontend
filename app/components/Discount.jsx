"use client";
import { useLanguage } from '@/lib/LanguageContext';

export default function OffersSection() {
  const { t } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-4 md:py-8 pb-24 md:pb-32 bg-[#f5f5f5]">
      <h2 className="text-xl font-bold md:text-2xl md:font-normal text-[#2d2d2d] mb-5 text-right md:text-center">
        {t('discountOffers')}
      </h2>
      
      <div className="space-y-3 md:max-w-3xl md:mx-auto">
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between gap-3">
          <span className="text-3xl animate-bounce-slow">🍁</span>
          <div className="flex-1 text-right">
            <p className="text-[#2d2d2d] font-semibold text-sm mb-1">
              {t('discountHotDrinks')}
            </p>
            <p className="text-xs text-gray-400">{t('discountCode1')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between gap-3">
          <span className="text-3xl animate-bounce-slow animation-delay-500">🍂</span>
          <div className="flex-1 text-right">
            <p className="text-[#2d2d2d] font-semibold text-sm mb-1">
              {t('discountGift')}
            </p>
            <p className="text-xs text-gray-400">{t('discountCode2')}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </section>
  );
}