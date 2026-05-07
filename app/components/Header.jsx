'use client';

import { ShoppingCart, Heart, MessageCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

// Button Component
const Button = ({ variant = "default", size = "default", className = "", children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center transition-colors";
  const variantStyles = variant === "ghost" ? "hover:bg-black/5" : "";
  const sizeStyles = size === "icon" ? "h-10 w-10" : "px-4 py-2";

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function Header({ categories: propCategories }) {
  const { cartCount, favoritesCount } = useCart();
  const [categories, setCategories] = useState(propCategories || []);
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    if (!propCategories || propCategories.length === 0) {
      categoriesApi.getPublic()
        .then(res => setCategories(res.data))
        .catch(console.error);
    } else {
      setCategories(propCategories);
    }
  }, [propCategories]);

  const menuItems = [
    { name: t('home'), href: '/' },
    { name: t('fullMenu'), href: '/menu' },
    ...categories.slice(0, 4).map(c => ({
      name: lang === 'tr' && c.name_tr ? c.name_tr : c.name_ar,
      href: `/menu#cat-${c.id}`
    }))
  ];

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'tr' : 'ar');
  };

  return (
    <>
      <header className="bg-[#D5C69E] fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-5 py-3">

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto">

            {/* Logo & Icons */}
            <div className="flex items-center gap-3 mr-5">
              <a href="/" className="w-[50px] h-[50px] relative block">
                <img
                  src="logo.webp"
                  alt="Mocha Point Logo"
                  width={360}
                  height={37}
                  className="object-contain"
                />
              </a>

              {/* Favorites Button with Badge */}
              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#3d2817] hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-full relative"
                >
                  <Heart className="h-6 w-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart Button with Badge */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#3d2817] hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-full relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[#3d2817] font-medium hover:text-[#5a3f2a] transition-colors duration-200 text-base"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Contact Us & Language Buttons */}
            <div className="flex items-center gap-2 ml-5">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="bg-white/50 text-[#3d2817] rounded-full px-3 py-1 hover:bg-white flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{lang === 'ar' ? '🇹🇷 TR' : '🇸🇦 AR'}</span>
              </Button>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  className="bg-white text-[#3d2817] rounded-full px-3 py-1 hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('contactUs')}</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between">
            {/* Logo & Icons  */}
            <div className="flex items-center gap-3">
              <a href="/" className="w-[32px] h-[32px] relative block">
                <img
                  src="logo.webp"
                  alt="Mocha Point Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </a>

              {/* Favorites Button with Badge - Mobile */}
              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#3d2817] hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-full relative"
                >
                  <Heart className="h-6 w-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart Button with Badge - Mobile */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#3d2817] hover:bg-white/40 hover:scale-110 transition-all duration-200 rounded-full relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Contact Us & Language Buttons - Mobile */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="bg-white/50 text-[#3d2817] rounded-full hover:bg-white flex items-center justify-center w-8 h-8"
              >
                <span className="text-xs font-bold">{lang === 'ar' ? 'TR' : 'AR'}</span>
              </Button>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  className="bg-white text-[#3d2817] rounded-full px-3 py-1 hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('contactUs')}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[62px]" />
    </>
  );
}