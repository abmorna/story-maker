
import React, { useState, useRef } from 'react';
import { StoryGenerator } from './services/geminiService';
import { StorySegment, StoryAction } from './types';
import Sidebar from './components/Sidebar';
import StoryBoard from './components/StoryBoard';
import EmptyState from './components/EmptyState';
import { Language, allTranslations, languages } from './translations';
import { 
  BookOpenIcon, 
  SpeakerWaveIcon, 
  StopIcon, 
  MusicalNoteIcon, 
  ArrowDownTrayIcon,
  LanguageIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function createWavHeader(pcmLength: number, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + pcmLength, true); 
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, pcmLength, true);
  return new Uint8Array(buffer);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const getSpeakerColor = (name: string) => {
  if (name === 'सूत्रधार' || name === 'Sutradhar' || !name) return '#94a3b8';
  const colors = ['#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6', '#14b8a6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('hi');
  const t = allTranslations[lang] || allTranslations['en'];
  
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [lastBase64Audio, setLastBase64Audio] = useState<string | null>(null);
  
  const generatorRef = useRef<StoryGenerator>(new StoryGenerator());
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerateStory = async (prompt: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = isInitial 
        ? await generatorRef.current.startStory(prompt, lang)
        : await generatorRef.current.continueStory(prompt, lang);

      if (result.title && !title) setTitle(result.title);
      setSegments(prev => [...prev, ...result.segments]);
      setIsInitial(false);
      setLastBase64Audio(null);
    } catch (error: any) {
      if (error.message === "API_KEY_MISSING") {
        alert(t.alertApiKey);
      } else {
        alert(t.alertError);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const playStoryAudio = async () => {
    if (segments.length === 0 || isAudioLoading) return;
    if (isPlaying) {
      if (currentSourceRef.current) currentSourceRef.current.stop();
      setIsPlaying(false);
      return;
    }

    setIsAudioLoading(true);
    try {
      let base64 = lastBase64Audio;
      if (!base64) {
        base64 = await generatorRef.current.generateStoryAudio(segments);
        setLastBase64Audio(base64);
      }
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decodeBase64(base64), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      currentSourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (e) {
      alert(t.alertError);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const downloadAudio = async () => {
    let base64 = lastBase64Audio;
    if (!base64) {
      setIsAudioLoading(true);
      try { base64 = await generatorRef.current.generateStoryAudio(segments); setLastBase64Audio(base64); } 
      catch (e) { alert(t.alertError); setIsAudioLoading(false); return; }
      setIsAudioLoading(false);
    }
    const pcm = decodeBase64(base64);
    const wav = new Blob([createWavHeader(pcm.length, 24000, 1), pcm], { type: 'audio/wav' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(wav);
    link.download = `${title || 'story'}.wav`;
    link.click();
  };

  const saveAsWord = () => {
    const storyHtml = `
      <html><head><meta charset='utf-8'><style>
        body { font-family: 'Arial'; padding: 40px; background: #0a0f1e; color: #f8fafc; }
        .narration { color: #94a3b8; font-style: italic; margin-bottom: 20px; text-align: center; }
        .dialogue { border-left: 4px solid; padding-left: 15px; margin-bottom: 15px; }
        .speaker { font-weight: bold; font-size: 10pt; text-transform: uppercase; }
      </style></head><body>
      <h1>${title || t.appTitle}</h1>
      ${segments.map(s => {
        const isN = s.type === 'narration' || s.speaker === 'Sutradhar' || s.speaker === 'सूत्रधार';
        const color = getSpeakerColor(s.speaker || '');
        return isN ? `<div class="narration">${s.content}</div>` 
                   : `<div class="dialogue" style="border-color:${color}"><div class="speaker" style="color:${color}">${s.speaker} (${s.emotion})</div><div style="font-size:16pt">${s.content}</div></div>`;
      }).join('')}
      </body></html>`;
    const blob = new Blob(['\ufeff', storyHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'story'}.doc`;
    link.click();
  };

  const resetStory = () => {
    if (confirm(t.alertReset)) {
      setSegments([]);
      setTitle('');
      setIsInitial(true);
      setLastBase64Audio(null);
      generatorRef.current = new StoryGenerator();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0f1e] overflow-hidden text-slate-100">
      <Sidebar 
        onPrompt={handleGenerateStory} 
        onAction={(a) => handleGenerateStory(a)} 
        isLoading={isLoading} 
        isInitial={isInitial} 
        onReset={resetStory} 
        lang={lang}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#161b33] to-[#0a0f1e]">
        <header className="bg-[#0f172a]/80 backdrop-blur shadow-lg p-4 flex justify-between items-center border-b border-white/5 z-30">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-indigo-500/20 shadow-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.appTitle}</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">{t.appSubtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark Language Switcher */}
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 shadow-sm hover:border-indigo-500/50 transition-all group">
              <LanguageIcon className="h-4 w-4 text-indigo-400 group-hover:text-indigo-300" />
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer max-w-[120px] md:max-w-none"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-[#0f172a] text-white">{l.name}</option>
                ))}
              </select>
            </div>

            {segments.length > 0 && (
              <div className="flex space-x-2">
                <button onClick={playStoryAudio} className={`${isPlaying ? 'bg-red-500 shadow-red-500/20' : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/20'} text-white p-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all`}>
                  {isAudioLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : isPlaying ? <StopIcon className="h-5 w-5"/> : <SpeakerWaveIcon className="h-5 w-5"/>}
                </button>
                <button onClick={downloadAudio} title="Download WAV" className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"><MusicalNoteIcon className="h-5 w-5"/></button>
                <button onClick={saveAsWord} title="Save as Word" className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"><ArrowDownTrayIcon className="h-5 w-5"/></button>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {segments.length === 0 ? (
            <EmptyState onStart={handleGenerateStory} isLoading={isLoading} lang={lang} />
          ) : (
            <StoryBoard 
              segments={segments} 
              isLoading={isLoading} 
              title={title} 
              onUpdateSegment={()=>{}} 
              onDeleteSegment={()=>{}} 
              lang={lang}
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none opacity-30">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300">Powered by Gemini 3 Intelligence</span>
        </div>
      </main>
    </div>
  );
};

export default App;
