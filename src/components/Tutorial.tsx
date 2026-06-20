import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  key: string;
  title: string;
  content: string;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Tutorial({ isOpen, onClose }: TutorialProps) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSynthesis] = useState(() => window.speechSynthesis);

  const tutorialSteps: TutorialStep[] = [
    {
      key: 'introduction',
      title: t('tutorial.introduction.title'),
      content: t('tutorial.introduction.content')
    },
    {
      key: 'storeSetup',
      title: t('tutorial.storeSetup.title'),
      content: t('tutorial.storeSetup.content')
    },
    {
      key: 'productManagement',
      title: t('tutorial.productManagement.title'),
      content: t('tutorial.productManagement.content')
    },
    {
      key: 'marketing',
      title: t('tutorial.marketing.title'),
      content: t('tutorial.marketing.content')
    },
    {
      key: 'whatsapp',
      title: t('tutorial.whatsapp.title'),
      content: t('tutorial.whatsapp.content')
    },
    {
      key: 'analytics',
      title: t('tutorial.analytics.title'),
      content: t('tutorial.analytics.content')
    }
  ];

  const currentContent = tutorialSteps[currentStep];

  const handleSpeak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (isMuted) return;

    const textToSpeak = `${currentContent.title}. ${currentContent.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const languageMap: { [key: string]: string } = {
      tr: 'tr-TR',
      en: 'en-US',
      de: 'de-DE'
    };

    utterance.lang = languageMap[i18n.language] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopSpeak();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{t('tutorial.title')}</h2>
            <p className="text-sm text-indigo-100 font-medium mt-0.5">
              {currentStep + 1} / {tutorialSteps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-500/30 p-2 rounded-lg transition-all cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">{currentContent.title}</h3>
            <p className="text-base text-slate-700 leading-relaxed">
              {currentContent.content}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              {isSpeaking ? t('voiceAssistant.speaking') : t('tutorial.title')}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer border ${
                isMuted
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  {t('voiceAssistant.muteButton')}
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  {t('voiceAssistant.speakButton')}
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeak}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-all cursor-pointer"
              >
                <VolumeX className="h-4 w-4" />
                Durdur
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
            {t('common.back')}
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-indigo-600 w-8'
                    : 'bg-slate-300 w-2 cursor-pointer hover:bg-slate-400'
                }`}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
            disabled={currentStep === tutorialSteps.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {t('common.next')}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
