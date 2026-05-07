'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Upload, ToggleLeft, ToggleRight, Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { productsApi, categoriesApi, productSizesApi, uploadImage, type Product, type Category, type ProductSize } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

interface SizeRow {
  id?: number;         // undefined = new (not saved yet)
  name_ar: string;
  name_tr: string;
  price: string;
  _deleted?: boolean;  // mark for deletion
}

const emptyProduct = {
  name_ar: '', name_en: '', name_tr: '', price: 0,
  category_id: null as number | null, image_url: '',
  ingredients: '', ingredients_tr: '', badge: '', badge_tr: '',
  is_featured: false, is_active: true, sort_order: 0,
};

const emptySize = (): SizeRow => ({ name_ar: '', name_tr: '', price: '' });

export default function ProductsAdminPage() {
  const { t } = useLanguage();
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<'add' | 'edit' | null>(null);
  const [current,    setCurrent]    = useState<Partial<Product>>(emptyProduct);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [error,      setError]      = useState('');
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sizes state
  const [sizes,         setSizes]         = useState<SizeRow[]>([]);
  const [sizesExpanded, setSizesExpanded] = useState(false);
  const [sizesLoading,  setSizesLoading]  = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([productsApi.getAll(), categoriesApi.getPublic()]);
      setProducts(p.data);
      setCategories(c.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = products.filter(p =>
    p.name_ar.includes(search) || p.name_en?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setCurrent({ ...emptyProduct });
    setSizes([]);
    setSizesExpanded(false);
    setModal('add');
    setError('');
  }

  async function openEdit(p: Product) {
    setCurrent({ ...p });
    setSizes([]);
    setSizesExpanded(false);
    setModal('edit');
    setError('');
    // Load existing sizes
    setSizesLoading(true);
    try {
      const { data } = await productSizesApi.getByProduct(p.id);
      setSizes(data.map(s => ({ id: s.id, name_ar: s.name_ar, name_tr: s.name_tr ?? '', price: String(s.price) })));
      if (data.length > 0) setSizesExpanded(true);
    } catch { /* ignore */ }
    finally { setSizesLoading(false); }
  }

  function closeModal() { setModal(null); setError(''); setSizes([]); }

  // ── Size row helpers ─────────────────────────────────────────────────────────
  function addSizeRow() {
    setSizes(prev => [...prev, emptySize()]);
    setSizesExpanded(true);
  }

  function updateSizeRow(idx: number, field: keyof SizeRow, value: string) {
    setSizes(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }

  function removeSizeRow(idx: number) {
    setSizes(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Image upload ─────────────────────────────────────────────────────────────
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

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!current.name_ar) { setError(t('productNameRequired')); return; }

    // Validate sizes: each must have name_ar and valid price
    const validSizes = sizes.filter(s => s.name_ar.trim());
    for (const s of validSizes) {
      const p = parseFloat(s.price);
      if (isNaN(p) || p <= 0) {
        setError('يرجى إدخال سعر صحيح لكل حجم');
        return;
      }
    }

    // If no sizes are defined, base price is mandatory
    if (validSizes.length === 0 && !current.price) {
      setError(t('productNameRequired'));
      return;
    }

    setSaving(true); setError('');
    try {
      let productId: number;
      if (modal === 'add') {
        const { data } = await productsApi.create(current);
        setProducts(p => [data, ...p]);
        productId = data.id;
      } else {
        const { data } = await productsApi.update(current.id!, current);
        setProducts(p => p.map(x => x.id === data.id ? data : x));
        productId = current.id!;
      }

      // Bulk-replace sizes
      await productSizesApi.bulkReplace(
        productId,
        validSizes.map((s, i) => ({ name_ar: s.name_ar, name_tr: s.name_tr || null, price: parseFloat(s.price), sort_order: i }))
      );

      closeModal();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('confirmDeleteProduct'))) return;
    setDeleting(id);
    try {
      await productsApi.delete(id);
      setProducts(p => p.filter(x => x.id !== id));
    } catch (err: any) { setError(err.message); }
    finally { setDeleting(null); }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{t('adminProductsTitle')}</h1>
          <p className="text-white/40 text-xs mt-0.5">{products.length} {t('adminProductsCount')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#3d2817] hover:bg-[#5a3a22] text-[#D5C69E] px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> {t('addProduct')}
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchProducts')}
          className="w-full bg-[#141414] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/30 transition-colors" />
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#D5C69E]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">{t('noProducts')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/30 text-right">
                  <th className="px-5 py-3 font-medium">{t('colProduct')}</th>
                  <th className="px-5 py-3 font-medium">{t('colCategory')}</th>
                  <th className="px-5 py-3 font-medium">{t('colPrice')}</th>
                  <th className="px-5 py-3 font-medium">{t('colStatus')}</th>
                  <th className="px-5 py-3 font-medium">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name_ar} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-lg bg-[#3d2817]/40 flex items-center justify-center text-lg flex-shrink-0">☕</div>
                        }
                        <div>
                          <p className="font-medium text-white">{p.name_ar}</p>
                          <p className="text-white/30 text-xs">{p.name_en}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/60">{p.category_name || '—'}</td>
                    <td className="px-5 py-3 text-[#D5C69E] font-medium">₺{Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {p.is_active ? t('statusActive') : t('statusHidden')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                          {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal === 'add' ? t('addProductTitle') : t('editProductTitle')}</h2>
              <button onClick={closeModal} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-white/50 mb-2">{t('productImage')}</label>
                <div className="flex items-center gap-3">
                  {current.image_url
                    ? <img src={current.image_url} className="w-16 h-16 rounded-xl object-cover" />
                    : <div className="w-16 h-16 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-2xl">☕</div>
                  }
                  <button type="button" onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? t('uploading') : t('uploadImage')}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              {[
                { labelKey: 'nameInArabic',   key: 'name_ar', type: 'text',   placeholder: 'أمريكانو' },
                { labelKey: 'nameInEnglish',  key: 'name_en', type: 'text',   placeholder: 'Americano' },
                { labelKey: 'nameInTurkish',  key: 'name_tr', type: 'text',   placeholder: 'Americano (TR)' },
                { labelKey: 'badgeAr',        key: 'badge',   type: 'text',   placeholder: 'القهوة' },
                { labelKey: 'badgeTr',        key: 'badge_tr',type: 'text',   placeholder: 'Kahve' },
              ].map(({ labelKey, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-white/50 mb-1.5">{t(labelKey)}</label>
                  <input type={type} placeholder={placeholder}
                    value={(current as any)[key] ?? ''}
                    onChange={e => setCurrent(c => ({ ...c, [key]: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                  />
                </div>
              ))}

              {/* Base price — always visible */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('priceLabel')} *</label>
                <input type="number" placeholder="9.99"
                  value={(current as any).price ?? ''}
                  onChange={e => setCurrent(c => ({ ...c, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                />
              </div>

              {/* ── Sizes Section ── */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setSizesExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e1e] hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <Ruler className="w-4 h-4 text-[#D5C69E]" />
                    الأحجام والأسعار
                    {sizes.filter(s => s.name_ar.trim()).length > 0 && (
                      <span className="bg-[#3d2817] text-[#D5C69E] text-xs px-2 py-0.5 rounded-full">
                        {sizes.filter(s => s.name_ar.trim()).length}
                      </span>
                    )}
                  </div>
                  {sizesLoading
                    ? <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                    : sizesExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />
                  }
                </button>

                {/* Sizes list */}
                {sizesExpanded && (
                  <div className="p-4 space-y-3">
                    {sizes.length === 0 && (
                      <p className="text-white/30 text-xs text-center py-2">لا توجد أحجام. اضغط «إضافة حجم» لإضافة حجم بسعر مخصص.</p>
                    )}

                    {sizes.map((row, idx) => (
                      <div key={idx} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-3 space-y-2">
                        {/* Row header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#D5C69E]/60 font-medium">حجم {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeSizeRow(idx)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Names row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-white/30 mb-1">الاسم (عربي)</label>
                            <input
                              type="text"
                              placeholder="صغير / وسط / كبير"
                              value={row.name_ar}
                              onChange={e => updateSizeRow(idx, 'name_ar', e.target.value)}
                              className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/30 mb-1">İsim (Türkçe)</label>
                            <input
                              type="text"
                              placeholder="Küçük / Orta / Büyük"
                              value={row.name_tr}
                              onChange={e => updateSizeRow(idx, 'name_tr', e.target.value)}
                              className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                            />
                          </div>
                        </div>
                        {/* Price row */}
                        <div>
                          <label className="block text-xs text-white/30 mb-1">السعر الخاص بهذا الحجم (₺) *</label>
                          <div className="relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D5C69E]/50 text-sm font-medium">₺</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={row.price}
                              onChange={e => updateSizeRow(idx, 'price', e.target.value)}
                              className="w-full bg-[#141414] border border-white/10 rounded-lg pr-8 pl-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addSizeRow}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-[#D5C69E]/30 hover:border-[#D5C69E]/60 text-[#D5C69E]/60 hover:text-[#D5C69E] text-sm rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة حجم
                    </button>

                    {sizes.filter(s => s.name_ar.trim()).length > 0 && (
                      <p className="text-white/20 text-xs">
                        كل حجم له سعره الخاص، والسعر الأساسي أعلاه يُحدَّد يدوياً.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('colCategory')}</label>
                <select value={current.category_id ?? ''}
                  onChange={e => setCurrent(c => ({ ...c, category_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D5C69E]/40 transition-colors">
                  <option value="">{t('noCategory')}</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1e1e1e] text-white">{c.name_ar}</option>)}
                </select>
              </div>

              {/* Ingredients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">{t('ingredientsAr')}</label>
                  <textarea rows={2} placeholder="إسبريسو، حليب، ..."
                    value={current.ingredients ?? ''}
                    onChange={e => setCurrent(c => ({ ...c, ingredients: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">{t('ingredientsTr')}</label>
                  <textarea rows={2} placeholder="Espresso, süt, ..."
                    value={current.ingredients_tr ?? ''}
                    onChange={e => setCurrent(c => ({ ...c, ingredients_tr: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                {[
                  { labelKey: 'toggleActive',   key: 'is_active'   },
                  { labelKey: 'toggleFeatured', key: 'is_featured' },
                ].map(({ labelKey, key }) => (
                  <button key={key} type="button" onClick={() => setCurrent(c => ({ ...c, [key]: !(c as any)[key] }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${(current as any)[key] ? 'border-[#D5C69E]/30 text-[#D5C69E] bg-[#3d2817]/20' : 'border-white/10 text-white/40'}`}>
                    {(current as any)[key] ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/5">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">{t('btnCancel')}</button>
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
