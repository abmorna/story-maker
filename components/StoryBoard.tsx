
import React, { useRef, useEffect } from 'react';
import { StorySegment } from '../types';
import StorySegmentItem from './StorySegmentItem';

interface StoryBoardProps {
  segments: StorySegment[];
  isLoading: boolean;
  title?: string;
  onUpdateSegment: (id: string, content: string) => void;
  onDeleteSegment: (id: string) => void;
}

const StoryBoard: React.FC<StoryBoardProps> = ({ segments, isLoading, title, onUpdateSegment, onDeleteSegment }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments.length, isLoading]);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-60 pt-10">
      {title && (
        <div className="text-center mb-24 space-y-6">
          <div className="inline-block px-6 py-1.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm">
            एक नवीन गाथा
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-orange-950 hindi-font leading-tight tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <div className="flex justify-center items-center space-x-4 opacity-20">
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-orange-950"></div>
            <div className="h-3 w-3 rotate-45 border-2 border-orange-950"></div>
            <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-orange-950"></div>
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
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 blur-xl opacity-20 animate-pulse"></div>
            <div className="flex space-x-3 relative">
               <div className="h-3 w-3 bg-orange-600 rounded-full animate-bounce"></div>
               <div className="h-3 w-3 bg-orange-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="h-3 w-3 bg-orange-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
          <p className="text-orange-900 text-xs font-black uppercase tracking-[0.4em] hindi-font animate-pulse">
            शब्द बुने जा रहे हैं...
          </p>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default StoryBoard;
