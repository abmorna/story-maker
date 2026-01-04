
import React, { useRef, useEffect } from 'react';
import { StorySegment } from '../types';
import StorySegmentItem from './StorySegmentItem';
import { Language, allTranslations } from '../translations';

interface StoryBoardProps {
  segments: StorySegment[];
  isLoading: boolean;
  title?: string;
  onUpdateSegment: (id: string, content: string) => void;
  onDeleteSegment: (id: string) => void;
  lang: Language;
}

const StoryBoard: React.FC<StoryBoardProps> = ({ segments, isLoading, title, onUpdateSegment, onDeleteSegment, lang }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = allTranslations[lang];

  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments.length, isLoading]);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-60 pt-10">
      {title && (
        <div className="text-center mb-24 space-y-8">
          <div className="inline-block px-8 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-[0.5em] border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            {t.newSaga}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
            {title}
          </h1>
          <div className="flex justify-center items-center space-x-6 opacity-20">
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-white"></div>
            <div className="h-2 w-2 rotate-45 border border-white"></div>
            <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-white"></div>
          </div>
        </div>
      )}

      <div className="space-y-4 px-4">
        {segments.map((segment, index) => (
          <StorySegmentItem 
            key={segment.id || index} 
            segment={segment} 
            onSave={(newContent) => onUpdateSegment(segment.id, newContent)}
            onDelete={() => onDeleteSegment(segment.id)}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8">
          <div className="relative">
            <div className="absolute -inset-8 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
            <div className="flex space-x-4 relative">
               <div className="h-3.5 w-3.5 bg-indigo-500 rounded-full animate-bounce shadow-lg shadow-indigo-500/50"></div>
               <div className="h-3.5 w-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-lg shadow-indigo-500/50"></div>
               <div className="h-3.5 w-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s] shadow-lg shadow-indigo-500/50"></div>
            </div>
          </div>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
            {t.loadingText}
          </p>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default StoryBoard;
