'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { reviewsApi, type Review } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

const emptyReview = { name: '', rating: 5, comment: '', comment_tr: '', is_active: true };

export default function ReviewsAdminPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [current, setCurrent] = useState<Partial<Review>>({ ...emptyReview });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await reviewsApi.getAll();
      setReviews(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => { setCurrent({ ...emptyReview }); setModal('add'); setError(''); };
  const openEdit = (r: Review) => { setCurrent({ ...r }); setModal('edit'); setError(''); };
  const close = () => { setModal(null); setError(''); };

  async function handleSave() {
    if (!current.name) { setError(t('reviewNameRequired')); return; }
    if (!current.comment) { setError(t('reviewCommentRequired')); return; }
    if (!current.rating || current.rating < 1 || current.rating > 5) { setError(t('reviewRatingRequired')); return; }

    setSaving(true);
    setError('');
    try {
      if (modal === 'add') {
        const { data } = await reviewsApi.create(current);
        setReviews(r => [data, ...r]);
      } else if (modal === 'edit' && current.id) {
        const { data } = await reviewsApi.update(current.id, current);
        setReviews(r => r.map(x => x.id === data.id ? data : x));
      }
      close();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('confirmDeleteReview'))) return;
    setDeleting(id);
    try {
      await reviewsApi.delete(id);
      setReviews(r => r.filter(x => x.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{t('adminReviewsTitle')}</h1>
          <p className="text-white/40 text-xs mt-0.5">{reviews.length} {t('adminReviewsCount')}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> {t('addReview')}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">{t('noReviews')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/30 text-right">
                  <th className="px-5 py-3 font-medium">{t('colName')}</th>
                  <th className="px-5 py-3 font-medium">{t('colRating')}</th>
                  <th className="px-5 py-3 font-medium">{t('colComment')}</th>
                  <th className="px-5 py-3 font-medium">{t('colStatus')}</th>
                  <th className="px-5 py-3 font-medium">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{review.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/70 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${review.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {review.is_active ? t('statusVisible') : t('statusHidden')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(review)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                          {deleting === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal === 'add' ? t('addReviewTitle') : t('editReviewTitle')}</h2>
              <button onClick={close} className="text-white/30 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('reviewName')}</label>
                <input
                  value={current.name || ''}
                  onChange={e => setCurrent(c => ({ ...c, name: e.target.value }))}
                  placeholder={t('reviewNamePlaceholder')}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('reviewRating')}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrent(c => ({ ...c, rating: num }))}
                      className={`p-2 rounded-lg transition-all ${current.rating && current.rating >= num ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/20 hover:bg-white/5'}`}
                    >
                      <Star className={`w-6 h-6 ${current.rating && current.rating >= num ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('reviewCommentAr')}</label>
                <textarea
                  value={current.comment || ''}
                  onChange={e => setCurrent(c => ({ ...c, comment: e.target.value }))}
                  placeholder={t('reviewCommentArPlaceholder')}
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  {t('reviewCommentTr')}
                  <span className="mr-2 text-[10px] bg-[#3d2817]/60 text-[#D5C69E] px-1.5 py-0.5 rounded">🇹🇷 TR</span>
                </label>
                <textarea
                  value={current.comment_tr || ''}
                  onChange={e => setCurrent(c => ({ ...c, comment_tr: e.target.value }))}
                  placeholder={t('reviewCommentTrPlaceholder')}
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-[#D5C69E]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setCurrent(c => ({ ...c, is_active: !c.is_active }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${current.is_active ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}
                >
                  {current.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {t('reviewVisible')}
                </button>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/5">
              <button
                onClick={close}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
