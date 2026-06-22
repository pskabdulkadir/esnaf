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
  AlertCircle,
  HardDrive,
  Download,
  Upload
} from 'lucide-react';

export default function HelpCenter() {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const sections = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hızlı Yardım
          </h1>
          <p className="text-slate-600">
            Sorularınız için doğrudan bize ulaşın
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-4">
          <p className="text-slate-600">
            Detaylı talimatlar ve öğretim videoları için lütfen destek ekibiyle iletişime geçin.
          </p>
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
