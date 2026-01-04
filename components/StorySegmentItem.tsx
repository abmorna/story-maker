
import React, { useState } from 'react';
import { StorySegment } from '../types';
import { PencilIcon, CheckIcon, XMarkIcon, MicrophoneIcon, UserCircleIcon, TrashIcon, FaceSmileIcon } from '@heroicons/react/24/solid';

interface Props {
  segment: StorySegment;
  onSave: (newContent: string) => void;
  onDelete: () => void;
}

// Maps emotions to emojis
const getEmotionEmoji = (emotion: string = '') => {
  const e = emotion.toLowerCase();
  if (e.includes('क्रोध') || e.includes('angry')) return '😡';
  if (e.includes('दुख') || e.includes('sad')) return '😢';
  if (e.includes('खुशी') || e.includes('happy')) return '😊';
  if (e.includes('भय') || e.includes('fear') || e.includes('डर')) return '😨';
  if (e.includes('प्रेम') || e.includes('love')) return '❤️';
  if (e.includes('हैरानी') || e.includes('surprise')) return '😲';
  if (e.includes('चिंता') || e.includes('worried')) return '😟';
  return '🎭';
};

const getSpeakerStyle = (name: string) => {
  const isSutradhar = name === 'सूत्रधार' || name === 'Sutradhar' || !name;
  
  if (isSutradhar) {
    return {
      bg: 'bg-slate-700',
      text: 'text-slate-400',
      border: 'border-slate-800',
      lightBg: 'bg-slate-900/40',
      icon: 'text-slate-500'
    };
  }

  const colorPalette = [
    { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', lightBg: 'bg-rose-500/5', icon: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20', lightBg: 'bg-indigo-500/5', icon: 'text-white' },
    { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', lightBg: 'bg-emerald-500/5', icon: 'text-white' },
    { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', lightBg: 'bg-amber-500/5', icon: 'text-white' },
    { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/20', lightBg: 'bg-sky-500/5', icon: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/20', lightBg: 'bg-purple-500/5', icon: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/20', lightBg: 'bg-teal-500/5', icon: 'text-white' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const StorySegmentItem: React.FC<Props> = ({ segment, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(segment.content);
  const [isHovered, setIsHovered] = useState(false);

  const speakerName = segment.speaker || 'Sutradhar';
  const style = getSpeakerStyle(speakerName);
  const isSutradhar = speakerName === 'Sutradhar' || speakerName === 'सूत्रधार' || segment.type === 'narration';

  const handleSave = () => {
    if (editedContent.trim() !== "") {
      onSave(editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(segment.content);
    setIsEditing(false);
  };

  const formatContent = (text: string) => {
    return text.split(/(\[.*?\]|\(.*?\))/g).map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={i} className="text-indigo-400 font-bold italic text-[0.8em] mx-1 px-3 py-1 bg-white/5 rounded-lg border border-white/10 select-none inline-block align-middle shadow-lg">
            {part}
          </span>
        );
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={i} className="text-slate-400 italic font-medium text-[0.9em] mx-1 opacity-70">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`relative group w-full mb-12 transition-all duration-500 ${isSutradhar ? 'max-w-4xl mx-auto' : 'max-w-3xl ml-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col transition-all duration-500 ${isSutradhar ? 'items-center text-center' : `items-start pl-10 border-l-2 ${style.border} group-hover:border-l-4 group-hover:border-indigo-500/50`}`}>
        
        {/* Speaker Label & Emotion Badge */}
        <div className={`flex flex-wrap items-center gap-4 mb-5 ${isSutradhar ? 'justify-center' : ''}`}>
          <div className={`flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-2xl shadow-xl border border-white/5 group-hover:border-white/10 transition-colors`}>
            <div className={`p-1.5 rounded-xl ${style.bg} ${style.icon} shadow-lg shadow-black/20`}>
              {isSutradhar ? <MicrophoneIcon className="h-3 w-3" /> : <UserCircleIcon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${style.text}`}>
              {speakerName}
            </span>
          </div>

          {segment.emotion && !isSutradhar && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-wider shadow-xl border border-white/5 transition-all hover:scale-105 bg-white/5 ${style.text}`}>
              <span className="text-lg">{getEmotionEmoji(segment.emotion)}</span>
              <span>{segment.emotion}</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isEditing ? (
          <div className="w-full p-8 bg-slate-900 rounded-3xl shadow-3xl border-2 border-indigo-500/50 animate-in zoom-in-95 ring-8 ring-indigo-500/5 z-10">
            <textarea
              className="w-full text-xl md:text-2xl hindi-font text-white bg-transparent outline-none min-h-[160px] resize-none leading-relaxed"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="..."
              autoFocus
            />
            <div className="flex justify-end space-x-6 mt-6 border-t pt-6 border-white/5">
              <button onClick={handleCancel} className="text-slate-500 hover:text-red-400 text-sm font-bold px-4 py-2 uppercase tracking-tighter">रद्द</button>
              <button onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 uppercase tracking-wide">सुरक्षित करें</button>
            </div>
          </div>
        ) : (
          <div 
            className="relative w-full cursor-pointer group/content"
            onDoubleClick={() => setIsEditing(true)}
          >
            <div className={`hindi-font leading-[1.8] transition-all duration-500 ${isSutradhar 
              ? 'text-xl md:text-2xl text-slate-400 font-medium italic opacity-60' 
              : `text-3xl md:text-4xl text-white font-bold opacity-80 group-hover/content:opacity-100`}`}>
              {isSutradhar ? '' : '“'}{formatContent(segment.content)}{isSutradhar ? '' : '”'}
            </div>
            
            {/* Action Toolbar */}
            <div className={`absolute -right-16 top-0 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${isHovered ? 'translate-x-0' : 'translate-x-6'}`}>
              <button onClick={() => setIsEditing(true)} className="p-3 bg-white/5 shadow-2xl rounded-2xl text-slate-400 hover:text-white border border-white/5 hover:bg-white/10 hover:scale-110 transition-all">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-3 bg-white/5 shadow-2xl rounded-2xl text-slate-600 hover:text-red-400 border border-white/5 hover:bg-white/10 hover:scale-110 transition-all">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorySegmentItem;
