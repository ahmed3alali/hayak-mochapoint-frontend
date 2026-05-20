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
    <div className="min-h-screen bg-[#070a13] text-[#cbd5e1] flex selection:bg-[#312e81] selection:text-[#38bdf8]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sleek midnight cyber glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-[#6366f1]/6 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-[#06b6d4]/6 rounded-full blur-[160px]" />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} h-full w-64 bg-[#0b0f19]/85 backdrop-blur-xl border-slate-800/40 z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/40 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/20 group transition-all duration-300 hover:scale-105">
            <Coffee className="w-5 h-5 text-[#38bdf8] transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">{t('mochaPoint')}</p>
            <p className="text-[10px] text-[#38bdf8] uppercase tracking-widest font-semibold">{t('adminPanel')}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
          {navItemsConfig.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group
                  ${active
                    ? `bg-[#6366f1]/10 text-[#38bdf8] border border-[#6366f1]/20 shadow-md shadow-indigo-950/20`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}`}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className={`absolute top-1/4 bottom-1/4 w-1 bg-[#38bdf8] rounded-full ${lang === 'ar' ? 'left-1' : 'right-1'}`} />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#38bdf8]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="tracking-wide">{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="mt-auto p-4 border-t border-slate-800/40 bg-[#090d16] flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3 bg-slate-900/40 rounded-xl border border-slate-800/30">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] flex items-center justify-center text-xs font-bold text-[#38bdf8] flex-shrink-0 border border-indigo-500/20">
              {adminEmail?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate" title={adminEmail || 'Admin'}>{adminEmail || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">{t('systemAdmin')}</p>
            </div>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl text-xs font-medium text-slate-400 hover:text-[#38bdf8] hover:bg-slate-800/20 border border-transparent hover:border-[#6366f1]/20 transition-all duration-300"
          >
            <Globe className="w-4 h-4 flex-shrink-0 text-slate-500" />
            <span>{lang === 'ar' ? 'Türkçe\'ye Geç' : 'التبديل للعربية'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-red-400/70" />
            <span>{t('logout')}</span>
          </button>

          <div className="mt-4 pt-4 border-t border-slate-800/40 text-center">
            <p className="text-[9px] text-slate-600 leading-relaxed uppercase tracking-wider">
              {t('programmedBy')}
            </p>
            <a
              href="https://www.masarsy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#38bdf8]/60 hover:text-[#38bdf8] transition-colors font-medium tracking-wide mt-0.5 inline-block"
            >
              {t('masarAgency')}
            </a>
            <div className="mt-2.5">
              <a
                href="https://wa.me/963939805719"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-green-500/[0.02] border border-green-500/10 rounded-full text-[9px] text-green-400/60 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current flex-shrink-0 text-green-400/80">
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
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0b0f19]/85 backdrop-blur-xl border-b border-slate-800/40">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/20 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-[#38bdf8] tracking-wide">Mocha Point Admin</span>
          <div className="w-7" />
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
