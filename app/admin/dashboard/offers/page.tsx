'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { offersApi, dailyPicksApi, uploadImage, type Offer, type DailyPick } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function OffersAdminPage() {
  const { t, lang } = useLanguage();
  const [offers, setOffers]         = useState<Offer[]>([]);
  const [picks, setPicks]           = useState<DailyPick[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<'offers'|'picks'>('offers');
  const [modal, setModal]           = useState<'add'|'edit'|null>(null);
  const [pickModal, setPickModal]   = useState<'add'|'edit'|null>(null);
  const [curOffer, setCurOffer]     = useState<Partial<Offer>>({ image_url:'', alt_text:'', sort_order:0, is_active:true });
  const [curPick, setCurPick]       = useState<Partial<DailyPick>>({ title:'', title_tr:'', subtitle:'', subtitle_tr:'', price:'', emoji:'😋', is_active:true });
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<number|null>(null);
  const [error, setError]           = useState('');
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([offersApi.getAll(), dailyPicksApi.getAll()]);
      setOffers(o.data); setPicks(p.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const { url } = await uploadImage(file); setCurOffer(c => ({...c, image_url: url})); }
    catch (e: any) { setError(e.message); }
    finally { setUploading(false); }
  }

  async function saveOffer() {
    if (!curOffer.image_url) { setError(t('imageRequired')); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'add') { const {data} = await offersApi.create(curOffer); setOffers(o => [...o, data]); }
      else if (modal === 'edit' && curOffer.id) { const {data} = await offersApi.update(curOffer.id, curOffer); setOffers(o => o.map(x => x.id===data.id?data:x)); }
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function savePick() {
    if (!curPick.title) { setError(t('titleRequired')); return; }
    setSaving(true); setError('');
    try {
      if (pickModal === 'add') { const {data} = await dailyPicksApi.create(curPick); setPicks(p => [...p, data]); }
      else if (pickModal === 'edit' && curPick.id) { const {data} = await dailyPicksApi.update(curPick.id, curPick); setPicks(p => p.map(x => x.id===data.id?data:x)); }
      setPickModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function deleteOffer(id: number) {
    if (!confirm(t('confirmDeleteOffer'))) return; setDeleting(id);
    try { await offersApi.delete(id); setOffers(o => o.filter(x => x.id!==id)); }
    catch (e: any) { setError(e.message); } finally { setDeleting(null); }
  }

  async function deletePick(id: number) {
    if (!confirm(t('confirmDeletePick'))) return; setDeleting(id);
    try { await dailyPicksApi.delete(id); setPicks(p => p.filter(x => x.id!==id)); }
    catch (e: any) { setError(e.message); } finally { setDeleting(null); }
  }

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors";

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-2">{t('adminOffersTitle')}</h1>
      {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('offers')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab==='offers' ? 'bg-[#3d2817] text-[#D5C69E]' : 'bg-white/5 text-white/40 hover:text-white'}`}>
          {t('tabOffers')} ({offers.length})
        </button>
        <button onClick={() => setTab('picks')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab==='picks' ? 'bg-[#3d2817] text-[#D5C69E]' : 'bg-white/5 text-white/40 hover:text-white'}`}>
          {t('tabPicks')} ({picks.length})
        </button>
      </div>

      {/* OFFERS TAB */}
      {tab === 'offers' && (
        <div>
          <div className="flex justify-end mb-4">
              <button onClick={() => { setCurOffer({image_url:'',alt_text:'',sort_order:0,is_active:true}); setModal('add'); setError(''); }}
              className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all">
              <Plus className="w-4 h-4" /> {t('addOffer')}
            </button>
          </div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map(o => (
                <div key={o.id} className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden group">
                  <div className="h-40 overflow-hidden">
                    <img src={o.image_url} alt={o.alt_text||''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/1e1e1e/D5C69E?text=Image'; }} />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs truncate">{o.alt_text || t('noDescription')}</p>
                      <span className={`text-xs ${o.is_active ? 'text-green-400' : 'text-white/30'}`}>{o.is_active ? `● ${t('statusActive')}` : `● ${t('statusHidden')}`}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurOffer({...o}); setModal('edit'); setError(''); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteOffer(o.id)} disabled={deleting===o.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                        {deleting===o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>}
        </div>
      )}

      {/* PICKS TAB */}
      {tab === 'picks' && (
        <div>
          <div className="flex justify-end mb-4">
          <button onClick={() => { setCurPick({title:'', title_tr:'', subtitle:'', subtitle_tr:'', price:'', emoji:'😋', is_active:true}); setPickModal('add'); setError(''); }}
              className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all">
              <Plus className="w-4 h-4" /> {t('addPick')}
            </button>
          </div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
          : <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5 text-white/30 text-right">
                <th className="px-5 py-3 font-medium">{t('colPick')}</th>
                  <th className="px-5 py-3 font-medium">{t('colPrice')}</th>
                  <th className="px-5 py-3 font-medium">{t('colStatus')}</th>
                  <th className="px-5 py-3 font-medium">{t('colActions')}</th>
                </tr></thead>
                <tbody>{picks.map(p => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="text-2xl">{p.emoji}</span><div><p className="font-medium text-white">{p.title}</p><p className="text-white/30 text-xs">{p.subtitle}</p></div></div></td>
                    <td className="px-5 py-3 text-[#D5C69E] font-medium">{p.price}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>{p.is_active ? t('statusActive') : t('statusHidden')}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-2">
                      <button onClick={() => { setCurPick({...p}); setPickModal('edit'); setError(''); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deletePick(p.id)} disabled={deleting===p.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                        {deleting===p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>}
        </div>
      )}

      {/* Offer Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal==='add'?t('addOfferTitle'):t('editOfferTitle')}</h2>
              <button onClick={() => setModal(null)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-xs text-white/50 mb-2">{t('offerImage')}</label>
                <div className="flex items-center gap-3">
                  {curOffer.image_url && <img src={curOffer.image_url} className="w-20 h-14 rounded-lg object-cover" onError={e => {(e.target as HTMLImageElement).style.display='none'}} />}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? t('uploading') : t('uploadImage')}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
              <div><label className="block text-xs text-white/50 mb-1.5">{t('imageUrl')}</label>
                <input value={curOffer.image_url||''} onChange={e=>setCurOffer(c=>({...c,image_url:e.target.value}))} placeholder="https://..." className={inputCls} /></div>
              <div><label className="block text-xs text-white/50 mb-1.5">{t('offerDescription')}</label>
                <input value={curOffer.alt_text||''} onChange={e=>setCurOffer(c=>({...c,alt_text:e.target.value}))} placeholder={lang === 'ar' ? 'عرض الأسبوع' : 'Haftanın kampanyası'} className={inputCls} /></div>
              <div><label className="block text-xs text-white/50 mb-1.5">{t('sortOrder')}</label>
                <input type="number" value={curOffer.sort_order??0} onChange={e=>setCurOffer(c=>({...c,sort_order:parseInt(e.target.value)||0}))} className={inputCls} /></div>
              <button type="button" onClick={() => setCurOffer(c => ({...c, is_active: !c.is_active}))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${curOffer.is_active ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}>
                {curOffer.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {t('toggleActive')}
              </button>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/5">
              <button onClick={()=>setModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all">{t('btnCancel')}</button>
              <button onClick={saveOffer} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Pick Modal */}
      {pickModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPickModal(null)}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{pickModal==='add'?t('addPickTitle'):t('editPickTitle')}</h2>
              <button onClick={() => setPickModal(null)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              {[{labelKey:'pickTitleAr',key:'title',ph:'امريكانو + كيك'},{labelKey:'pickTitleTr',key:'title_tr',ph:'Americano + Kek'},{labelKey:'pickSubtitleAr',key:'subtitle',ph:'خياراتك المميزة'},{labelKey:'pickSubtitleTr',key:'subtitle_tr',ph:'Özel seçenekleriniz'},{labelKey:'pickPrice',key:'price',ph:'₺9.99'},{labelKey:'pickEmoji',key:'emoji',ph:'😋'}].map(f=>(
                <div key={f.key}><label className="block text-xs text-white/50 mb-1.5">{t(f.labelKey)}</label>
                  <input value={(curPick as any)[f.key]||''} onChange={e=>setCurPick(c=>({...c,[f.key]:e.target.value}))} placeholder={f.ph} className={inputCls} /></div>
              ))}
              <button type="button" onClick={() => setCurPick(c => ({...c, is_active: !c.is_active}))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${curPick.is_active ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}>
                {curPick.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {t('toggleActive')}
              </button>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/5">
              <button onClick={()=>setPickModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all">{t('btnCancel')}</button>
              <button onClick={savePick} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
