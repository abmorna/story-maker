
import React from 'react';
import { SparklesIcon, FireIcon, HeartIcon, MapIcon } from '@heroicons/react/24/outline';
import { Language, allTranslations } from '../translations';

interface Props {
  onStart: (prompt: string) => void;
  isLoading: boolean;
  lang: Language;
}

const EmptyState: React.FC<Props> = ({ onStart, isLoading, lang }) => {
  const t = allTranslations[lang];
  const icons = [
    <MapIcon className="h-5 w-5" />,
    <SparklesIcon className="h-5 w-5" />,
    <FireIcon className="h-5 w-5" />,
    <HeartIcon className="h-5 w-5" />
  ];
  const colors = ["text-indigo-400", "text-purple-400", "text-emerald-400", "text-rose-400"];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 space-y-12 py-12">
      <div className="space-y-6">
        {/* Glow effect background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            {t.emptyTitle}
          </h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
            {t.emptyDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full relative z-10">
        {t.suggestions.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onStart(item)}
            className="flex items-center space-x-5 p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left group"
          >
            <div className={`p-3 rounded-2xl bg-black/40 group-hover:scale-110 transition-transform ${colors[idx % colors.length]}`}>
              {icons[idx % icons.length]}
            </div>
            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
