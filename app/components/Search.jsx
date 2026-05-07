"use client";

import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function UserSearchSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  return (
    <section className="bg-[#F5F5F5]  mt-4 md:mt-8">
      <div className="container mx-auto px-6 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:block mt-8">
          {/* Top Row: Avatar, User Info, Search - All in one line */}
          <div className="flex items-start justify-center gap-8">
            {/* Search */}
            <div className="flex-1 max-w-md w-full">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-right text-gray-600 placeholder:text-gray-400"
                />
                <Search className="h-5 w-5 text-[#231F20]" />
              </div>
              {/* Search Label aligned with search box */}
              <p className="text-xs text-gray-500 mt-2 text-right px-4">{t('searchHint')}</p>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Avatar, User Info, Menu */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1"></div>

            {/* Hamburger Menu - Left Side */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </button>
          </div>

          {/* Bottom Row: Search */}
          <div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-right text-gray-600 placeholder:text-gray-400 text-sm"
              />
              <Search className="h-5 w-5 text-[#231F20]" />
            </div>
            {/* Search Label aligned with search box */}
            <p className="text-xs text-gray-500 mt-2 text-right px-1.5">{t('searchHint')}</p>
          </div>
        </div>



      </div>
    </section>
  );
}