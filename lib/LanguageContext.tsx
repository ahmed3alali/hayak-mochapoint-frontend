"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'tr';

interface Translations {
  [key: string]: {
    ar: string;
    tr: string;
  };
}

const translations: Translations = {
  // Common
  loading: { ar: 'جاري التحميل...', tr: 'Yükleniyor...' },
  mochaPoint: { ar: 'موكا بوينت', tr: 'Mocha Point' },

  // Header
  home: { ar: 'الرئيسية', tr: 'Ana Sayfa' },
  fullMenu: { ar: 'القائمة الكاملة', tr: 'Tüm Menü' },
  contactUs: { ar: 'تواصل معنا', tr: 'Bize Ulaşın' },

  // Admin Sidebar
  adminPanel: { ar: 'لوحة الإدارة', tr: 'Yönetim Paneli' },
  dashboard: { ar: 'لوحة التحكم', tr: 'Kontrol Paneli' },
  products: { ar: 'المنتجات', tr: 'Ürünler' },
  categories: { ar: 'الأصناف', tr: 'Kategoriler' },
  offers: { ar: 'العروض', tr: 'Kampanyalar' },
  slides: { ar: 'السلايدات', tr: 'Slaytlar' },
  reviews: { ar: 'التقييمات', tr: 'Değerlendirmeler' },
  orders: { ar: 'الطلبات', tr: 'Siparişler' },
  contact: { ar: 'التواصل', tr: 'İletişim' },
  systemAdmin: { ar: 'مدير النظام', tr: 'Sistem Yöneticisi' },
  logout: { ar: 'تسجيل الخروج', tr: 'Çıkış Yap' },
  programmedBy: { ar: 'تم البرمجة والتطوير بواسطة', tr: 'Programlayan ve Geliştiren' },
  masarAgency: { ar: 'وكالة مسار', tr: 'Masar Ajansı' },
  techSupport: { ar: 'دعم فني', tr: 'Teknik Destek' },

  // Public Frontend
  activeOffers: { ar: 'العروض السارية', tr: 'Aktif Kampanyalar' },
  dailyPicks: { ar: 'اختياراتنا اليومية لك', tr: 'Günün Seçtiklerimiz' },
  otherProducts: { ar: 'منتجات أخرى', tr: 'Diğer Ürünler' },
  addToCart: { ar: 'إضافة للسلة', tr: 'Sepete Ekle' },
  ingredients: { ar: 'المكونات', tr: 'İçindekiler' },
  customerReviews: { ar: 'تقييم العملاء', tr: 'Müşteri Yorumları' },
  viewFullMenu: { ar: 'عرض القائمة الكاملة', tr: 'Tüm Menüyü Gör' },
  ourMenu: { ar: 'قائمتنا', tr: 'Menümüz' },
  cart: { ar: 'السلة', tr: 'Sepet' },
  total: { ar: 'المجموع', tr: 'Toplam' },
  orderNow: { ar: 'اطلب الآن', tr: 'Şimdi Sipariş Ver' },
  emptyCart: { ar: 'السلة فارغة', tr: 'Sepet boş' },
  tableNumber: { ar: 'رقم الطاولة', tr: 'Masa Numarası' },
  sendOrder: { ar: 'إرسال الطلب', tr: 'Siparişi Gönder' },
  favorites: { ar: 'المفضلة', tr: 'Favoriler' },

  // BottomBar
  bottomHome: { ar: 'الرئيسية', tr: 'Ana Sayfa' },
  bottomMenu: { ar: 'القائمة', tr: 'Menü' },
  bottomSearch: { ar: 'البحث', tr: 'Ara' },
  bottomAccount: { ar: 'حسابي', tr: 'Hesabım' },

  // Search
  searchPlaceholder: { ar: 'البحث ...', tr: 'Arama ...' },
  searchHint: { ar: 'البحث عن صنف معين', tr: 'Belirli bir ürünü arayın' },
  searchPageTitle: { ar: 'البحث عن المنتجات', tr: 'Ürün Arama' },
  searchPagePlaceholder: { ar: 'ابحث عن قهوة، كيك، أو مشروبات...', tr: 'Kahve, pasta veya içecek ara...' },
  searchResults: { ar: 'نتيجة', tr: 'Sonuç' },
  noResults: { ar: 'لا توجد نتائج', tr: 'Sonuç bulunamadı' },
  tryDifferentWords: { ar: 'حاول البحث بكلمات أخرى', tr: 'Farklı kelimelerle aramayı deneyin' },


  // FeaturedProducts & allCategories
  allCategories: { ar: 'جميع الأصناف', tr: 'Tüm Kategoriler' },
  loadingText: { ar: 'جاري التحميل...', tr: 'Yükleniyor...' },
  mochaPoint: { ar: 'موكا بوينت', tr: 'Mocha Point' },

  // Discount section
  discountOffers: { ar: 'العروض', tr: 'Kampanyalar' },
  discountHotDrinks: { ar: 'عرض ع المشروبات الساخنة خصم 20%', tr: 'Sıcak içeceklerde %20 indirim' },
  discountCode1: { ar: 'كود العرض#caffee20', tr: 'Kampanya kodu#caffee20' },
  discountGift: { ar: 'اشترك بقيمة 50₺ واحصل ع هدية مميزة', tr: '50₺ değerinde alışveriş yapın ve özel hediye kazanın' },
  discountCode2: { ar: 'كود العرض#gift50', tr: 'Kampanya kodu#gift50' },

  // Favorites page
  noFavorites: { ar: 'لا توجد منتجات مفضلة', tr: 'Favori ürün yok' },
  startAddFavorites: { ar: 'ابدأ بإضافة منتجاتك المفضلة', tr: 'Favori ürünlerinizi eklemeye başlayın' },
  browseProducts: { ar: 'تصفح المنتجات', tr: 'Ürünlere Göz At' },

  // Profile / Contact page
  savedPhones: { ar: 'أرقام الهواتف المثبتة', tr: 'Kayıtlı Telefon Numaraları' },
  ourAddresses: { ar: 'عناويننا', tr: 'Adreslerimiz' },

  // Navigation aria labels
  ariaNext: { ar: 'التالي', tr: 'Sonraki' },
  ariaPrev: { ar: 'السابق', tr: 'Önceki' },
  ariaSlide: { ar: 'الانتقال للشريحة', tr: 'Slayta git' },

  // Admin common UI
  statusActive: { ar: 'نشط', tr: 'Aktif' },
  statusHidden: { ar: 'مخفي', tr: 'Gizli' },
  colStatus: { ar: 'الحالة', tr: 'Durum' },
  colActions: { ar: 'إجراءات', tr: 'İşlemler' },
  btnSave: { ar: 'حفظ', tr: 'Kaydet' },
  btnCancel: { ar: 'إلغاء', tr: 'İptal' },
  btnAdd: { ar: 'إضافة', tr: 'Ekle' },
  uploading: { ar: 'جاري الرفع...', tr: 'Yükleniyor...' },
  uploadImage: { ar: 'رفع صورة', tr: 'Görsel Yükle' },
  toggleActive: { ar: 'نشط', tr: 'Aktif' },

  // Cart page
  cartTitle: { ar: 'السلة', tr: 'Sepet' },
  cartEmpty: { ar: 'السلة فارغة', tr: 'Sepet Boş' },
  cartEmptyDesc: { ar: 'لم تقم بإضافة أي منتجات بعد', tr: 'Henüz ürün eklemediniz' },
  cartBrowse: { ar: 'تصفح المنتجات', tr: 'Ürünlere Göz At' },
  cartSummary: { ar: 'ملخص الطلب', tr: 'Sipariş Özeti' },
  cartItemCount: { ar: 'عدد المنتجات', tr: 'Ürün Sayısı' },
  cartTotalQty: { ar: 'الكمية الإجمالية', tr: 'Toplam Adet' },
  cartTotal: { ar: 'المجموع', tr: 'Toplam' },
  cartCheckout: { ar: 'إتمام الطلب', tr: 'Siparişi Tamamla' },
  cartContinue: { ar: 'متابعة التسوق', tr: 'Alışverişe Devam Et' },
  cartTableTitle: { ar: 'أدخل رقم الطاولة', tr: 'Masa Numarasını Girin' },
  cartTableDesc: { ar: 'يرجى إدخال رقم الطاولة الخاصة بك ليتم إحضار الطلب إليها', tr: 'Siparişin masanıza getirilebilmesi için lütfen masa numaranızı girin' },
  cartTablePlaceholder: { ar: 'مثال: 5', tr: 'Örn: 5' },
  cartSubmitting: { ar: 'جاري الإرسال...', tr: 'Gönderiliyor...' },
  cartConfirm: { ar: 'تأكيد الطلب', tr: 'Siparişi Onayla' },
  cartSuccessTitle: { ar: 'تم إرسال طلبك بنجاح!', tr: 'Siparişiniz Başarıyla Gönderildi!' },
  cartSuccessDesc: { ar: 'جاري تجهيز طلبك وسيتم إحضاره إلى طاولتك قريباً.', tr: 'Siparişiniz hazırlanıyor ve yakında masanıza getirilecek.' },
  cartBackHome: { ar: 'العودة للصفحة الرئيسية', tr: 'Ana Sayfaya Dön' },
  cartOrderError: { ar: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.', tr: 'Sipariş gönderilirken bir hata oluştu, lütfen tekrar deneyin.' },

  // Admin Products page
  adminProductsTitle: { ar: 'المنتجات', tr: 'Ürünler' },
  adminProductsCount: { ar: 'منتج', tr: 'ürün' },
  addProduct: { ar: 'إضافة منتج', tr: 'Ürün Ekle' },
  searchProducts: { ar: 'بحث...', tr: 'Ara...' },
  noProducts: { ar: 'لا توجد منتجات', tr: 'Ürün bulunamadı' },
  colProduct: { ar: 'المنتج', tr: 'Ürün' },
  colCategory: { ar: 'الصنف', tr: 'Kategori' },
  colPrice: { ar: 'السعر', tr: 'Fiyat' },
  addProductTitle: { ar: 'إضافة منتج جديد', tr: 'Yeni Ürün Ekle' },
  editProductTitle: { ar: 'تعديل المنتج', tr: 'Ürünü Düzenle' },
  productImage: { ar: 'صورة المنتج', tr: 'Ürün Görseli' },
  nameInArabic: { ar: 'الاسم بالعربية *', tr: 'Arapça Ad *' },
  nameInEnglish: { ar: 'الاسم بالإنجليزية', tr: 'İngilizce Ad' },
  nameInTurkish: { ar: 'الاسم بالتركية', tr: 'Türkçe Ad' },
  priceLabel: { ar: 'السعر (₺) *', tr: 'Fiyat (₺) *' },
  badgeAr: { ar: 'الوسم بالعربية', tr: 'Arapça Etiket' },
  badgeTr: { ar: 'الوسم بالتركية', tr: 'Türkçe Etiket' },
  ingredientsAr: { ar: 'المكونات (عربي)', tr: 'İçindekiler (Arapça)' },
  ingredientsTr: { ar: 'المكونات (تركي)', tr: 'İçindekiler (Türkçe)' },
  noCategory: { ar: 'بدون صنف', tr: 'Kategorisiz' },
  toggleActive: { ar: 'نشط', tr: 'Aktif' },
  toggleFeatured: { ar: 'مميز', tr: 'Öne Çıkan' },
  confirmDeleteProduct: { ar: 'هل تريد حذف هذا المنتج؟', tr: 'Bu ürünü silmek istiyor musunuz?' },
  productNameRequired: { ar: 'اسم المنتج والسعر مطلوبان', tr: 'Ürün adı ve fiyat zorunludur' },

  // Admin Categories page
  adminCategoriesTitle: { ar: 'الأصناف', tr: 'Kategoriler' },
  adminCategoriesCount: { ar: 'صنف', tr: 'kategori' },
  addCategory: { ar: 'إضافة صنف', tr: 'Kategori Ekle' },
  noCategories: { ar: 'لا توجد أصناف', tr: 'Kategori bulunamadı' },
  colIcon: { ar: 'الأيقونة', tr: 'İkon' },
  colName: { ar: 'الاسم', tr: 'Ad' },
  colOrder: { ar: 'الترتيب', tr: 'Sıra' },
  addCategoryTitle: { ar: 'إضافة صنف', tr: 'Kategori Ekle' },
  editCategoryTitle: { ar: 'تعديل الصنف', tr: 'Kategoriyi Düzenle' },
  categoryNameAr: { ar: 'الاسم بالعربية *', tr: 'Arapça Ad *' },
  categoryNameTr: { ar: 'الاسم بالتركية', tr: 'Türkçe Ad' },
  categoryIcon: { ar: 'أيقونة / صورة الصنف', tr: 'Kategori İkonu / Görseli' },
  sortOrder: { ar: 'الترتيب', tr: 'Sıra' },
  confirmDeleteCategory: { ar: 'حذف الصنف؟', tr: 'Kategori silinsin mi?' },
  categoryNameRequired: { ar: 'الاسم مطلوب', tr: 'Ad zorunludur' },

  // Admin Offers page
  adminOffersTitle: { ar: 'العروض والاختيارات', tr: 'Kampanyalar ve Seçimler' },
  tabOffers: { ar: 'العروض', tr: 'Kampanyalar' },
  tabPicks: { ar: 'الاختيارات اليومية', tr: 'Günlük Seçimler' },
  addOffer: { ar: 'إضافة عرض', tr: 'Kampanya Ekle' },
  addPick: { ar: 'إضافة اختيار', tr: 'Seçim Ekle' },
  noDescription: { ar: 'بدون وصف', tr: 'Açıklama yok' },
  addOfferTitle: { ar: 'إضافة عرض', tr: 'Kampanya Ekle' },
  editOfferTitle: { ar: 'تعديل العرض', tr: 'Kampanyayı Düzenle' },
  offerImage: { ar: 'صورة العرض', tr: 'Kampanya Görseli' },
  imageUrl: { ar: 'رابط الصورة (أو ارفع)', tr: 'Görsel URL (veya yükle)' },
  offerDescription: { ar: 'الوصف', tr: 'Açıklama' },
  addPickTitle: { ar: 'إضافة اختيار', tr: 'Seçim Ekle' },
  editPickTitle: { ar: 'تعديل الاختيار', tr: 'Seçimi Düzenle' },
  colPick: { ar: 'الاختيار', tr: 'Seçim' },
  confirmDeleteOffer: { ar: 'حذف العرض؟', tr: 'Kampanya silinsin mi?' },
  confirmDeletePick: { ar: 'حذف الاختيار؟', tr: 'Seçim silinsin mi?' },
  imageRequired: { ar: 'رابط الصورة مطلوب', tr: 'Görsel URL zorunludur' },
  titleRequired: { ar: 'العنوان مطلوب', tr: 'Başlık zorunludur' },
  pickTitleAr: { ar: 'العنوان بالعربية *', tr: 'Arapça Başlık *' },
  pickTitleTr: { ar: 'العنوان بالتركية', tr: 'Türkçe Başlık' },
  pickSubtitleAr: { ar: 'الوصف بالعربية', tr: 'Arapça Açıklama' },
  pickSubtitleTr: { ar: 'الوصف بالتركية', tr: 'Türkçe Açıklama' },
  pickPrice: { ar: 'السعر', tr: 'Fiyat' },
  pickEmoji: { ar: 'الإيموجي', tr: 'Emoji' },

  // Admin Slides page
  adminSlidesTitle: { ar: 'السلايدات (Hero)', tr: 'Slaytlar (Hero)' },
  adminSlidesCount: { ar: 'سلايد', tr: 'slayt' },
  addSlide: { ar: 'إضافة سلايد', tr: 'Slayt Ekle' },
  noSlides: { ar: 'لا يوجد سلايدات', tr: 'Slayt bulunamadı' },
  noImage: { ar: 'لا صورة', tr: 'Görsel yok' },
  colImage: { ar: 'الصورة', tr: 'Görsel' },
  colTitleSubtitle: { ar: 'العنوان / النص الفرعي', tr: 'Başlık / Alt Metin' },
  addSlideTitle: { ar: 'إضافة سلايد', tr: 'Slayt Ekle' },
  editSlideTitle: { ar: 'تعديل السلايد', tr: 'Slaytı Düzenle' },
  slideImage: { ar: 'صورة السلايد *', tr: 'Slayt Görseli *' },
  slideTitleAr: { ar: 'العنوان الرئيسي بالعربية *', tr: 'Arapça Ana Başlık *' },
  slideTitleTr: { ar: 'العنوان الرئيسي بالتركية', tr: 'Türkçe Ana Başlık' },
  slideSubtitleAr: { ar: 'النص الفرعي بالعربية', tr: 'Arapça Alt Metin' },
  slideSubtitleTr: { ar: 'النص الفرعي بالتركية', tr: 'Türkçe Alt Metin' },
  confirmDeleteSlide: { ar: 'هل تريد حذف هذا السلايد؟', tr: 'Bu slaytı silmek istiyor musunuz?' },
  slideImageRequired: { ar: 'صورة السلايد مطلوبة', tr: 'Slayt görseli zorunludur' },
  slideTitleRequired: { ar: 'عنوان السلايد مطلوب', tr: 'Slayt başlığı zorunludur' },

  // Admin Dashboard (main page)
  dashboardTitle: { ar: 'لوحة التحكم', tr: 'Kontrol Paneli' },
  dashboardWelcome: { ar: 'مرحباً بك في لوحة إدارة Mocha Point', tr: 'Mocha Point Yönetim Paneline Hoşgeldiniz' },
  statTotalProducts: { ar: 'إجمالي المنتجات', tr: 'Toplam Ürünler' },
  statTotalCategories: { ar: 'إجمالي الأصناف', tr: 'Toplam Kategoriler' },
  statActiveOffers: { ar: 'العروض النشطة', tr: 'Aktif Kampanyalar' },
  recentActivities: { ar: 'آخر النشاطات', tr: 'Son Aktiviteler' },
  noActivities: { ar: 'لا توجد نشاطات بعد', tr: 'Henüz aktivite yok' },
  auditProductCreate: { ar: 'أضاف منتجاً', tr: 'Ürün ekledi' },
  auditProductUpdate: { ar: 'عدّل منتجاً', tr: 'Ürün güncelledi' },
  auditProductDelete: { ar: 'حذف منتجاً', tr: 'Ürün sildi' },
  auditCategoryCreate: { ar: 'أضاف صنفاً', tr: 'Kategori ekledi' },
  auditCategoryUpdate: { ar: 'عدّل صنفاً', tr: 'Kategori güncelledi' },
  auditCategoryDelete: { ar: 'حذف صنفاً', tr: 'Kategori sildi' },
  auditOfferCreate: { ar: 'أضاف عرضاً', tr: 'Kampanya ekledi' },
  auditOfferUpdate: { ar: 'عدّل عرضاً', tr: 'Kampanya güncelledi' },
  auditOfferDelete: { ar: 'حذف عرضاً', tr: 'Kampanya sildi' },
  auditLoginSuccess: { ar: 'سجّل دخولاً', tr: 'Giriş yaptı' },
  auditOtpSent: { ar: 'طلب رمز تحقق', tr: 'Doğrulama kodu istedi' },

  // Admin Reviews page
  adminReviewsTitle: { ar: 'التقييمات', tr: 'Değerlendirmeler' },
  adminReviewsCount: { ar: 'تقييم', tr: 'değerlendirme' },
  addReview: { ar: 'إضافة تقييم', tr: 'Değerlendirme Ekle' },
  noReviews: { ar: 'لا توجد تقييمات', tr: 'Değerlendirme bulunamadı' },
  colName: { ar: 'الاسم', tr: 'Ad' },
  colRating: { ar: 'التقييم', tr: 'Puan' },
  colComment: { ar: 'التعليق', tr: 'Yorum' },
  statusVisible: { ar: 'ظاهر', tr: 'Görünür' },
  addReviewTitle: { ar: 'إضافة تقييم', tr: 'Değerlendirme Ekle' },
  editReviewTitle: { ar: 'تعديل التقييم', tr: 'Değerlendirmeyi Düzenle' },
  reviewName: { ar: 'الاسم *', tr: 'Ad *' },
  reviewNamePlaceholder: { ar: 'اسم العميل', tr: 'Müşteri adı' },
  reviewRating: { ar: 'التقييم (1-5) *', tr: 'Puan (1-5) *' },
  reviewComment: { ar: 'التعليق *', tr: 'Yorum *' },
  reviewCommentPlaceholder: { ar: 'اكتب تعليق العميل هنا...', tr: 'Müşteri yorumunu buraya yazın...' },
  reviewVisible: { ar: 'يظهر في الصفحة الرئيسية', tr: 'Ana sayfada göster' },
  confirmDeleteReview: { ar: 'هل أنت متأكد من حذف هذا التقييم؟', tr: 'Bu değerlendirmeyi silmek istediğinizden emin misiniz?' },
  reviewNameRequired: { ar: 'الاسم مطلوب', tr: 'Ad zorunludur' },
  reviewCommentRequired: { ar: 'التعليق مطلوب', tr: 'Yorum zorunludur' },
  reviewRatingRequired: { ar: 'التقييم يجب أن يكون بين 1 و 5', tr: 'Puan 1 ile 5 arasında olmalıdır' },
  reviewCommentAr: { ar: 'التعليق بالعربية *', tr: 'Arapça Yorum *' },
  reviewCommentTr: { ar: 'التعليق بالتركية', tr: 'Türkçe Yorum' },
  reviewCommentArPlaceholder: { ar: 'اكتب تعليق العميل بالعربية...', tr: 'Müşteri yorumunu Arapça yazın...' },
  reviewCommentTrPlaceholder: { ar: 'اكتب تعليق العميل بالتركية...', tr: 'Müşteri yorumunu Türkçe yazın...' },

  // Admin Orders page
  adminOrdersTitle: { ar: 'إدارة الطلبات', tr: 'Sipariş Yönetimi' },
  refreshData: { ar: 'تحديث البيانات', tr: 'Verileri Yenile' },
  noOrders: { ar: 'لا توجد طلبات حالياً', tr: 'Şu an sipariş bulunmuyor' },
  orderNumber: { ar: 'رقم الطلب', tr: 'Sipariş No' },
  tableNumber: { ar: 'الطاولة', tr: 'Masa' },
  orderTime: { ar: 'الوقت', tr: 'Zaman' },
  colProduct: { ar: 'المنتج', tr: 'Ürün' },
  colQuantity: { ar: 'الكمية', tr: 'Adet' },
  colPrice: { ar: 'السعر', tr: 'Fiyat' },
  colTotal: { ar: 'الإجمالي', tr: 'Toplam' },
  grandTotal: { ar: 'المجموع الكلي:', tr: 'Genel Toplam:' },
  statusPending: { ar: 'قيد الانتظار', tr: 'Beklemede' },
  statusPreparing: { ar: 'قيد التجهيز', tr: 'Hazırlanıyor' },
  statusCompleted: { ar: 'مكتمل', tr: 'Tamamlandı' },
  statusCancelled: { ar: 'ملغي', tr: 'İptal Edildi' },
  confirmDeleteOrder: { ar: 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.', tr: 'Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.' },

  // Admin Contact page
  adminContactTitle: { ar: 'إدارة التواصل', tr: 'İletişim Yönetimi' },
  addNew: { ar: 'إضافة جديد', tr: 'Yeni Ekle' },
  colType: { ar: 'النوع', tr: 'Tür' },
  colTitleAr: { ar: 'العنوان (عربي)', tr: 'Başlık (Arapça)' },
  colDetails: { ar: 'التفاصيل', tr: 'Detaylar' },
  colIcon: { ar: 'الأيقونة', tr: 'İkon' },
  colOrder: { ar: 'الترتيب', tr: 'Sıra' },
  typeAddress: { ar: 'عنوان', tr: 'Adres' },
  typePhone: { ar: 'رقم هاتف', tr: 'Telefon' },
  addContactTitle: { ar: 'إضافة عنصر جديد', tr: 'Yeni Öğe Ekle' },
  editContactTitle: { ar: 'تعديل العنصر', tr: 'Öğeyi Düzenle' },
  contactType: { ar: 'النوع', tr: 'Tür' },
  contactTitleAr: { ar: 'العنوان بالعربية', tr: 'Arapça Başlık' },
  contactTitleTr: { ar: 'العنوان بالتركية', tr: 'Türkçe Başlık' },
  contactDetailAr: { ar: 'التفاصيل بالعربية', tr: 'Arapça Detaylar' },
  contactDetailTr: { ar: 'التفاصيل بالتركية', tr: 'Türkçe Detaylar' },
  contactIcon: { ar: 'الأيقونة', tr: 'İkon' },
  confirmDeleteContact: { ar: 'هل أنت متأكد من حذف هذا العنصر؟', tr: 'Bu öğeyi silmek istediğinizden emin misiniz?' },
  iconMapPin: { ar: 'دبوس خريطة (MapPin)', tr: 'Harita İğnesi (MapPin)' },
  iconBuilding: { ar: 'مبنى (Building2)', tr: 'Bina (Building2)' },
  iconPhone: { ar: 'هاتف (Phone)', tr: 'Telefon (Phone)' },
  iconUser: { ar: 'مستخدم (User)', tr: 'Kullanıcı (User)' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && (storedLang === 'ar' || storedLang === 'tr')) {
      setLangState(storedLang);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }, [lang, mounted]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key; // Fallback to key if translation not found
  };

  // Prevent hydration mismatch by returning null until mounted, or just render with default ar but we handled document.dir in useEffect.
  // We'll render children normally but the context value will be available.
  
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
