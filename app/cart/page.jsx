'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import BottomBar from '@/components/Bar/BottomBar';
import { useCart } from '@/app/components/CartContext';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // total
  const total = cart.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setIsModalOpen(true);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await ordersApi.create({
        table_number: tableNumber,
        total_amount: total,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity
        }))
      });
      
      clearCart();
      setIsModalOpen(false);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Failed to submit order', error);
      alert(t('cartOrderError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <>
        <div className="min-h-screen bg-[#F5F5F5] pb-24 flex flex-col items-center justify-center" dir="rtl">
          <Header />
          <div className="text-center mt-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-[#3d2817] mb-4">{t('cartSuccessTitle')}</h1>
            <p className="text-gray-600 mb-8 text-lg">
              {t('cartSuccessDesc')}
            </p>
            <Link href="/">
              <button className="bg-[#3d2817] hover:bg-[#5a3f2a] text-[#D5C69E] px-8 py-3 rounded-full font-medium transition-all text-lg">
                {t('cartBackHome')}
              </button>
            </Link>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5] pb-24 overflow-x-hidden" dir="rtl">
        <Header />

        <section className="container mx-auto px-4 py-6 max-w-full overflow-x-hidden">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3d2817] mb-6">
            {t('cartTitle')}
          </h1>

          {cart.length === 0 ? (
            // Empty Cart
            <div className="text-center py-20">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">
                {t('cartEmpty')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('cartEmptyDesc')}
              </p>
              <Link href="/">
                <button className="bg-[#3d2817] hover:bg-[#5a3f2a] text-white px-8 py-3 rounded-full font-medium transition-all">
                  {t('cartBrowse')}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#3d2817] mb-1 text-sm md:text-base truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-2 truncate">
                        {item.nameEn}
                        {item.selectedSize && ` - ${item.selectedSize.name}`}
                      </p>
                      <p className="text-base md:text-lg font-bold text-[#3d2817]">
                        ₺{item.price}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full p-1.5 md:p-2 transition-all"
                      >
                        <Minus className="h-4 w-4 text-gray-700" />
                      </button>
                      <span className="font-bold text-base md:text-lg w-6 md:w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                        className="bg-[#3d2817] hover:bg-[#5a3f2a] rounded-full p-1.5 md:p-2 transition-all"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.cartKey || item.id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-all flex-shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-md lg:sticky lg:top-24">
                  <h2 className="text-xl font-bold text-[#3d2817] mb-4">
                    {t('cartSummary')}
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>{t('cartItemCount')}</span>
                      <span className="font-medium">{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t('cartTotalQty')}</span>
                      <span className="font-medium">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-[#3d2817]">
                      <span>{t('cartTotal')}</span>
                      <span>₺{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#3d2817] hover:bg-[#5a3f2a] text-white py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
                  >
                    {t('cartCheckout')}
                  </button>

                  <Link href="/">
                    <button className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-full font-medium transition-all">
                      {t('cartContinue')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <BottomBar />

      {/* Table Number Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl transform transition-all">
            <h2 className="text-2xl font-bold text-[#3d2817] mb-2 text-center">{t('cartTableTitle')}</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">
              {t('cartTableDesc')}
            </p>
            <form onSubmit={submitOrder} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder={t('cartTablePlaceholder')}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full text-center text-2xl border-2 border-gray-200 focus:border-[#3d2817] rounded-xl px-4 py-3 outline-none transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-lg"
                  disabled={isSubmitting}
                >
                  {t('btnCancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#3d2817] hover:bg-[#5a3f2a] text-[#D5C69E] py-3 rounded-xl font-bold text-lg"
                  disabled={!tableNumber.trim() || isSubmitting}
                >
                  {isSubmitting ? t('cartSubmitting') : t('cartConfirm')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}