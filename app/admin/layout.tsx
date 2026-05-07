'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Star, LogOut, Menu, X, Coffee, Image as ImageIcon, MessageSquare, Phone, ShoppingBag, Globe
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const navItemsConfig = [
  { href: '/admin/dashboard',            labelKey: 'dashboard',  icon: LayoutDashboard },
  { href: '/admin/dashboard/products',   labelKey: 'products',   icon: Package        },
  { href: '/admin/dashboard/categories', labelKey: 'categories', icon: Tag            },
  { href: '/admin/dashboard/offers',     labelKey: 'offers',     icon: Star           },
  { href: '/admin/dashboard/slides',     labelKey: 'slides',     icon: ImageIcon      },
  { href: '/admin/dashboard/reviews',    labelKey: 'reviews',    icon: MessageSquare  },
  { href: '/admin/dashboard/orders',     labelKey: 'orders',     icon: ShoppingBag    },
  { href: '/admin/dashboard/contact',    labelKey: 'contact',    icon: Phone          },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail]   = useState('');
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    let token = null;
    let mail = '';
    const tokenMatch = document.cookie.match(new RegExp('(^| )admin_access_token=([^;]+)'));
    if (tokenMatch) token = tokenMatch[2];
    
    if (!token) { router.replace('/admin/login'); return; }
    
    const mailMatch = document.cookie.match(new RegExp('(^| )admin_email=([^;]+)'));
    if (mailMatch) mail = decodeURIComponent(mailMatch[2]);
    
    setAdminEmail(mail);
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = () => {
    document.cookie = 'admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.replace('/admin/login');
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'tr' : 'ar');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} h-full w-64 bg-[#141414] border-white/5 z-30 transform transition-transform duration-300 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3d2817] to-[#6b4423] rounded-xl flex items-center justify-center">
            <Coffee className="w-5 h-5 text-[#D5C69E]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#D5C69E]">{t('mochaPoint')}</p>
            <p className="text-[10px] text-white/40">{t('adminPanel')}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItemsConfig.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? `bg-gradient-to-${lang === 'ar' ? 'l' : 'r'} from-[#3d2817] to-[#5a3a22] text-[#D5C69E] shadow-lg`
                    : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="mt-auto p-4 border-t border-white/5 bg-[#141414] flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3d2817] to-[#6b4423] flex items-center justify-center text-xs font-bold text-[#D5C69E] flex-shrink-0">
              {adminEmail?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 truncate" title={adminEmail || 'Admin'}>{adminEmail || 'Admin'}</p>
              <p className="text-[10px] text-white/30">{t('systemAdmin')}</p>
            </div>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-2 px-4 py-2 mb-2 rounded-xl text-sm text-white/70 hover:bg-white/5 transition-all"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>{lang === 'ar' ? 'Türkçe\'ye Geç' : 'التبديل للعربية'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{t('logout')}</span>
          </button>

          <div className="mt-3 pt-3 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 leading-relaxed">
              {t('programmedBy')}
            </p>
            <a
              href="https://www.masarsy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#D5C69E]/40 hover:text-[#D5C69E]/70 transition-colors font-medium"
            >
              {t('masarAgency')}
            </a>
            <div className="mt-2">
              <a
                href="https://wa.me/963939805719"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[10px] text-green-500/40 hover:text-green-400/70 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.882l6.198-1.45A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.944 0-3.757-.528-5.3-1.444l-.38-.225-3.678.861.894-3.575-.248-.389A9.789 9.789 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                {t('techSupport')}
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#141414] border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-[#D5C69E]">Mocha Point Admin</span>
          <div className="w-5" />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
