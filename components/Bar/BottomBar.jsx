'use client';
import { User, Search, Utensils, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/lib/LanguageContext';

export default function BottomBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', icon: Home, labelKey: 'bottomHome' },
    { href: '/menu', icon: Utensils, labelKey: 'bottomMenu' },
    { href: '/search', icon: Search, labelKey: 'bottomSearch' },
    { href: '/profile', icon: User, labelKey: 'bottomAccount' },
  ];

  return (
    <>
      <div className="h-24 md:hidden"></div> {/* Spacere to prevent content overlapping */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1b1b1b]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-full z-50 md:hidden pb-safe">
        <div className="flex items-center justify-between px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="relative flex-1">
                <button className="w-full flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300 relative group">
                  {/* Active Indicator Background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#D5C69E]/20 rounded-full scale-100 transition-transform duration-300"></div>
                  )}
                  
                  <Icon 
                    className={`w-6 h-6 z-10 transition-all duration-300 ${
                      isActive 
                        ? 'text-[#D5C69E] scale-110 drop-shadow-md' 
                        : 'text-white/40 group-hover:text-white/80 group-hover:scale-110'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  
                  <span className={`text-[10px] font-bold z-10 transition-all duration-300 ${
                    isActive ? 'text-[#D5C69E] opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                  }`}>
                    {t(item.labelKey)}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
