import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../lib/translations';
import { Volume2, VolumeX, Play, Square, Info, Award, HelpCircle, CheckCircle } from 'lucide-react';

interface GuideAndVoiceProps {
  language: 'tr' | 'en' | 'de';
}

export default function GuideAndVoice({ language }: GuideAndVoiceProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('akn_guide_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [isReading, setIsReading] = useState<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('akn_guide_muted', String(isMuted));
    } catch (e) {
      console.error(e);
    }
    if (isMuted) {
      handleStop();
    }
  }, [isMuted]);

  // Handle voices loading on some platforms
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      handleStop();
    };
  }, []);

  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Pick correct language code
    let langCode = 'tr-TR';
    if (language === 'en') langCode = 'en-US';
    else if (language === 'de') langCode = 'de-DE';
    
    utterance.lang = langCode;

    // Load matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(language));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsReading(true);
    };
    utterance.onend = () => {
      setIsReading(false);
    };
    utterance.onerror = () => {
      setIsReading(false);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  };

  const steps = [
    { id: 1, title: t.guideStep1Title, desc: t.guideStep1Desc },
    { id: 2, title: t.guideStep2Title, desc: t.guideStep2Desc },
    { id: 3, title: t.guideStep3Title, desc: t.guideStep3Desc },
    { id: 4, title: t.guideStep4Title, desc: t.guideStep4Desc },
    { id: 5, title: t.guideStep5Title, desc: t.guideStep5Desc },
    { id: 6, title: t.guideStep6Title, desc: t.guideStep6Desc }
  ];

  const handleSelectStep = (stepId: number) => {
    setActiveStep(stepId);
    const step = steps.find(s => s.id === stepId);
    if (step) {
      handleSpeakText(`${step.title}. ${step.desc}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {t.tabGuide}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{t.guideTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.guideSubtitle}</p>
        </div>

        {/* Voice Assistant Controller */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-2xl shadow-md">
          <div className="shrink-0 h-10 w-10 bg-indigo-505/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-400/20">
            {isMuted ? <VolumeX className="h-5 w-5 text-red-400 animate-pulse" /> : <Volume2 className="h-5 w-5 text-emerald-400 animate-bounce" />}
          </div>
          <div className="text-left select-none pr-2">
            <span className="text-[9px] font-mono block text-indigo-300 uppercase font-bold tracking-wider">{t.guideVoiceAssistantTitle}</span>
            <span className="text-xs font-black block font-sans">
              {isReading ? (
                <span className="text-emerald-400 animate-pulse">● {t.guideIsReadingStatus}</span>
              ) : (
                <span className="text-slate-400">{isMuted ? t.guideIsMutedStatus : 'Bekor (Hazır)'}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            {/* Tone Toggle */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-rose-950 text-rose-300 border border-rose-900/30' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-900/40'
              }`}
              title={isMuted ? t.guideMuteButton : t.guideUnmuteButton}
            >
              {isMuted ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
            </button>

            {/* Stop Voice */}
            {isReading && (
              <button
                onClick={handleStop}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl transition cursor-pointer border border-slate-700/40"
                title={t.guideStopVoiceBtn}
              >
                <Square className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs bg-indigo-50/70 text-indigo-800 py-3 px-4 rounded-xl border border-indigo-100 flex items-center gap-2.5 font-medium leading-relaxed font-sans">
        <Info className="h-4.5 w-4.5 shrink-0 text-indigo-500 animate-bounce" />
        <span>{t.guideClickReadLabel}</span>
      </p>

      {/* Structured Sequence Flow-Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {steps.map((step) => {
          const isSelected = activeStep === step.id;
          return (
            <div
              key={step.id}
              onClick={() => handleSelectStep(step.id)}
              className={`group flex flex-col justify-between border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 select-none text-left relative overflow-hidden h-full ${
                isSelected 
                  ? "border-indigo-600 bg-indigo-50/15 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20" 
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-dashed border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-8 w-8 text-xs font-bold font-mono rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {step.id}
                    </span>
                    <h2 className={`text-sm font-black transition-colors ${
                      isSelected ? "text-indigo-900" : "text-slate-800 group-hover:text-slate-900"
                    }`}>
                      {step.title}
                    </h2>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-indigo-600 animate-ping" : "bg-slate-350"}`} />
                </div>
                
                <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans font-medium mb-4">
                  {step.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 mt-2">
                <span className="text-[10px] text-slate-400 font-bold tracking-wide font-mono uppercase">
                  {isSelected ? `${t.guideIsReadingStatus} / Playback` : "Click to read"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectStep(step.id);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wide transition-all uppercase cursor-pointer flex items-center gap-1 ${
                    isSelected 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-50 hover:bg-slate-100 text-slate-650"
                  }`}
                >
                  <Play className={`h-3 w-3 ${isSelected ? 'fill-white' : ''}`} />
                  <span>{t.guideReadAloudBtn}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Info Widget */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left flex flex-col sm:flex-row items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
          <Award className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Tam Entegre Çevrimdışı Tasarım</h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            Bu portal ve kılavuz tamamen ücretsiz kalarak açık kaynak ilkeleriyle çalışabilmektedir. Sıfır sunucu, sıfır kod sınırları, bağımsız SQLite motoru ve HTML5 standart ses sentezi ile internete bile ihtiyaç duymadan cihazınızda çalışabilir.
          </p>
        </div>
      </div>

    </div>
  );
}
