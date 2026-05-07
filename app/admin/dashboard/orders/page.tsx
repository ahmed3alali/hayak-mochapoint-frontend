'use client';
import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function OrdersAdminPage() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState([]);

  const STATUS_MAP = () => ({
    'pending':   { label: t('statusPending'),   color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
    'preparing': { label: t('statusPreparing'), color: 'bg-blue-500/10 text-blue-500',    icon: Loader2 },
    'completed': { label: t('statusCompleted'), color: 'bg-green-500/10 text-green-500',  icon: CheckCircle2 },
    'cancelled': { label: t('statusCancelled'), color: 'bg-red-500/10 text-red-500',      icon: XCircle },
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await ordersApi.getAdminAll();
      setOrders(res.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm(t('confirmDeleteOrder'))) {
      try {
        await ordersApi.delete(id);
        fetchOrders();
      } catch (error) {
        console.error('Failed to delete order', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(lang === 'ar' ? 'ar-SA' : 'tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const statusMap = STATUS_MAP();

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#D5C69E]" />
          {t('adminOrdersTitle')}
        </h1>
        <button onClick={fetchOrders} className="text-sm bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
          {t('refreshData')}
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-12 text-center text-white/50">
            {t('noOrders')}
          </div>
        ) : (
          orders.map((order) => {
            const StatusIcon = statusMap[order.status]?.icon || Clock;
            return (
              <div key={order.id} className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="bg-white/5 px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-white/50 text-xs block mb-1">{t('orderNumber')}</span>
                      <span className="text-white font-bold text-lg">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs block mb-1">{t('tableNumber')}</span>
                      <span className="text-[#D5C69E] font-bold text-lg bg-[#3d2817]/30 px-3 py-1 rounded-lg">
                        {order.table_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs block mb-1">{t('orderTime')}</span>
                      <span className="text-white/80 text-sm" dir="ltr">{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl outline-none cursor-pointer border border-white/10 ${statusMap[order.status]?.color || 'bg-[#1e1e1e] text-white'}`}
                    >
                      <option value="pending"   className="bg-[#1e1e1e] text-white">{t('statusPending')}</option>
                      <option value="preparing" className="bg-[#1e1e1e] text-white">{t('statusPreparing')}</option>
                      <option value="completed" className="bg-[#1e1e1e] text-white">{t('statusCompleted')}</option>
                      <option value="cancelled" className="bg-[#1e1e1e] text-white">{t('statusCancelled')}</option>
                    </select>

                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body - Items */}
                <div className="p-6">
                  <table className="w-full text-right text-sm">
                    <thead className="text-white/50 border-b border-white/5">
                      <tr>
                        <th className="pb-3 font-medium">{t('colProduct')}</th>
                        <th className="pb-3 font-medium w-24">{t('colQuantity')}</th>
                        <th className="pb-3 font-medium w-32">{t('colPrice')}</th>
                        <th className="pb-3 font-medium w-32">{t('colTotal')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {order.items && order.items.map(item => (
                        <tr key={item.id} className="text-white/80">
                          <td className="py-3">{item.product_name}</td>
                          <td className="py-3">x{item.quantity}</td>
                          <td className="py-3">₺{Number(item.price).toFixed(2)}</td>
                          <td className="py-3 text-white font-medium">₺{(Number(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-6 flex justify-between items-center bg-white/5 rounded-xl px-6 py-4">
                    <span className="text-white/70">{t('grandTotal')}</span>
                    <span className="text-xl font-bold text-[#D5C69E]">₺{Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
