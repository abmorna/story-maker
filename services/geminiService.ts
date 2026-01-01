
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, StorySegment } from "../types";

const SYSTEM_INSTRUCTION = `
You are 'Katha Sagar', a master director of Hindi Audio-Dramas. 
Write stories rich in emotion and stable pacing.

PACING & MIXTURE RULES:
1. DIALOGUE BLOCKS: Characters engage in conversation for 2-3 segments back-to-back.
2. STRATEGIC NARRATION: 'Sutradhar' appears after 2-3 dialogue segments to describe atmosphere/feelings.
3. STRUCTURE: Use [ ] for sound effects and ( ) for acting cues.
`;

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
          speaker: { type: Type.STRING },
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

  private getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
  }

  private async getChat() {
    if (!this.chat) {
      const ai = this.getAI();
      this.chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: storySchema,
        }
      });
    }
    return this.chat;
  }

  async startStory(initialPrompt: string): Promise<StoryResponse> {
    try {
      const chat = await this.getChat();
      const response = await chat.sendMessage({ 
        message: `विषय: ${initialPrompt}. कहानी शुरू करो। 2-3 संवादों के बाद सूत्रधार का वर्णन लाओ।` 
      });
      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      throw error;
    }
  }

  async continueStory(userPrompt: string): Promise<StoryResponse> {
    try {
      const chat = await this.getChat();
      const response = await chat.sendMessage({ 
        message: `कहानी आगे बढ़ाओ: ${userPrompt}` 
      });
      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      throw error;
    }
  }

  async generateStoryAudio(segments: StorySegment[]): Promise<string> {
    const ai = this.getAI();
    const scriptText = segments.map(s => `${s.speaker || 'Sutradhar'}: ${s.content.replace(/\[.*?\]|\(.*?\)/g, '')}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: scriptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Sutradhar', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              { speaker: 'Character', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
            ]
          }
        }
      }
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) throw new Error("Audio failed");
    return data;
  }
}
