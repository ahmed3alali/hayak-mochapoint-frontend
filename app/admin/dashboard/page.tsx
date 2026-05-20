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
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white/40 text-xs truncate">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 truncate">{value ?? '—'}</p>
      </div>
      {href && <ArrowLeft className="w-4 h-4 text-white/20 group-hover:text-[#D5C69E]/60 mr-auto transition-colors flex-shrink-0" />}
    </>
  );

  if (href) {
    return (
      <Link href={href}
        className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-[#D5C69E]/20 hover:bg-[#1a1a1a] transition-all group"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
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
        <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white/40 text-[11px] mb-1">{label}</p>
          <p className="text-sm font-semibold text-[#D5C69E]">
            {t('revenueAmount')}: {payload[0].value.toLocaleString()} ₺
          </p>
          {payload[1] && (
            <p className="text-sm font-semibold text-green-400 mt-0.5">
              {t('salesCount')}: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboardTitle')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('dashboardWelcome')}</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Sales & Revenue Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={DollarSign} 
              label={t('statTotalRevenue')} 
              value={`${salesStats?.totalRevenue.toLocaleString() ?? 0} ₺`} 
              color="bg-[#D5C69E]/10 text-[#D5C69E]" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={ShoppingBag} 
              label={t('statTodaySales')} 
              value={salesStats?.todaySalesCount} 
              color="bg-green-500/10 text-green-400" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={TrendingUp} 
              label={t('statWeeklySales')} 
              value={salesStats?.weekSalesCount} 
              color="bg-emerald-500/10 text-emerald-400" 
              href="/admin/dashboard/orders"
            />
            <StatCard 
              icon={TrendingUp} 
              label={t('statMonthlySales')} 
              value={salesStats?.monthSalesCount} 
              color="bg-teal-500/10 text-teal-400" 
              href="/admin/dashboard/orders"
            />
          </div>

          {/* Catalog Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Package} label={t('statTotalProducts')}   value={stats?.products}   color="bg-blue-500/10 text-blue-400"   href="/admin/dashboard/products"   />
            <StatCard icon={Tag}     label={t('statTotalCategories')} value={stats?.categories} color="bg-amber-500/10 text-amber-400"  href="/admin/dashboard/categories" />
            <StatCard icon={Star}    label={t('statActiveOffers')}    value={stats?.offers}     color="bg-purple-500/10 text-purple-400" href="/admin/dashboard/offers"    />
          </div>

          {/* Charts & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#D5C69E]" />
                  <h2 className="text-base font-semibold text-white">{t('salesTrendTitle')}</h2>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
                  <button 
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === '7d' ? 'bg-[#3d2817] text-[#D5C69E]' : 'text-white/40 hover:text-white'}`}
                  >
                    {t('last7Days')}
                  </button>
                  <button 
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === '30d' ? 'bg-[#3d2817] text-[#D5C69E]' : 'text-white/40 hover:text-white'}`}
                  >
                    {t('last30Days')}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[300px]">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm">
                    {t('noActivities')}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D5C69E" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#D5C69E" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="formattedDate" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" name={t('revenueAmount')} stroke="#D5C69E" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="count" name={t('salesCount')} stroke="#22c55e" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-[#D5C69E]" />
                <h2 className="text-base font-semibold text-white">{t('topProductsTitle')}</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 max-h-[300px] pr-1">
                {!salesStats || salesStats.topProducts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm py-12">
                    {t('noActivities')}
                  </div>
                ) : (
                  salesStats.topProducts.map((product, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium truncate max-w-[150px]">{product.product_name}</span>
                        <span className="text-[#D5C69E] font-semibold flex-shrink-0">
                          {product.total_quantity} {t('soldQuantity')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#3d2817] to-[#D5C69E] rounded-full transition-all duration-500" 
                          style={{ width: `${(product.total_quantity / maxQty) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/30">
                        <span>#{idx + 1}</span>
                        <span>{product.total_revenue.toLocaleString()} ₺</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent audit */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-[#D5C69E]" />
              <h2 className="text-sm font-semibold text-white">{t('recentActivities')}</h2>
            </div>

            {audit.length === 0 ? (
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
        </>
      )}
    </div>
  );
}
