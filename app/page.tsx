"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Phone, Search } from "lucide-react"
import { homeApi } from '@/lib/api';
import Header from '@/app/components/Header';
import HeroSlider from '@/app/components/Hero';
import CategoriesSection from '@/app/components/Categories';
import CategoryProducts from '@/app/components/CategoryProducts';
import OffersAndDailyPicks from '@/app/components/Offers';
import ReviewsSection from '@/app/components/Reviews';


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import BottomBar from '@/components/Bar/BottomBar';
import { useLanguage } from '@/lib/LanguageContext';


const categories = [
  { id: "coffee", label: "القهوة", icon: "☕" },
  { id: "juices", label: "العصائر", icon: "🥤" },
  { id: "v60", label: "V60", icon: "☕" },
  { id: "drinks", label: "المشروبات", icon: "🥤" },
  { id: "cake", label: "الكيك", icon: "🍰" },
]

const products = [
  {
    id: 1,
    name: "موكا بالكراميل",
    nameEn: "Mocha Caramel",
    price: 9.99,
    image: "/mocha-caramel-coffee-drink.jpg",
    category: "المشروبات",
  },
  {
    id: 2,
    name: "أمريكانو",
    nameEn: "Americano",
    price: 9.99,
    image: "/americano-coffee.png",
    category: "القهوة",
  },
]

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();
  const [homeData, setHomeData] = useState({
    heroSlides: [],
    offers: [],
    dailyPicks: [],
    categories: [],
    products: [],
    reviews: []
  });

  useEffect(() => {
    homeApi.getPublic()
      .then(res => {
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

        <HeroSlider data={homeData.heroSlides} />

        <OffersAndDailyPicks offers={homeData.offers} dailyPicks={homeData.dailyPicks} />

        <CategoriesSection categories={homeData.categories} />

        <CategoryProducts categories={homeData.categories} products={homeData.products} />

        {/* All items button for home page */}
        <div className="container mx-auto px-6 mb-8 mt-4 flex justify-center">
          <Link
            href="/menu"
            className="w-full max-w-md bg-[#3d2817] hover:bg-[#5a3f2a] text-[#D5C69E] py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center"
          >
            {t('allCategories')}
          </Link>
        </div>

        <ReviewsSection reviews={homeData.reviews} />

      </div>
      <BottomBar />
    </>

  );
};