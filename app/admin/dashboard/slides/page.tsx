'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Upload, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { heroSlidesApi, uploadImage, type HeroSlide } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

const emptySlide: Partial<HeroSlide> = {
  image_url: '',
  title: '',
  title_tr: '',
  subtitle: '',
  subtitle_tr: '',
  is_active: true
};

export default function SlidesAdminPage() {
  const { t } = useLanguage();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add'|'edit'|null>(null);
  const [current, setCurrent] = useState<Partial<HeroSlide>>(emptySlide);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number|null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await heroSlidesApi.getAll();
      setSlides(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function openAdd() { setCurrent({ ...emptySlide }); setModal('add'); setError(''); }
  function openEdit(s: HeroSlide) { setCurrent({ ...s }); setModal('edit'); setError(''); }
  function closeModal() { setModal(null); setError(''); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setCurrent(c => ({ ...c, image_url: url }));
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!current.image_url) { setError(t('slideImageRequired')); return; }
    if (!current.title) { setError(t('slideTitleRequired')); return; }
    
    setSaving(true); setError('');
    try {
      if (modal === 'add') {
        const { data } = await heroSlidesApi.create(current);
        setSlides(prev => [...prev, data]);
      } else if (modal === 'edit' && current.id) {
        const { data } = await heroSlidesApi.update(current.id, current);
        setSlides(prev => prev.map(x => x.id === data.id ? data : x));
      }
      closeModal();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('confirmDeleteSlide'))) return;
    setDeleting(id);
    try {
      await heroSlidesApi.delete(id);
      setSlides(prev => prev.filter(x => x.id !== id));
    } catch (err: any) { setError(err.message); }
    finally { setDeleting(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{t('adminSlidesTitle')}</h1>
          <p className="text-white/40 text-xs mt-0.5">{slides.length} {t('adminSlidesCount')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> {t('addSlide')}
        </button>
      </div>

      {error && !modal && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
        ) : slides.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">{t('noSlides')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/30 text-right">
                  <th className="px-5 py-3 font-medium w-24">{t('colImage')}</th>
                  <th className="px-5 py-3 font-medium">{t('colTitleSubtitle')}</th>
                  <th className="px-5 py-3 font-medium">{t('colStatus')}</th>
                  <th className="px-5 py-3 font-medium w-24">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {slides.map(s => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      {s.image_url ? (
                        <img src={s.image_url} alt="slide" className="w-16 h-10 object-cover rounded-lg border border-white/10" />
                      ) : (
                        <div className="w-16 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-xs text-white/30">{t('noImage')}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{s.title}</p>
                      {s.subtitle && <p className="text-white/40 text-xs">{s.subtitle}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {s.is_active ? t('statusActive') : t('statusHidden')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                          {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal === 'add' ? t('addSlideTitle') : t('editSlideTitle')}</h2>
              <button onClick={closeModal} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

              <div>
                <label className="block text-xs text-white/50 mb-2">{t('slideImage')}</label>
                <div className="flex items-center gap-3">
                  {current.image_url ? (
                    <img src={current.image_url} className="w-24 h-16 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-24 h-16 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-xs text-white/30 border border-white/10">1920x800</div>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? t('uploading') : t('uploadImage')}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              {[
                { label: t('slideTitleAr'), key: 'title', type: 'text', placeholder: 'Coffee Time' },
                { label: t('slideTitleTr'), key: 'title_tr', type: 'text', placeholder: 'Kahve Zamanı' },
                { label: t('slideSubtitleAr'), key: 'subtitle', type: 'text', placeholder: 'اطلب الآن' },
                { label: t('slideSubtitleTr'), key: 'subtitle_tr', type: 'text', placeholder: 'Şimdi Sipariş Ver' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-white/50 mb-1.5">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(current as any)[key] ?? ''}
                    onChange={e => setCurrent(c => ({ ...c, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                  />
                </div>
              ))}

              <div className="pt-2">
                <button type="button" onClick={() => setCurrent(c => ({ ...c, is_active: !c.is_active }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${current.is_active ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}>
                  {current.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {t('toggleActive')}
                </button>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/5">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">{t('btnCancel')}</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#3d2817] hover:bg-[#5a3f2a] text-[#D5C69E] text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
