
import React, { useState } from 'react';
import { StoryAction } from '../types';
import { Language, allTranslations } from '../translations';
import { 
  PlusIcon, 
  ArrowPathIcon, 
  ChatBubbleLeftRightIcon, 
  FaceSmileIcon,
  CursorArrowRaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onPrompt: (prompt: string) => void;
  onAction: (action: StoryAction) => void;
  isLoading: boolean;
  isInitial: boolean;
  onReset: () => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ onPrompt, onAction, isLoading, isInitial, onReset, lang }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const t = allTranslations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onPrompt(customPrompt);
      setCustomPrompt('');
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-[#111827] border-r border-white/5 flex flex-col h-auto md:h-screen shadow-2xl z-20 overflow-hidden">
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
          <CursorArrowRaysIcon className="h-4 w-4 mr-2 text-indigo-500" />
          {t.sidebarTitle}
        </h2>

        {/* Prompt Input */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-tighter">
              {isInitial ? t.storySubjectLabel : t.nextMoveLabel}
            </label>
            <textarea
              className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-100 text-md min-h-[140px] resize-none shadow-inner"
              placeholder={isInitial ? t.placeholderInitial : t.placeholderContinue}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 group"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 transition-transform group-hover:scale-125" />
                  <span>{isInitial ? t.btnStartStory : t.btnContinueStory}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        {!isInitial && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{t.quickSuggestionsTitle}</h3>
            {Object.values(StoryAction).map((action) => (
              <button
                key={action}
                onClick={() => onAction(action)}
                disabled={isLoading}
                className="w-full text-left p-4 bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-2xl transition-all text-sm font-medium text-slate-300 flex items-center group"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-4 group-hover:scale-150 transition-transform shadow-indigo-500 shadow-glow"></div>
                <span className="group-hover:text-white">{action}</span>
              </button>
            ))}
          </div>
        )}

        {/* Extra Info / Tips */}
        <div className="mt-8 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
          <h4 className="text-indigo-400 font-bold text-xs mb-2 flex items-center uppercase tracking-wider">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            {t.tipsTitle}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            {t.tipsDesc}
          </p>
        </div>
      </div>

      {/* Footer Tools */}
      <div className="p-5 border-t border-white/5 bg-black/20 flex items-center justify-between">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-red-400 transition-colors flex items-center text-xs font-bold uppercase tracking-tighter"
        >
          <XMarkIcon className="h-4 w-4 mr-1.5" />
          <span>{t.resetLabel}</span>
        </button>
        <div className="flex space-x-2">
           <FaceSmileIcon className="h-5 w-5 text-indigo-400/50" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
