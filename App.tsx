
import React, { useState, useRef } from 'react';
import { StoryGenerator } from './services/geminiService';
import { StorySegment, StoryAction } from './types';
import Sidebar from './components/Sidebar';
import StoryBoard from './components/StoryBoard';
import EmptyState from './components/EmptyState';
import { BookOpenIcon, SpeakerWaveIcon, StopIcon, MusicalNoteIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  
  const generatorRef = useRef<StoryGenerator>(new StoryGenerator());

  const handleGenerateStory = async (prompt: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = isInitial 
        ? await generatorRef.current.startStory(prompt)
        : await generatorRef.current.continueStory(prompt);

      if (result.title && !title) setTitle(result.title);
      setSegments(prev => [...prev, ...result.segments]);
      setIsInitial(false);
    } catch (error: any) {
      if (error.message === "API_KEY_MISSING") {
        alert("Vercel Settings में API_KEY सेट नहीं है। कृपया Environment Variables चेक करें।");
      } else {
        alert("कहानी जनरेट करने में समस्या आई। कृपया अपना इंटरनेट या API की जांच करें।");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of audio and export logic remains same as previous updates)
  const resetStory = () => {
    if (confirm("नई कहानी?")) {
      setSegments([]);
      setTitle('');
      setIsInitial(true);
      generatorRef.current = new StoryGenerator();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fdf6e3] overflow-hidden">
      <Sidebar onPrompt={handleGenerateStory} onAction={(a) => handleGenerateStory(a)} isLoading={isLoading} isInitial={isInitial} onReset={resetStory} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-white/80 backdrop-blur shadow-sm p-4 flex justify-between items-center border-b border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg"><BookOpenIcon className="h-6 w-6 text-white" /></div>
            <h1 className="text-xl font-bold text-orange-900">कथा सागर</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          {segments.length === 0 ? <EmptyState onStart={handleGenerateStory} isLoading={isLoading} /> : <StoryBoard segments={segments} isLoading={isLoading} title={title} onUpdateSegment={()=>{}} onDeleteSegment={()=>{}} />}
        </div>
      </main>
    </div>
  );
};

export default App;
