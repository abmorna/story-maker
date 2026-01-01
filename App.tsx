
import React, { useState, useRef, useEffect } from 'react';
import { StoryGenerator } from './services/geminiService';
import { StorySegment, StoryAction } from './types';
import Sidebar from './components/Sidebar';
import StoryBoard from './components/StoryBoard';
import EmptyState from './components/EmptyState';
import { 
  BookOpenIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon, 
  SpeakerWaveIcon,
  StopIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/solid';

// Helper for decoding base64
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to create WAV header for PCM data
function createWavHeader(pcmLength: number, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmLength, true); // File length
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Length of fmt chunk
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
  view.setUint16(32, numChannels * 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmLength, true);

  return new Uint8Array(buffer);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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

// Styling helpers for Word Export (Replicating UI logic)
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

const getSpeakerColor = (name: string) => {
  if (name === 'सूत्रधार' || !name) return '#71717a'; // Zinc-500
  
  const colors = ['#e11d48', '#4f46e5', '#059669', '#d97706', '#0284c7', '#7c3aed', '#0d9488'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
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
      let result;
      if (isInitial) {
        result = await generatorRef.current.startStory(prompt);
        setIsInitial(false);
      } else {
        result = await generatorRef.current.continueStory(prompt);
      }

      if (result.title && !title) setTitle(result.title);
      setSegments(prev => [...prev, ...result.segments]);
      setLastBase64Audio(null); 
    } catch (error) {
      console.error("Story generation failed:", error);
      alert("कहानी लिखने में कुछ त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: StoryAction) => {
    handleGenerateStory(action);
  };

  const updateSegment = (id: string, newContent: string) => {
    setSegments(prev => prev.map(seg => seg.id === id ? { ...seg, content: newContent } : seg));
    setLastBase64Audio(null);
  };

  const deleteSegment = (id: string) => {
    if (confirm("क्या आप इस भाग को हटाना चाहते हैं?")) {
      setSegments(prev => prev.filter(seg => seg.id !== id));
      setLastBase64Audio(null);
    }
  };

  const stopAudio = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playStoryAudio = async () => {
    if (segments.length === 0 || isAudioLoading) return;
    
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    try {
      let base64Audio = lastBase64Audio;
      if (!base64Audio) {
        base64Audio = await generatorRef.current.generateStoryAudio(segments);
        setLastBase64Audio(base64Audio);
      }
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        currentSourceRef.current = null;
      };

      currentSourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback failed:", error);
      alert("ऑडियो जनरेट करने में समस्या आई।");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const downloadAudio = async () => {
    let base64Audio = lastBase64Audio;
    if (!base64Audio) {
      setIsAudioLoading(true);
      try {
        base64Audio = await generatorRef.current.generateStoryAudio(segments);
        setLastBase64Audio(base64Audio);
      } catch (e) {
        alert("डाउनलोड करने के लिए ऑडियो तैयार नहीं हो सका।");
        setIsAudioLoading(false);
        return;
      }
      setIsAudioLoading(false);
    }

    const pcmData = decodeBase64(base64Audio);
    const wavHeader = createWavHeader(pcmData.length, 24000, 1);
    const wavBlob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
    
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'katha-sagar'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveAsWord = () => {
    if (segments.length === 0) return;
    
    const storyHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title || 'कथा सागर'}</title>
        <style>
          body { font-family: 'Segoe UI', 'Arial', sans-serif; background-color: #fdf6e3; padding: 50pt; }
          .container { max-width: 600pt; margin: 0 auto; }
          h1 { text-align: center; color: #431407; font-size: 32pt; font-weight: bold; margin-bottom: 40pt; }
          .narration { 
            margin-bottom: 25pt; 
            text-align: center; 
            font-size: 14pt; 
            color: #52525b; 
            font-style: italic; 
            line-height: 1.8;
          }
          .dialogue-box { 
            margin-bottom: 20pt; 
            padding-left: 15pt; 
          }
          .speaker-tag { 
            display: inline-block;
            font-weight: 800; 
            font-size: 9pt; 
            text-transform: uppercase; 
            letter-spacing: 1.5pt;
            margin-bottom: 5pt;
            padding: 2pt 8pt;
            border-radius: 10pt;
            border: 1px solid #e5e7eb;
            background: #ffffff;
          }
          .emotion-badge {
            display: inline-block;
            font-size: 9pt;
            font-weight: bold;
            color: #71717a;
            margin-left: 10pt;
            padding: 2pt 8pt;
            border-radius: 10pt;
            border: 1px solid #f3f4f6;
            background: #ffffff;
          }
          .dialogue-text { 
            font-size: 22pt; 
            font-weight: bold;
            line-height: 1.4;
            padding-left: 15pt;
          }
          .cue-sound { color: #f97316; font-weight: bold; font-style: italic; font-size: 0.8em; }
          .cue-acting { color: #3b82f6; font-style: italic; font-weight: 600; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title || 'कथा सागर'}</h1>
          ${segments.map(seg => {
            const isSutradhar = seg.type === 'narration' || seg.speaker === 'सूत्रधार';
            const color = getSpeakerColor(seg.speaker || 'सूत्रधार');
            const speakerName = seg.speaker || 'सूत्रधार';
            
            // Format text cues for Word
            const formattedContent = seg.content
              .replace(/\[(.*?)\]/g, '<span class="cue-sound">[$1]</span>')
              .replace(/\((.*?)\)/g, '<span class="cue-acting">($1)</span>');

            if (isSutradhar) {
              return `<div class="narration">${formattedContent}</div>`;
            }

            return `
              <div class="dialogue-box" style="border-left: 6pt solid ${color};">
                <div class="speaker-tag" style="color: ${color}; border-color: ${color}44;">
                  ${speakerName}
                </div>
                ${seg.emotion ? `<div class="emotion-badge">${getEmotionEmoji(seg.emotion)} ${seg.emotion}</div>` : ''}
                <div class="dialogue-text" style="color: ${color};">“${formattedContent}”</div>
              </div>
            `;
          }).join('')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', storyHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'katha'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetStory = () => {
    if (confirm("क्या आप वाकई नई कहानी शुरू करना चाहते हैं?")) {
      stopAudio();
      setSegments([]);
      setTitle('');
      setIsInitial(true);
      setLastBase64Audio(null);
      generatorRef.current = new StoryGenerator();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fdf6e3] overflow-hidden">
      <Sidebar 
        onPrompt={handleGenerateStory} 
        onAction={handleAction}
        isLoading={isLoading}
        isInitial={isInitial}
        onReset={resetStory}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-white/80 backdrop-blur shadow-sm p-4 flex justify-between items-center border-b border-orange-100 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-900 leading-tight">कथा सागर</h1>
              <p className="text-xs text-orange-700/60 font-medium">AI ऑडियो ड्रामा</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {segments.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  onClick={playStoryAudio}
                  disabled={isAudioLoading}
                  className={`flex items-center space-x-2 ${isPlaying ? 'bg-red-500' : 'bg-orange-500'} text-white px-3 py-2 rounded-lg shadow-md transition-all text-sm font-bold disabled:opacity-50`}
                  title={isPlaying ? "रोकें" : "कहानी सुनें"}
                >
                  {isAudioLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? <StopIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                  <span className="hindi-font hidden sm:inline">{isAudioLoading ? 'तैयार...' : isPlaying ? 'रोकें' : 'सुनें'}</span>
                </button>

                <button 
                  onClick={downloadAudio}
                  disabled={isAudioLoading}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg shadow-md transition-all text-sm font-bold disabled:opacity-50"
                  title="ऑडियो डाउनलोड करें"
                >
                  <MusicalNoteIcon className="h-4 w-4" />
                  <span className="hindi-font hidden sm:inline">Download</span>
                </button>

                <button 
                  onClick={saveAsWord}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition-all text-sm font-bold"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span className="hindi-font hidden sm:inline">Word</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          {segments.length === 0 ? (
            <EmptyState onStart={handleGenerateStory} isLoading={isLoading} />
          ) : (
            <StoryBoard 
              segments={segments} 
              isLoading={isLoading} 
              title={title} 
              onUpdateSegment={updateSegment}
              onDeleteSegment={deleteSegment}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
