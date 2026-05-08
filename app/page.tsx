"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Phone, Search } from "lucide-react"
import { homeApi, getHomeDataCache } from '@/lib/api';
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
    nameAr: "موكا بالكراميل",
    price: "4.99",
    image: "/mocha-caramel-coffee-drink.jpg",
    category: "المشروبات",
  },
  {
    id: 2,
    nameAr: "أمريكانو",
    price: "3.50",
    image: "/americano-coffee.png",
    category: "القهوة",
  },
]

export default function HomePage() {
  const cachedData = getHomeDataCache();
  const [loading, setLoading] = useState(!cachedData);
  const { t, lang } = useLanguage();
  const [homeData, setHomeData] = useState(cachedData || {
    heroSlides: [],
    offers: [],
    dailyPicks: [],
    categories: [],
    products: [],
    reviews: []
  });

  useEffect(() => {
    if (cachedData && !loading) {
      // Just in case we want background refresh later, but for now we skip loading
      setLoading(false);
    }
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

        <CategoriesSection categories={homeData.categories} />

        <OffersAndDailyPicks offers={homeData.offers} dailyPicks={homeData.dailyPicks} />

        <ReviewsSection reviews={homeData.reviews} />

      </div>
      <BottomBar />
    </>

  );
};