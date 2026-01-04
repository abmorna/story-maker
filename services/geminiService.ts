
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, StorySegment } from "../types";
import { Language } from "../translations";

const SYSTEM_INSTRUCTION = (targetLanguage: string) => `
You are 'Katha Sagar', a master director of Audio-Dramas. 

LANGUAGE RULE:
Write the story ENTIRELY in ${targetLanguage}. Use the native script of ${targetLanguage} correctly.
NEVER switch languages unless specifically asked.

PACING & MIXTURE RULES:
1. DIALOGUE BLOCKS: Characters should engage in a conversation for 2 to 3 segments back-to-back.
2. STRATEGIC NARRATION: Use a 'Sutradhar' (Narrator) after blocks of dialogue to describe the scene, emotions, or transitions.
3. PERFORMANCE CUES: Use parentheses ( ) for acting instructions and [ ] for ambient sound effects.
4. EMOTION: Every segment must have a clearly defined emotion field.
`;

const LANGUAGE_NAME_MAP: Record<Language, string> = {
  hi: 'Hindi', en: 'English', ur: 'Urdu', bn: 'Bengali', mr: 'Marathi',
  te: 'Telugu', ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi',
  es: 'Spanish', fr: 'French', zh: 'Chinese (Mandarin)', ja: 'Japanese', 
  tr: 'Turkish', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', 
  ar: 'Arabic', ko: 'Korean', vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', 
  nl: 'Dutch', pl: 'Polish', sv: 'Swedish', no: 'Norwegian', da: 'Danish', 
  fi: 'Finnish', el: 'Greek', he: 'Hebrew', ro: 'Romanian', hu: 'Hungarian', 
  cs: 'Czech', uk: 'Ukrainian', ms: 'Malay', ml: 'Malayalam', or: 'Odia', 
  as: 'Assamese', bh: 'Bhojpuri', sa: 'Sanskrit', ne: 'Nepali', si: 'Sinhala', 
  my: 'Burmese', km: 'Khmer', lo: 'Lao', am: 'Amharic', sw: 'Swahili', zu: 'Zulu'
};

export const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['narration', 'dialogue', 'transition'] },
          content: { type: Type.STRING },
          speaker: { type: Type.STRING, description: "Character name or 'Sutradhar'" },
          emotion: { type: Type.STRING }
        },
        required: ['id', 'type', 'content', 'speaker', 'emotion']
      }
    }
  },
  required: ['segments', 'title']
};

export class StoryGenerator {
  private chat: any = null;
  private currentLanguage: Language = 'hi';

  private getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");
    return new GoogleGenAI({ apiKey });
  }

  private async getChat(lang: Language) {
    if (!this.chat || this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      const ai = this.getAI();
      const langName = LANGUAGE_NAME_MAP[lang] || 'English';
      
      this.chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION(langName),
          responseMimeType: "application/json",
          responseSchema: storySchema,
        }
      });
    }
    return this.chat;
  }

  async startStory(initialPrompt: string, lang: Language): Promise<StoryResponse> {
    const chat = await this.getChat(lang);
    const response = await chat.sendMessage({ 
      message: `User Topic: "${initialPrompt}". Language: ${LANGUAGE_NAME_MAP[lang]}. Craft the opening of the story.` 
    });
    return JSON.parse(response.text || '{}');
  }

  async continueStory(userPrompt: string, lang: Language): Promise<StoryResponse> {
    const chat = await this.getChat(lang);
    const response = await chat.sendMessage({ 
      message: `Instruction for the next part: ${userPrompt}` 
    });
    return JSON.parse(response.text || '{}');
  }

  async generateStoryAudio(segments: StorySegment[]): Promise<string> {
    const ai = this.getAI();
    const scriptText = segments.map(s => {
      const cleanContent = s.content.replace(/\[.*?\]|\(.*?\)/g, '').trim();
      return `${s.speaker || 'Sutradhar'}: ${cleanContent}`;
    }).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: scriptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) throw new Error("Audio generation failed");
    return base64;
  }
}
