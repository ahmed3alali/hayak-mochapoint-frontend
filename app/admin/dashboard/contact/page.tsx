'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Phone, MapPin, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

const ICONS = {
  Phone: Phone,
  MapPin: MapPin,
  Building2: Building2,
  User: User,
};

export default function ContactAdminPage() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'address',
    title_ar: '',
    title_tr: '',
    detail: '',
    detail_tr: '',
    icon: 'MapPin',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await contactApi.getAdminAll();
      setContacts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setFormData(contact);
      setEditingId(contact.id);
    } else {
      setFormData({
        type: 'address',
        title_ar: '',
        title_tr: '',
        detail: '',
        detail_tr: '',
        icon: 'MapPin',
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await contactApi.update(editingId, formData);
      } else {
        await contactApi.create(formData);
      }
      fetchContacts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save contact', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm(t('confirmDeleteContact'))) {
      try {
        await contactApi.delete(id);
        fetchContacts();
      } catch (error) {
        console.error('Failed to delete contact', error);
      }
    }
  };

  const getTypeLabel = (type) => (type === 'address' ? t('typeAddress') : t('typePhone'));

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">{t('adminContactTitle')}</h1>
        <Button onClick={() => handleOpenModal()} className="bg-gradient-to-l from-[#3d2817] to-[#5a3a22] text-[#D5C69E] hover:opacity-90 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('addNew')}
        </Button>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-white/80">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium text-sm">{t('colType')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colTitleAr')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colDetails')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colIcon')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colOrder')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colStatus')}</th>
                <th className="px-6 py-4 font-medium text-sm">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact) => {
                const IconComponent = ICONS[contact.icon] || MapPin;
                return (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm">{getTypeLabel(contact.type)}</td>
                    <td className="px-6 py-4 font-medium">{contact.title_ar}</td>
                    <td className="px-6 py-4 text-sm" dir="ltr" style={{ textAlign: 'right' }}>{contact.detail}</td>
                    <td className="px-6 py-4 text-sm"><IconComponent className="w-5 h-5 text-[#D5C69E]" /></td>
                    <td className="px-6 py-4 text-sm">{contact.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${contact.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'}`}>
                        {contact.is_active ? t('statusActive') : t('statusHidden')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal(contact)} className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(contact.id)} className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/5 w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? t('editContactTitle') : t('addContactTitle')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactType')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D5C69E]/40 transition-colors cursor-pointer"
                  required
                >
                  <option value="address" className="bg-[#1e1e1e] text-white">{t('typeAddress')}</option>
                  <option value="phone"   className="bg-[#1e1e1e] text-white">{t('typePhone')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactTitleAr')}</label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactTitleTr')}</label>
                <input
                  type="text"
                  value={formData.title_tr || ''}
                  onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactDetailAr')}</label>
                <input
                  type="text"
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactDetailTr')}</label>
                <input
                  type="text"
                  value={formData.detail_tr || ''}
                  onChange={(e) => setFormData({ ...formData, detail_tr: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t('contactIcon')}</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D5C69E]/40 transition-colors cursor-pointer"
                >
                  <option value="MapPin"    className="bg-[#1e1e1e] text-white">{t('iconMapPin')}</option>
                  <option value="Building2" className="bg-[#1e1e1e] text-white">{t('iconBuilding')}</option>
                  <option value="Phone"     className="bg-[#1e1e1e] text-white">{t('iconPhone')}</option>
                  <option value="User"      className="bg-[#1e1e1e] text-white">{t('iconUser')}</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-2">{t('colOrder')}</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="flex items-center mt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded bg-white/5 border border-white/10"
                    />
                    <span className="text-sm font-medium text-white/80">{t('toggleActive')}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-white hover:bg-white/10">
                  {t('btnCancel')}
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-l from-[#3d2817] to-[#5a3a22] text-[#D5C69E] hover:opacity-90">
                  {t('btnSave')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
