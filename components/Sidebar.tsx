
import React, { useState } from 'react';
import { StoryAction } from '../types';
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
}

const Sidebar: React.FC<SidebarProps> = ({ onPrompt, onAction, isLoading, isInitial, onReset }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onPrompt(customPrompt);
      setCustomPrompt('');
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-orange-100 flex flex-col h-auto md:h-screen shadow-xl z-20">
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center">
          <CursorArrowRaysIcon className="h-4 w-4 mr-2" />
          कहानी नियंत्रण
        </h2>

        {/* Prompt Input */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-bold text-gray-700 mb-2 hindi-font">
              {isInitial ? 'अपनी कहानी का विषय लिखें:' : 'अगला मोड़ क्या होगा?'}
            </label>
            <textarea
              className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none hindi-font text-lg min-h-[120px]"
              placeholder={isInitial ? "जैसे: एक पुराने किले में छिपा खजाना..." : "लिखिए कहानी को आगे कैसे बढ़ाना है..."}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="mt-3 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span className="hindi-font">कहानी {isInitial ? 'शुरू करें' : 'बढ़ाएं'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        {!isInitial && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">त्वरित विकल्प (Quick Suggestions)</h3>
            {Object.values(StoryAction).map((action) => (
              <button
                key={action}
                onClick={() => onAction(action)}
                disabled={isLoading}
                className="w-full text-left p-3 bg-white border border-gray-100 hover:border-orange-300 hover:bg-orange-50 rounded-lg transition-all text-sm font-medium text-gray-700 flex items-center group"
              >
                <div className="h-2 w-2 rounded-full bg-orange-400 mr-3 group-hover:scale-150 transition-transform"></div>
                <span className="hindi-font">{action}</span>
              </button>
            ))}
          </div>
        )}

        {/* Extra Info / Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="text-blue-800 font-bold text-sm mb-1 flex items-center">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            सलाह
          </h4>
          <p className="text-xs text-blue-700 hindi-font">
            आप पात्रों के नाम, जगह और भावनाओं के बारे में विस्तार से बता सकते हैं।
          </p>
        </div>
      </div>

      {/* Footer Tools */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <button 
          onClick={onReset}
          className="text-gray-400 hover:text-red-500 transition-colors flex items-center text-sm font-medium"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          <span className="hindi-font">नई शुरुआत</span>
        </button>
        <div className="flex space-x-2">
           <FaceSmileIcon className="h-5 w-5 text-orange-300" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
