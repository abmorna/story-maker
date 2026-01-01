
import React, { useState, useRef } from 'react';
import { StoryGenerator } from './services/geminiService';
import { StorySegment, StoryAction } from './types';
import Sidebar from './components/Sidebar';
import StoryBoard from './components/StoryBoard';
import EmptyState from './components/EmptyState';
import { 
  BookOpenIcon, 
  SpeakerWaveIcon, 
  StopIcon, 
  MusicalNoteIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/solid';

// Helper for decoding base64
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to create WAV header for PCM data
function createWavHeader(pcmLength: number, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmLength, true); 
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmLength, true);
  return new Uint8Array(buffer);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const getSpeakerColor = (name: string) => {
  if (name === 'सूत्रधार' || name === 'Sutradhar' || !name) return '#71717a';
  const colors = ['#e11d48', '#4f46e5', '#059669', '#d97706', '#0284c7', '#7c3aed', '#0d9488'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const App: React.FC = () => {
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
        ? await generatorRef.current.startStory(prompt)
        : await generatorRef.current.continueStory(prompt);

      if (result.title && !title) setTitle(result.title);
      setSegments(prev => [...prev, ...result.segments]);
      setIsInitial(false);
      setLastBase64Audio(null);
    } catch (error: any) {
      if (error.message === "API_KEY_MISSING") {
        alert("Vercel Settings में API_KEY सेट नहीं है। कृपया Environment Variables चेक करें।");
      } else {
        alert("कुछ तकनीकी समस्या आई। कृपया फिर से प्रयास करें।");
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
      alert("ऑडियो जनरेट नहीं हो सका।");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const downloadAudio = async () => {
    let base64 = lastBase64Audio;
    if (!base64) {
      setIsAudioLoading(true);
      try { base64 = await generatorRef.current.generateStoryAudio(segments); setLastBase64Audio(base64); } 
      catch (e) { alert("Error"); setIsAudioLoading(false); return; }
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
        body { font-family: 'Arial'; padding: 40px; }
        .narration { color: #52525b; font-style: italic; margin-bottom: 20px; text-align: center; }
        .dialogue { border-left: 4px solid; padding-left: 15px; margin-bottom: 15px; }
        .speaker { font-weight: bold; font-size: 10pt; text-transform: uppercase; }
      </style></head><body>
      <h1>${title || 'Katha Sagar'}</h1>
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
    if (confirm("नई कहानी?")) {
      setSegments([]);
      setTitle('');
      setIsInitial(true);
      setLastBase64Audio(null);
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
          {segments.length > 0 && (
            <div className="flex space-x-2">
              <button onClick={playStoryAudio} className={`${isPlaying ? 'bg-red-500' : 'bg-orange-500'} text-white p-2 rounded-lg`}>
                {isAudioLoading ? '...' : isPlaying ? <StopIcon className="h-5 w-5"/> : <SpeakerWaveIcon className="h-5 w-5"/>}
              </button>
              <button onClick={downloadAudio} className="bg-emerald-600 text-white p-2 rounded-lg"><MusicalNoteIcon className="h-5 w-5"/></button>
              <button onClick={saveAsWord} className="bg-blue-600 text-white p-2 rounded-lg"><ArrowDownTrayIcon className="h-5 w-5"/></button>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {segments.length === 0 ? <EmptyState onStart={handleGenerateStory} isLoading={isLoading} /> : <StoryBoard segments={segments} isLoading={isLoading} title={title} onUpdateSegment={()=>{}} onDeleteSegment={()=>{}} />}
        </div>
      </main>
    </div>
  );
};

export default App;
