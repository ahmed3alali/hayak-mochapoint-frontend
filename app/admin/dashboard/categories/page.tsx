'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { categoriesApi, uploadImage, type Category } from '@/lib/api';
import { useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const empty = { name_ar: '', name_tr: '', icon: '', sort_order: 0, is_active: true };

export default function CategoriesAdminPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]  = useState(true);
  const [modal, setModal]      = useState<'add'|'edit'|null>(null);
  const [current, setCurrent]  = useState<Partial<Category>>({...empty});
  const [saving, setSaving]    = useState(false);
  const [deleting, setDeleting] = useState<number|null>(null);
  const [error, setError]      = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setCategories((await categoriesApi.getAll()).data); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const openAdd  = () => { setCurrent({...empty}); setModal('add'); setError(''); };
  const openEdit = (c: Category) => { setCurrent({...c}); setModal('edit'); setError(''); };
  const close    = () => { setModal(null); setError(''); };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setCurrent(c => ({ ...c, icon: url }));
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!current.name_ar) { setError(t('categoryNameRequired')); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'add') {
        const { data } = await categoriesApi.create(current);
        setCategories(c => [...c, data]);
      } else if (modal === 'edit' && current.id) {
        const { data } = await categoriesApi.update(current.id, current);
        setCategories(c => c.map(x => x.id === data.id ? data : x));
      }
      close();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('confirmDeleteCategory'))) return;
    setDeleting(id);
    try {
      await categoriesApi.delete(id);
      setCategories(c => c.filter(x => x.id !== id));
    } catch (e: any) { setError(e.message); }
    finally { setDeleting(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white">{t('adminCategoriesTitle')}</h1><p className="text-white/40 text-xs mt-0.5">{categories.length} {t('adminCategoriesCount')}</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> {t('addCategory')}
        </button>
      </div>
      {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
        : categories.length === 0 ? <div className="text-center py-16 text-white/30 text-sm">{t('noCategories')}</div>
        : <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-white/30 text-right">
              <th className="px-5 py-3 font-medium">{t('colIcon')}</th>
              <th className="px-5 py-3 font-medium">{t('colName')}</th>
              <th className="px-5 py-3 font-medium">{t('colOrder')}</th>
              <th className="px-5 py-3 font-medium">{t('colStatus')}</th>
              <th className="px-5 py-3 font-medium">{t('colActions')}</th>
            </tr></thead>
            <tbody>{categories.map(cat => (
              <tr key={cat.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  {cat.icon && cat.icon.startsWith('http') ? (
                    <img src={cat.icon} alt={cat.name_ar} className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <span className="text-2xl">{cat.icon || '☕'}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-white font-medium">{cat.name_ar}</td>
                <td className="px-5 py-3 text-white/50">{cat.sort_order}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${cat.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>{cat.is_active ? t('statusActive') : t('statusHidden')}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                      {deleting === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal === 'add' ? t('addCategoryTitle') : t('editCategoryTitle')}</h2>
              <button onClick={close} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('categoryNameAr')}</label>
                <input value={current.name_ar || ''} onChange={e => setCurrent(c => ({...c, name_ar: e.target.value}))} placeholder="القهوة"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('categoryNameTr')}</label>
                <input value={current.name_tr || ''} onChange={e => setCurrent(c => ({...c, name_tr: e.target.value}))} placeholder="Kahve"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">{t('categoryIcon')}</label>
                <div className="flex items-center gap-3">
                  {current.icon && current.icon.startsWith('http') ? (
                    <img src={current.icon} className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-white/5" />
                  ) : current.icon ? (
                    <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-2xl border border-white/10">{current.icon}</div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-xs text-white/30 border border-white/10">صورة</div>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? t('uploading') : t('uploadImage')}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('sortOrder')}</label>
                <input type="number" value={current.sort_order ?? 0} onChange={e => setCurrent(c => ({...c, sort_order: parseInt(e.target.value)||0}))}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D5C69E]/40 transition-colors" />
              </div>
              <button type="button" onClick={() => setCurrent(c => ({...c, is_active: !c.is_active}))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${current.is_active ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}>
                {current.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {t('toggleActive')}
              </button>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/5">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all">{t('btnCancel')}</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
