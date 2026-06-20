import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';

interface ContactProps {
  brandName?: string;
}

export default function Contact({ brandName = 'AKN Global Group Ltd' }: ContactProps) {
  const whatsappNumber = '905425783748';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          İletişim Merkezi
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Bizimle İletişime Geçin</h1>
        <p className="text-sm text-slate-500 mt-1">Sorularınız, önerileriniz veya destek talebiniz için bize ulaşabilirsiniz.</p>
      </div>

      {/* Main Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WhatsApp Card - Primary */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-500 p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
          
          <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">WhatsApp</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              En hızlı şekilde WhatsApp aracılığıyla bize mesaj gönderin. Anında yanıt alırsınız.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-700">
                <Phone className="h-5 w-5" />
                +90 542 578 3748
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                Pazartesi - Cuma: 09:00 - 18:00
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-lg group-hover:bg-emerald-600 transition-colors">
              Mesaj Gönder →
            </div>
          </div>
        </a>

        {/* Email Card */}
        <a
          href="mailto:support@aknglobal.com"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-500 p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
          
          <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Mail className="h-8 w-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">E-Posta</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Resmi sorularınız için e-posta gönderin. Detaylı yanıt ve dokümantasyon almak için en iyi yöntem.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-indigo-700 break-all">
                <Mail className="h-5 w-5 shrink-0" />
                support@aknglobal.com
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                24 saat içinde yanıt
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-lg group-hover:bg-indigo-600 transition-colors">
              E-Posta Gönder →
            </div>
          </div>
        </a>

        {/* Phone Card */}
        <a
          href="tel:+905425783748"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300" />
          
          <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Phone className="h-8 w-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Telefon</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Acil durumlar veya canlı destek için doğrudan telefonla arayın. Özel destek ekibi hazır.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-blue-700">
                <Phone className="h-5 w-5" />
                +90 542 578 3748
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                Pazartesi - Cuma: 09:00 - 18:00
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-blue-500 text-white font-bold rounded-lg group-hover:bg-blue-600 transition-colors">
              Ara →
            </div>
          </div>
        </a>

        {/* Address Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-500 p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-lg">
              <MapPin className="h-8 w-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ofis Adresi</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Fiziksel şube ziyareti için adresi kullanabilirsiniz.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-amber-700 font-semibold">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  İstanbul, Türkiye<br />
                  {brandName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                Pazartesi - Cuma: 09:00 - 18:00
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg opacity-75 cursor-not-allowed">
              Harita Aç →
            </div>
          </div>
        </div>

      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Sık Sorulan Sorular</h2>
        
        <div className="space-y-6">
          
          {/* FAQ Item 1 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">WhatsApp'tan kaç saat içinde yanıt alırım?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              WhatsApp mesajlarına genellikle 30 dakika içinde yanıt veriyoruz. İş saatleri dışında gelen mesajlara sabah ilk saatlerde yanıt verilir.
            </p>
          </div>

          {/* FAQ Item 2 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Lisans yenilemesi için nasıl iletişime geçeceğim?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Lisans yenileme talepleri için lütfen WhatsApp ya da e-posta yoluyla bize ulaşın. Cihaz kimliğinizi (Device ID) önceden hazırlayarak başvuru yapabilirsiniz.
            </p>
          </div>

          {/* FAQ Item 3 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Teknik sorun yaşıyorum, ne yapmalıyım?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Teknik sorunlar için direkt olarak WhatsApp üzerinden bizimle iletişim kurun. Cihaz ID'niz, sorun tanımı ve ekran görüntüsü gönderin. Hızlıca çözüm sunmaya çalışırız.
            </p>
          </div>

          {/* FAQ Item 4 */}
          <div className="pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Yeni özellikleri önerebilir miyim?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Elbette! Ürün iyileştirme önerileri ve geri bildirimi her zaman kabul ediyoruz. WhatsApp üzerinden fikirlerinizi paylaşabilirsiniz.
            </p>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-lg border border-slate-800">
        <h2 className="text-2xl font-bold mb-3">En Hızlı Çözüm: WhatsApp</h2>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Sorunuzu saniyeler içinde çözmek için WhatsApp üzerinden bize yazın. Ekibimiz her zaman yardımcı olmaya hazır.
        </p>
        
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-150 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="h-5 w-5" />
          Hemen WhatsApp'dan Yaz
        </a>
      </div>

    </div>
  );
}
