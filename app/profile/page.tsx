"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Heart, MapPin, Building2, Phone, User } from "lucide-react"
import Header from '@/app/components/Header';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import BottomBar from '@/components/Bar/BottomBar';
import { contactApi, Contact } from "@/lib/api";
import { useLanguage } from '@/lib/LanguageContext';

const ICONS: Record<string, React.ElementType> = {
  Phone: Phone,
  MapPin: MapPin,
  Building2: Building2,
  User: User,
};

export default function ProfilePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    contactApi.getPublic().then(res => {
      setContacts(res.data || []);
    }).catch(console.error);
  }, []);

  const phoneNumbers = contacts.filter(c => c.type === 'phone');
  const addresses = contacts.filter(c => c.type === 'address');

  return (
    <>
      <div className={`min-h-screen bg-[#F5F5F5]`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        <Header categories={[]} />

        {/* Saved Phone Numbers */}
        {phoneNumbers.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-normal text-[#000000] mb-6 px-2 text-right md:text-center" style={{ textAlign: lang === 'tr' ? 'left' : 'right' }}>
              {t('savedPhones')}
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {phoneNumbers.map((phone) => {
                const IconComponent = ICONS[phone.icon] || Phone;
                return (
                  <Card
                    key={phone.id}
                    className="bg-white border-0 border-b border-[#f6d3ae] rounded-2xl p-5 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="flex flex-row  gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center ">
                        <IconComponent className="h-6 w-6 text-[#6b4423]" />
                      </div>
                      <div className="flex">
                        <h3 className="font-bold text-[#3d2817] mb-1">
                          {lang === 'tr' && phone.title_tr ? phone.title_tr : phone.title_ar}
                        </h3>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Saved Addresses */}
        {addresses.length > 0 && (
          <section className="container mx-auto px-4 pb-24 md:pb-32">
            <h2 className="text-2xl font-normal text-[#000000] mb-6 px-2 text-right md:text-center" style={{ textAlign: lang === 'tr' ? 'left' : 'right' }}>
              {t('ourAddresses')}
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {addresses.map((address) => {
                const IconComponent = ICONS[address.icon] || MapPin;
                return (
                  <Card
                    key={address.id}
                    className="bg-white border-0 border-b border-[#d4a574] rounded-2xl p-5 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-[#6b4423]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#3d2817] mb-1">
                          {lang === 'tr' && address.title_tr ? address.title_tr : address.title_ar}
                        </h3>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

          </section>
        )}
      </div>
      <BottomBar />
    </>
  )
}
