import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';

interface ContactProps {
  brandName?: string;
  language?: 'tr' | 'en' | 'de';
}

export default function Contact({ brandName = 'AKN Global Group Ltd', language = 'tr' }: ContactProps) {
  const whatsappNumber = '905425783748';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const isTr = language === 'tr';
  const isDe = language === 'de';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          {isTr ? 'İletişim Merkezi' : isDe ? 'Kontaktzentrum' : 'Contact Center'}
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {isTr ? 'Bizimle İletişime Geçin' : isDe ? 'Kontaktieren Sie uns' : 'Get in Touch'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isTr 
            ? 'Sorularınız, önerileriniz veya destek talebiniz için bize ulaşabilirsiniz.' 
            : isDe 
              ? 'Für Ihre Fragen, Vorschläge oder Supportanfragen können Sie uns kontaktieren.' 
              : 'You can reach us for your questions, suggestions or support requests.'}
        </p>
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
              {isTr 
                ? 'En hızlı şekilde WhatsApp aracılığıyla bize mesaj gönderin. Anında yanıt alırsınız.' 
                : isDe 
                  ? 'Senden Sie uns am schnellsten eine Nachricht über WhatsApp. Sie erhalten sofort eine Antwort.' 
                  : 'Send us a message via WhatsApp in the fastest way. You receive an instant response.'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-700">
                <Phone className="h-5 w-5" />
                +90 542 578 3748
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                {isTr ? 'Pazartesi - Cuma: 09:00 - 18:00' : isDe ? 'Montag - Freitag: 09:00 - 18:00' : 'Monday - Friday: 09:00 - 18:00'}
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-lg group-hover:bg-emerald-600 transition-colors">
              {isTr ? 'Mesaj Gönder →' : isDe ? 'Nachricht senden →' : 'Send Message →'}
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
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{isTr ? 'E-Posta' : isDe ? 'E-Mail' : 'Email'}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {isTr 
                ? 'Resmi sorularınız için e-posta gönderin. Detaylı yanıt ve dokümantasyon almak için en iyi yöntem.' 
                : isDe 
                  ? 'Senden Sie eine E-Mail für Ihre offiziellen Anfragen. Die beste Methode für detaillierte Antworten.' 
                  : 'Send an email for official inquiries. The best method for detailed replies.'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-indigo-700 break-all">
                <Mail className="h-5 w-5 shrink-0" />
                support@aknglobal.com
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                {isTr ? '24 saat içinde yanıt' : isDe ? 'Antwort innerhalb von 24h' : 'Response within 24 hours'}
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-lg group-hover:bg-indigo-600 transition-colors">
              {isTr ? 'E-Posta Gönder →' : isDe ? 'E-Mail senden →' : 'Send Email →'}
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
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{isTr ? 'Telefon' : isDe ? 'Telefon' : 'Phone'}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {isTr 
                ? 'Acil durumlar veya canlı destek için doğrudan telefonla arayın. Özel destek ekibi hazır.' 
                : isDe 
                  ? 'Rufen Sie uns direkt an bei Notfällen oder für Live-Unterstützung.' 
                  : 'Call directly for emergencies or live support. Dedicated team ready.'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-blue-700">
                <Phone className="h-5 w-5" />
                +90 542 578 3748
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                {isTr ? 'Pazartesi - Cuma: 09:00 - 18:00' : isDe ? 'Montag - Freitag: 09:00 - 18:00' : 'Monday - Friday: 09:00 - 18:00'}
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-blue-500 text-white font-bold rounded-lg group-hover:bg-blue-600 transition-colors">
              {isTr ? 'Ara →' : isDe ? 'Anrufen →' : 'Call →'}
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
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{isTr ? 'Ofis Adresi' : isDe ? 'Büroadresse' : 'Office Address'}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {isTr ? 'Fiziksel şube ziyareti için adresi kullanabilirsiniz.' : isDe ? 'Sie können diese Adresse für Filialbesuche nutzen.' : 'You can use this address for physical site visits.'}
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
                {isTr ? 'Pazartesi - Cuma: 09:00 - 18:00' : isDe ? 'Montag - Freitag: 09:00 - 18:00' : 'Monday - Friday: 09:00 - 18:00'}
              </div>
            </div>

            <div className="mt-6 inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg opacity-75 cursor-not-allowed">
              {isTr ? 'Harita Aç →' : isDe ? 'Karte öffnen →' : 'Open Map →'}
            </div>
          </div>
        </div>

      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          {isTr ? 'Sık Sorulan Sorular' : isDe ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
        </h2>
        
        <div className="space-y-6">
          
          {/* FAQ Item 1 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">
              {isTr 
                ? "WhatsApp'tan kaç saat içinde yanıt alırım?" 
                : isDe 
                  ? 'Wie schnell antworten Sie auf WhatsApp?' 
                  : 'Within how many hours do I get a reply on WhatsApp?'}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isTr 
                ? 'WhatsApp mesajlarına genellikle 30 dakika içinde yanıt veriyoruz. İş saatleri dışında gelen mesajlara sabah ilk saatlerde yanıt verilir.' 
                : isDe 
                  ? 'Wir antworten in der Regel innerhalb von 30 Minuten auf WhatsApp. Außerhalb der Arbeitszeiten eingehende Nachrichten werden am nächsten Morgen beantwortet.' 
                  : 'We usually respond to WhatsApp messages within 30 minutes. Messages arriving outside office hours are answered first thing in the morning.'}
            </p>
          </div>

          {/* FAQ Item 2 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">
              {isTr 
                ? 'Lisans yenilemesi için nasıl iletişime geçeceğim?' 
                : isDe 
                  ? 'Wie kontaktiere ich Sie für Lizenzverlängerungen?' 
                  : 'How do I contact for license renewal?'}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isTr 
                ? 'Lisans yenileme talepleri için lütfen WhatsApp ya da e-posta yoluyla bize ulaşın. Cihaz kimliğinizi (Device ID) önceden hazırlayarak başvuru yapabilirsiniz.' 
                : isDe 
                  ? 'Bitte kontaktieren Sie uns über WhatsApp oder E-Mail. Halten Sie Ihre Geräte-ID bereit.' 
                  : 'Please contact us via WhatsApp or email for license renewal requests. You can apply with your Device ID ready.'}
            </p>
          </div>

          {/* FAQ Item 3 */}
          <div className="border-b border-slate-100 pb-6 last:border-0">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">
              {isTr 
                ? 'Teknik sorun yaşıyorum, ne yapmalıyım?' 
                : isDe 
                  ? 'Ich habe technische Störungen, was soll ich tun?' 
                  : 'I have a technical issue, what should I do?'}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isTr 
                ? "Teknik sorunlar için direkt olarak WhatsApp üzerinden bizimle iletişim kurun. Cihaz ID'niz, sorun tanımı ve ekran görüntüsü gönderin. Hızlıca çözüm sunmaya çalışırız." 
                : isDe 
                  ? 'Wenden Sie sich direkt über WhatsApp an uns. Senden Sie uns Ihre Geräte-ID, eine Problembeschreibung und einen Screenshot.' 
                  : 'Directly contact us through WhatsApp for technical issues. Send your Device ID, a description and a screenshot. We will troubleshoot immediately.'}
            </p>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-lg border border-slate-800">
        <h2 className="text-2xl font-bold mb-3">{isTr ? 'En Hızlı Çözüm: WhatsApp' : isDe ? 'Schnellste Lösung: WhatsApp' : 'Fastest Solution: WhatsApp'}</h2>
        <p className="text-slate-300 mb-6 leading-relaxed">
          {isTr 
            ? 'Sorunuzu saniyeler içinde çözmek için WhatsApp üzerinden bize yazın. Ekibimiz her zaman yardımcı olmaya hazır.' 
            : isDe 
              ? 'Schreiben Sie uns auf WhatsApp, um Ihre Frage in Sekundenschnelle zu lösen.' 
              : 'Write to us on WhatsApp to solve your question in seconds. Our team is always ready to assist.'}
        </p>
        
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-150 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="h-5 w-5" />
          {isTr ? 'Hemen WhatsApp\'dan Yaz' : isDe ? 'Jetzt auf WhatsApp Chatten' : 'Chat on WhatsApp Now'}
        </a>
      </div>

    </div>
  );
}
