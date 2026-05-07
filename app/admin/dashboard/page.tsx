'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tag, Star, Clock, User, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

interface Stats { products: number; categories: number; offers: number; }
interface AuditEntry { id: number; user_email: string; action: string; entity: string; created_at: string; }

function StatCard({ icon: Icon, label, value, color, href }: any) {
  return (
    <Link href={href}
      className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-[#D5C69E]/20 hover:bg-[#1a1a1a] transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-white/40 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value ?? '—'}</p>
      </div>
      <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-[#D5C69E]/60 mr-auto transition-colors" />
    </Link>
  );
}

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [audit, setAudit]   = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  function actionLabel(action: string) {
    const map: Record<string, string> = {
      PRODUCT_CREATE:  t('auditProductCreate'),
      PRODUCT_UPDATE:  t('auditProductUpdate'),
      PRODUCT_DELETE:  t('auditProductDelete'),
      CATEGORY_CREATE: t('auditCategoryCreate'),
      CATEGORY_UPDATE: t('auditCategoryUpdate'),
      CATEGORY_DELETE: t('auditCategoryDelete'),
      OFFER_CREATE:    t('auditOfferCreate'),
      OFFER_UPDATE:    t('auditOfferUpdate'),
      OFFER_DELETE:    t('auditOfferDelete'),
      LOGIN_SUCCESS:   t('auditLoginSuccess'),
      OTP_SENT:        t('auditOtpSent'),
    };
    return map[action] || action;
  }

  useEffect(() => {
    async function load() {
      try {
        const [products, categories, offers, auditLog] = await Promise.all([
          apiFetch<{ count: number }>('/products/admin/all'),
          apiFetch<{ data: any[] }>('/categories/admin/all'),
          apiFetch<{ data: any[] }>('/offers/admin/all'),
          apiFetch<{ data: AuditEntry[] }>('/audit-log'),
        ]);
        setStats({
          products:   (products as any).count,
          categories: (categories as any).data.length,
          offers:     (offers as any).data.length,
        });
        setAudit(((auditLog as any).data || []).slice(0, 10));
      } catch {
        // token issue handled by layout
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('dashboardTitle')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('dashboardWelcome')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Package} label={t('statTotalProducts')}   value={stats?.products}   color="bg-blue-500/10 text-blue-400"   href="/admin/dashboard/products"   />
        <StatCard icon={Tag}     label={t('statTotalCategories')} value={stats?.categories} color="bg-amber-500/10 text-amber-400"  href="/admin/dashboard/categories" />
        <StatCard icon={Star}    label={t('statActiveOffers')}    value={stats?.offers}     color="bg-purple-500/10 text-purple-400" href="/admin/dashboard/offers"    />
      </div>

      {/* Recent audit */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-[#D5C69E]" />
          <h2 className="text-sm font-semibold text-white">{t('recentActivities')}</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : audit.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">{t('noActivities')}</p>
        ) : (
          <div className="space-y-2">
            {audit.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#3d2817]/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-[#D5C69E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">
                    <span className="font-medium text-white">{entry.user_email}</span>
                    {' '}{actionLabel(entry.action)}
                  </p>
                </div>
                <p className="text-[11px] text-white/30 flex-shrink-0">
                  {new Date(entry.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
