
import React from 'react';
import { SparklesIcon, FireIcon, HeartIcon, MapIcon } from '@heroicons/react/24/outline';

interface Props {
  onStart: (prompt: string) => void;
  isLoading: boolean;
}

const EmptyState: React.FC<Props> = ({ onStart, isLoading }) => {
  const suggestions = [
    { text: "पहाड़ों के एक सुनसान रिसॉर्ट की पहली रात", icon: <MapIcon className="h-5 w-5" />, color: "text-blue-500" },
    { text: "पुरानी हवेली में शिफ्ट हुआ एक नया परिवार", icon: <SparklesIcon className="h-5 w-5" />, color: "text-purple-500" },
    { text: "गाँव की वो कोठरी जहाँ 20 साल से ताला लगा है", icon: <FireIcon className="h-5 w-5" />, color: "text-orange-500" },
    { text: "शहर की एक लिफ्ट जो आधी रात को अटक गई", icon: <HeartIcon className="h-5 w-5" />, color: "text-red-500" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 space-y-12 py-12">
      <div className="space-y-6">
        <div className="relative inline-block">
            <div className="absolute -inset-4 bg-orange-500/10 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative w-64 h-64 overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
               <img 
                src="https://images.unsplash.com/photo-1505634467193-4b47000840bc?auto=format&fit=crop&q=80&w=400" 
                alt="Eerie Atmosphere" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-orange-950 hindi-font">
          कथा सागर: हॉरर स्पेशल
        </h2>
        <p className="text-lg text-orange-800/70 font-medium hindi-font leading-relaxed">
          सावधानी से कदम रखें... यहाँ कहानियाँ पहले आपका भरोसा जीतती हैं, फिर आपकी नींद उड़ाती हैं। एक 'लोकेशन' चुनें और शुरू करें।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onStart(item.text)}
            className="flex items-center justify-center space-x-3 p-4 bg-white/50 hover:bg-white rounded-2xl border border-orange-100 hover:shadow-lg hover:shadow-orange-100/50 transition-all text-left"
          >
            <span className={item.color}>{item.icon}</span>
            <span className="font-bold text-gray-700 hindi-font">{item.text}</span>
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-400 italic">
        याद रखें: हॉरर कहानी में डर धीरे-धीरे बढ़ता है। कुछ भी लिखने के लिए नीचे टाइप करें।
      </div>
    </div>
  );
};

export default EmptyState;
