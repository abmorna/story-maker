
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
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 space-y-16 py-12">
      <div className="space-y-8">
        <div className="relative inline-block">
            <div className="absolute -inset-10 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse"></div>
            <div className="relative w-64 h-64 overflow-hidden rounded-[40px] shadow-3xl border-2 border-white/10 transform -rotate-1 hover:rotate-0 transition-all duration-700 ring-1 ring-white/5">
               <img 
                src="https://images.unsplash.com/photo-1505634467193-4b47000840bc?auto=format&fit=crop&q=80&w=400" 
                alt="Story Atmosphere" 
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] to-transparent opacity-60"></div>
            </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            {t.emptyTitle}
          </h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
            {t.emptyDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
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
