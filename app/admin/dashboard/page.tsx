'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Tag, 
  Star, 
  Clock, 
  User, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

interface Stats { products: number; categories: number; offers: number; }
interface AuditEntry { id: number; user_email: string; action: string; entity: string; created_at: string; }
interface SalesStats {
  totalRevenue: number;
  todaySalesCount: number;
  weekSalesCount: number;
  monthSalesCount: number;
  dailyStats: Array<{ date: string; count: number; revenue: number }>;
  topProducts: Array<{ product_name: string; total_quantity: number; total_revenue: number }>;
}

function StatCard({ icon: Icon, label, value, color, href }: any) {
  const content = (
    <>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
        <Icon className="w-5.5 h-5.5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-extrabold text-white tracking-tight truncate">{value ?? '—'}</p>
      </div>
      {href && (
        <div className="w-7 h-7 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-center mr-auto transition-all duration-300 group-hover:bg-indigo-950/50 group-hover:border-indigo-500/20">
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#38bdf8] transition-colors flex-shrink-0" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href}
        className="bg-[#0d1120]/95 border border-slate-800/40 rounded-2xl p-6 flex items-center gap-5 hover:border-indigo-500/20 hover:bg-[#0f1528]/95 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 hover:-translate-y-0.5 group"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-[#0d1120]/95 border border-slate-800/40 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
      {content}
    </div>
  );
}

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [audit, setAudit]   = useState<AuditEntry[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

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
        const [products, categories, offers, auditLog, orderStats] = await Promise.all([
          apiFetch<{ count: number }>('/products/admin/all'),
          apiFetch<{ data: any[] }>('/categories/admin/all'),
          apiFetch<{ data: any[] }>('/offers/admin/all'),
          apiFetch<{ data: AuditEntry[] }>('/audit-log'),
          apiFetch<{ data: SalesStats }>('/orders/admin/stats'),
        ]);
        setStats({
          products:   (products as any).count,
          categories: (categories as any).data.length,
          offers:     (offers as any).data.length,
        });
        setAudit(((auditLog as any).data || []).slice(0, 10));
        setSalesStats(orderStats.data);
      } catch (err) {
        // token issue handled by layout
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getFilteredChartData = () => {
    if (!salesStats || !salesStats.dailyStats) return [];
    
    const now = new Date();
    const rangeDays = timeRange === '7d' ? 7 : 30;
    
    const chartDataMap = new Map<string, { date: string; count: number; revenue: number }>();
    
    salesStats.dailyStats.forEach(item => {
      chartDataMap.set(item.date, {
        date: item.date,
        count: Number(item.count) || 0,
        revenue: Number(item.revenue) || 0
      });
    });

    const result = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const formattedDate = `${month}/${day}`;
      
      const existing = chartDataMap.get(dateStr);
      result.push({
        date: dateStr,
        formattedDate,
        count: existing ? existing.count : 0,
        revenue: existing ? existing.revenue : 0
      });
    }
    
    return result;
  };

  const chartData = getFilteredChartData();
  const maxQty = salesStats ? Math.max(...salesStats.topProducts.map(p => p.total_quantity), 1) : 1;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1120] border border-indigo-500/20 p-3 rounded-xl shadow-xl shadow-indigo-950/30">
          <p className="text-slate-500 text-[11px] mb-1">{label}</p>
          <p className="text-sm font-semibold text-[#38bdf8]">
            {t('revenueAmount')}: {payload[0].value.toLocaleString()} ₺
          </p>
          {payload[1] && (
            <p className="text-sm font-semibold text-violet-400 mt-0.5">
              {t('salesCount')}: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 pb-12 select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Banner - Midnight Indigo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0b0f19] to-[#0f1528] border border-indigo-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6366f1]/10 border border-[#38bdf8]/20 rounded-full text-xs text-[#38bdf8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
            <span>{t('mochaPoint')} · {t('adminPanel')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {t('dashboardWelcome')}
          </p>
        </div>
        {!loading && salesStats && (
          <div className="relative z-10 flex items-center gap-4 bg-indigo-950/30 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('statTotalRevenue')}</p>
              <p className="text-lg font-bold text-white">{salesStats.totalRevenue.toLocaleString()} ₺</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-900/30 border border-slate-800/30 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[420px] bg-slate-900/30 border border-slate-800/30 rounded-2xl animate-pulse" />
            <div className="h-[420px] bg-slate-900/30 border border-slate-800/30 rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Sales & Revenue Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              icon={DollarSign} 
              label={t('statTotalRevenue')} 
              value={`${salesStats?.totalRevenue.toLocaleString() ?? 0} ₺`} 
              color="bg-[#38bdf8]/8 text-[#38bdf8] border border-[#38bdf8]/15" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={ShoppingBag} 
              label={t('statTodaySales')} 
              value={salesStats?.todaySalesCount} 
              color="bg-violet-500/8 text-violet-400 border border-violet-500/15" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={TrendingUp} 
              label={t('statWeeklySales')} 
              value={salesStats?.weekSalesCount} 
              color="bg-emerald-500/8 text-emerald-400 border border-emerald-500/15" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={TrendingUp} 
              label={t('statMonthlySales')} 
              value={salesStats?.monthSalesCount} 
              color="bg-amber-500/8 text-amber-400 border border-amber-500/15" 
              href="/admin/dashboard/orders"
            />
          </div>

          {/* Catalog Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard icon={Package} label={t('statTotalProducts')} value={stats?.products} color="bg-indigo-500/8 text-indigo-400 border border-indigo-500/15" href="/admin/dashboard/products" />
            <StatCard icon={Tag} label={t('statTotalCategories')} value={stats?.categories} color="bg-cyan-500/8 text-cyan-400 border border-cyan-500/15" href="/admin/dashboard/categories" />
            <StatCard icon={Star} label={t('statActiveOffers')} value={stats?.offers} color="bg-pink-500/8 text-pink-400 border border-pink-500/15" href="/admin/dashboard/offers" />
          </div>

          {/* Charts & Top Products row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart Card */}
            <div className="lg:col-span-2 bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-800/40 rounded-3xl p-6 flex flex-col shadow-xl relative overflow-hidden hover:border-indigo-500/15 transition-all duration-300">
              <div className="absolute top-0 left-0 w-48 h-48 bg-[#6366f1]/4 rounded-full blur-[60px] pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-[#38bdf8]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">{t('salesTrendTitle')}</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('salesTrendSubtitle') || 'إحصائيات الإيرادات وحجم المبيعات'}</p>
                  </div>
                </div>
                <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/40 self-start">
                  <button onClick={() => setTimeRange('7d')} className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${timeRange === '7d' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{t('last7Days')}</button>
                  <button onClick={() => setTimeRange('30d')} className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${timeRange === '30d' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{t('last30Days')}</button>
                </div>
              </div>
              <div className="flex-1 min-h-[300px] relative z-10">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-sm">{t('noActivities')}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" stroke="rgba(99,102,241,0.05)" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="rgba(148,163,184,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis yAxisId="left" stroke="rgba(148,163,184,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(148,163,184,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={5} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" name={t('revenueAmount')} stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area yAxisId="right" type="monotone" dataKey="count" name={t('salesCount')} stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Products Card */}
            <div className="bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-800/40 rounded-3xl p-6 flex flex-col shadow-xl relative overflow-hidden hover:border-indigo-500/15 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#6366f1]/4 rounded-full blur-[60px] pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">{t('topProductsTitle')}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('topProductsSubtitle') || 'أكثر العناصر مبيعاً'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 max-h-[320px] pr-1 custom-scrollbar relative z-10">
                {!salesStats || salesStats.topProducts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-sm py-16">{t('noActivities')}</div>
                ) : (
                  salesStats.topProducts.map((product, idx) => (
                    <div key={idx} className="space-y-2 group/item">
                      <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-slate-300 font-semibold truncate group-hover/item:text-white transition-colors">{product.product_name}</span>
                        <span className="text-[#38bdf8] font-bold text-xs bg-indigo-950/50 border border-indigo-500/20 px-2 py-0.5 rounded-lg flex-shrink-0">
                          {product.total_quantity} {t('soldQuantity')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-700 via-violet-600 to-[#38bdf8] rounded-full transition-all duration-700 ease-out" style={{ width: `${(product.total_quantity / maxQty) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span className="font-semibold text-indigo-500">#{idx + 1}</span>
                        <span className="font-medium tracking-wide">{product.total_revenue.toLocaleString()} ₺</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Audits Log Card */}
          <div className="bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:border-indigo-500/15 transition-all duration-300">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#06b6d4]/4 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">{t('recentActivities')}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{t('recentActivitiesSubtitle') || 'سجل الإجراءات الأخيرة'}</p>
              </div>
            </div>
            {audit.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-12">{t('noActivities')}</p>
            ) : (
              <div className="space-y-2.5 relative z-10">
                {audit.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-900/20 hover:bg-slate-900/40 border border-slate-800/20 hover:border-indigo-500/10 transition-all duration-300 group/audit">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/50 flex items-center justify-center flex-shrink-0 border border-indigo-500/15 group-hover/audit:bg-indigo-900/30 transition-colors">
                      <User className="w-4 h-4 text-[#38bdf8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 leading-relaxed">
                        <span className="font-semibold text-white tracking-wide">{entry.user_email}</span>
                        {' '}<span className="text-slate-500">{actionLabel(entry.action)}</span>
                      </p>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 tracking-wide flex-shrink-0">
                      {new Date(entry.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
