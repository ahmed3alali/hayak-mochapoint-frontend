"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function CategoriesSection({ categories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { lang, t } = useLanguage();

  return (
    <section className="bg-[#F5F5F5] py-6">
      <div className="container mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <h2 className="text-2xl font-normal text-[#000000] mb-4 text-right px-5">
            {t('categories')}
          </h2>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 px-6 snap-x snap-mandatory scrollbar-hide">
            {categories.map((cat) => (
              <Link
                href={`/menu#cat-${cat.id}`}
                key={cat.id}
                className="min-w-[85px] flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer snap-start group"
              >
                <div className="w-14 h-14 rounded-full bg-[#1b1b1b] flex items-center justify-center overflow-hidden group-hover:bg-[#3d2817] transition-colors duration-300 text-3xl">
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
        <div className="hidden md:flex flex-col items-center px-4 mt-5">
          <h2 className="text-2xl font-bold text-[#000000] mb-6">
            {t('categories')}
          </h2>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {categories.map((cat) => (
              <Link
                href={`/menu#cat-${cat.id}`}
                key={cat.id}
                className="w-[100px] flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-[#1b1b1b] flex items-center justify-center overflow-hidden group-hover:bg-[#3d2817] group-hover:rotate-12 transition-all duration-300 text-4xl">
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
  );
}