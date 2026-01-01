
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
  const isSutradhar = name === 'सूत्रधार' || !name;
  
  if (isSutradhar) {
    return {
      bg: 'bg-zinc-800',
      text: 'text-zinc-500',
      border: 'border-zinc-200',
      lightBg: 'bg-zinc-50',
      icon: 'text-zinc-400'
    };
  }

  const colorPalette = [
    { bg: 'bg-rose-600', text: 'text-rose-900', border: 'border-rose-300', lightBg: 'bg-rose-50', icon: 'text-white' },
    { bg: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-300', lightBg: 'bg-indigo-50', icon: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-emerald-900', border: 'border-emerald-300', lightBg: 'bg-emerald-50', icon: 'text-white' },
    { bg: 'bg-amber-600', text: 'text-amber-900', border: 'border-amber-300', lightBg: 'bg-amber-50', icon: 'text-white' },
    { bg: 'bg-sky-600', text: 'text-sky-900', border: 'border-sky-300', lightBg: 'bg-sky-50', icon: 'text-white' },
    { bg: 'bg-violet-600', text: 'text-violet-900', border: 'border-violet-300', lightBg: 'bg-violet-50', icon: 'text-white' },
    { bg: 'bg-teal-600', text: 'text-teal-900', border: 'border-teal-300', lightBg: 'bg-teal-50', icon: 'text-white' },
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

  const speakerName = segment.speaker || 'सूत्रधार';
  const style = getSpeakerStyle(speakerName);
  const isSutradhar = speakerName === 'सूत्रधार' || segment.type === 'narration';

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
          <span key={i} className="text-orange-500 font-bold italic text-[0.8em] mx-1 px-2 py-0.5 bg-orange-50 rounded-md border border-orange-200 select-none inline-block align-middle shadow-sm">
            {part}
          </span>
        );
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={i} className="text-blue-500 italic font-semibold text-[0.9em] mx-1 opacity-80 decoration-blue-200 decoration-2 underline-offset-4">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`relative group w-full mb-16 transition-all duration-500 ${isSutradhar ? 'max-w-4xl mx-auto' : 'max-w-3xl ml-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col transition-all duration-500 ${isSutradhar ? 'items-center text-center' : `items-start pl-10 border-l-4 ${style.border} group-hover:border-l-8`}`}>
        
        {/* Speaker Label & Emotion Badge */}
        <div className={`flex flex-wrap items-center gap-3 mb-4 ${isSutradhar ? 'justify-center' : ''}`}>
          <div className={`flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border ${style.border}`}>
            <div className={`p-1 rounded-full ${style.bg} ${style.icon}`}>
              {isSutradhar ? <MicrophoneIcon className="h-3 w-3" /> : <UserCircleIcon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${style.text}`}>
              {speakerName}
            </span>
          </div>

          {segment.emotion && !isSutradhar && (
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-sm border transition-all hover:scale-105 bg-white ${style.border} ${style.text}`}>
              <span>{getEmotionEmoji(segment.emotion)}</span>
              <span>{segment.emotion}</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isEditing ? (
          <div className="w-full p-6 bg-white rounded-2xl shadow-2xl border-2 border-orange-500 animate-in zoom-in-95 ring-4 ring-orange-100 z-10">
            <textarea
              className="w-full text-xl md:text-2xl hindi-font text-gray-800 bg-transparent outline-none min-h-[140px] resize-none leading-relaxed"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="संवाद लिखें..."
              autoFocus
            />
            <div className="flex justify-end space-x-4 mt-4 border-t pt-4 border-orange-50">
              <button onClick={handleCancel} className="text-gray-400 hover:text-red-500 text-sm font-bold px-3 py-1">रद्द</button>
              <button onClick={handleSave} className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-200">सुरक्षित करें</button>
            </div>
          </div>
        ) : (
          <div 
            className="relative w-full cursor-pointer group/content"
            onDoubleClick={() => setIsEditing(true)}
          >
            <div className={`hindi-font leading-[1.8] transition-all duration-500 ${isSutradhar 
              ? 'text-xl md:text-2xl text-gray-600/90 font-medium italic' 
              : `text-3xl md:text-4xl ${style.text} font-bold opacity-90 group-hover/content:opacity-100`}`}>
              {isSutradhar ? '' : '“'}{formatContent(segment.content)}{isSutradhar ? '' : '”'}
            </div>
            
            {/* Action Toolbar */}
            <div className={`absolute -right-12 top-0 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${isHovered ? 'translate-x-0' : 'translate-x-4'}`}>
              <button onClick={() => setIsEditing(true)} className="p-2.5 bg-white shadow-md rounded-full text-orange-400 hover:text-orange-600 border border-orange-50 hover:scale-110">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-2.5 bg-white shadow-md rounded-full text-gray-300 hover:text-red-500 border border-transparent hover:scale-110">
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
