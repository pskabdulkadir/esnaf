import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ExternalLink, 
  MessageCircle,
  Zap,
  BarChart3,
  Smartphone,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function HelpCenter() {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const sections = [
    {
      id: 1,
      title: "🚀 Hızlı Başlangıç: Google'a Bağlanma (3 Adım)",
      icon: Zap,
      content: (
        <div className="space-y-6">
          {/* Adım 1 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-blue-900 mb-2">
                  Google Analytics Kimliğini Hazırla
                </h4>
                <ol className="space-y-2 text-xs text-blue-800 list-decimal list-inside">
                  <li>
                    <a 
                      href="https://analytics.google.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      analytics.google.com
                    </a>
                    {' '}adresine git
                  </li>
                  <li>Sol tarafta <strong>"Yönetici"</strong> seçeneğine tıkla</li>
                  <li><strong>"Veri Akışları"</strong> bölümünü aç</li>
                  <li><strong>"Web"</strong>'i seç</li>
                  <li>Sağ tarafta <strong>"Ölçüm Kimliği"</strong>'ni bul (G- ile başlar)</li>
                  <li>Kimliği <strong>kopyala</strong> (Ctrl+C / Cmd+C)</li>
                </ol>
                <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                  <p className="text-[11px] font-mono text-blue-700">
                    📋 Örnek: <strong>G-9K7EFX8ZVL</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 2 */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-orange-600 text-white font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-orange-900 mb-2">
                  Google Ads Dönüşüm Kimliğini Hazırla
                </h4>
                <ol className="space-y-2 text-xs text-orange-800 list-decimal list-inside">
                  <li>
                    <a 
                      href="https://ads.google.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline font-semibold"
                    >
                      ads.google.com
                    </a>
                    {' '}adresine git
                  </li>
                  <li>Sol üst köşede <strong>hesap menüsü</strong>nü aç (3 çizgi icon)</li>
                  <li><strong>"Kurulum"</strong> bölümüne gir</li>
                  <li><strong>"Bağlantılı Hesaplar"</strong> veya <strong>"Dönüşüm İzleme"</strong>'ye tıkla</li>
                  <li><strong>"Hesap Kimliği"</strong>'ni bul (AW- ile başlar)</li>
                  <li>Kimliği <strong>kopyala</strong> (Ctrl+C / Cmd+C)</li>
                </ol>
                <div className="mt-3 p-2 bg-white rounded border border-orange-200">
                  <p className="text-[11px] font-mono text-orange-700">
                    📋 Örnek: <strong>AW-384910248</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 3 */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-emerald-900 mb-2">
                  Sihirbazı Kullanarak Bağlantıyı Tamamla
                </h4>
                <ol className="space-y-2 text-xs text-emerald-800 list-decimal list-inside">
                  <li>Bu uygulamada <strong>"Pazarlama"</strong> sekmesine gir</li>
                  <li><strong>"Reklam Ayarları"</strong> butonuna tıkla</li>
                  <li><strong>"Google Entegrasyon Sihirbazı"</strong>'na gir</li>
                  <li>Kopyaladığın Google Analytics kimliğini (G-...) <strong>ilk alana yapıştır</strong></li>
                  <li>Kopyaladığın Google Ads kimliğini (AW-...) <strong>ikinci alana yapıştır</strong></li>
                  <li><strong>"Bağlantıyı Tamamla ✨"</strong> butonuna bas</li>
                  <li>Sistem otomatik olarak yenilenecek ve entegrasyon aktif olacak ✅</li>
                </ol>
                <div className="mt-3 p-2 bg-emerald-100 rounded border border-emerald-300 flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Tamamlandı! Artık tüm satışlar otomatik olarak Google'da izlenecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "📊 Dashboard Nedir? Satışlarımı Nasıl Görebilirim?",
      icon: BarChart3,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            <strong>Dashboard</strong>, işletmenizin tüm performansını gösteren ana kontrol panelinidir.
          </p>
          <div className="bg-slate-100 p-3 rounded-lg space-y-2">
            <p className="font-semibold text-slate-900">Görebileceğiniz Bilgiler:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>📈 <strong>Günlük Satış Trendi</strong> - Grafikle satışlarınızın seyrini izleyin</li>
              <li>💰 <strong>Toplam Gelir</strong> - Bugün, bu ay, bu yıl kazandığınız para</li>
              <li>⚠️ <strong>Hızlı Bitecek Ürünler</strong> - Stoklamaya dikkat etmeniz gereken ürünler</li>
              <li>⭐ <strong>En Çok Satan Ürünler</strong> - Müşterilerin en çok ne aldığını görün</li>
            </ul>
          </div>
          <p className="text-[12px] text-slate-600 italic">
            💡 <strong>İpucu:</strong> Dashboard sayısı günlük güncellenir. Her sabah bu paneli kontrol ederek düşün ne satıp ne satmadığını öğrenebilirsiniz.
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: "💻 Stok Yönetimi Nasıl Yapılır?",
      icon: Smartphone,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="font-semibold text-indigo-900 mb-2">4 Basit Adımda Ürün Ekle:</p>
            <ol className="space-y-2 text-xs text-indigo-800 list-decimal list-inside">
              <li><strong>"Envanter"</strong> sekmesine gir</li>
              <li><strong>"Yeni Ürün Ekle"</strong> butonuna tıkla</li>
              <li>Ürün adı, fiyatı ve stok miktarını gir</li>
              <li><strong>"Kaydet"</strong> butonuna bas</li>
            </ol>
          </div>
          <p className="text-[12px] text-slate-600 italic">
            💡 <strong>İpucu:</strong> Stok limiti belirleyerek sistem size stok azaldığında uyarı verebilir.
          </p>
        </div>
      )
    },
    {
      id: 4,
      title: "🛍️ Satış Kaydı Nasıl Yapılır?",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            Müşteri her satın aldığında, sisteminize kaydetmek için bu adımları izleyin:
          </p>
          <div className="bg-green-50 p-3 rounded-lg">
            <ol className="space-y-2 text-xs text-green-800 list-decimal list-inside">
              <li><strong>"Satış"</strong> sekmesine gir</li>
              <li>Satın alınan <strong>ürünü seç</strong> (Barkod okut veya listeden seç)</li>
              <li><strong>Adet sayısını gir</strong></li>
              <li><strong>"Sepete Ekle"</strong> butonuna bas</li>
              <li>Satış bittiyse <strong>"Satışı Kaydet"</strong>'e tıkla</li>
            </ol>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
            <p className="text-[12px] text-amber-700 font-semibold">
              ⚠️ Önemli: Her satış kaydı otomatik olarak Dashboard'a yansır ve Google Analytics'e gönderilir.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "🗺️ Google Search Console'a Sitemap Gönderme (Son Adım!)",
      icon: BarChart3,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
            <p className="font-semibold text-indigo-900 mb-3">
              Bu adım, tüm ürünlerinizi Google Arama Sonuçlarında gösterir! 📍
            </p>
            <p className="text-xs text-indigo-800 mb-3">
              Sitemap, Google'a senin dükkanının haritası. Bu harita olmadan Google senin dükkanını bulamaz.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">1</span>
                Google Search Console'a Git
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                Şu linke tıkla ve Google hesapla oturum aç:
              </p>
              <a
                href="https://search.google.com/search-console/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-semibold"
              >
                search.google.com/search-console/ →
              </a>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">2</span>
                "Sitemap'lar" Sekmesine Tıkla
              </h4>
              <p className="text-xs text-slate-600">
                Sol taraftaki menüde <strong>"Sitemap'lar"</strong> (veya "Sitemaps") seçeneğini bul ve tıkla.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">3</span>
                "Yeni Sitemap Ekle" Kutucuğuna Tıkla
              </h4>
              <p className="text-xs text-slate-600">
                Sağ üst köşede <strong>"Yeni sitemap ekle"</strong> yazan gri kutucuk görünecek.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">4</span>
                Sitemap URL'sini Yapıştır
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                Şu URL'yi kopyala ve yapıştır:
              </p>
              <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono text-slate-800 break-all">
                sitemap.xml
              </code>
              <p className="text-[11px] text-slate-500 mt-2">
                (Sadece "sitemap.xml" yazman yeterli, bundan sonrası sistem tarafından otomatik ekleniyor)
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">5</span>
                "Gönder" Butonuna Bas
              </h4>
              <p className="text-xs text-slate-600">
                Hepsi bu! Google şimdi sitemapı alacak ve tüm ürünlerinizi taramaya başlayacak.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
            <p className="text-[12px] text-emerald-800 font-semibold flex gap-2">
              <span>✅</span>
              <span><strong>24-48 saat içinde</strong> tüm ürünleriniz Google Arama sonuçlarında görünmeye başlayacak!</span>
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
            <p className="text-[12px] text-amber-800 font-semibold">
              💡 <strong>Not:</strong> Bu işlemi bir kez yap, sonra otomatik olarak ürünler güncellenecek.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Yardım & Kullanım Kılavuzu
          </h1>
          <p className="text-slate-600">
            Sistemi %100 bağımsız olarak kullanmak için gereken tüm bilgiler burada
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === index;

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : index)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                      {section.title}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 space-y-4">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">
                Hala sorun mu yaşıyorsun?
              </h3>
              <p className="text-sm text-purple-800 mb-4">
                Bu kılavuzdan cevabını bulamadıysan, doğrudan temsilcimizle iletişime geç.
              </p>
              <a
                href="https://wa.me/905321112233?text=Merhaba%20AKN%20Global,%20sistemle%20ilgili%20sorularım%20var"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp'tan Yardım Al
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            ✨ <strong>Sistem Kurulumu Başarıyla Tamamlandı!</strong>
          </p>
          <p>
            Artık bağımsız olarak işletmenizi yönetebilir, satışlarınızı izleyebilir ve Google üzerinden reklam verebilirsiniz.
          </p>
          <p className="pt-2">
            💪 <strong>Başarılar dileriz!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
