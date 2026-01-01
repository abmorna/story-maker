
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, StorySegment } from "../types";

const SYSTEM_INSTRUCTION = `
You are 'Katha Sagar', a master director of Audio-Dramas. 

LANGUAGE RULE:
Strictly write the story in the SAME LANGUAGE as the user's prompt. 
- If the prompt is in Hindi, use Hindi.
- If the prompt is in English, use English.
- If the prompt is in Hinglish (Hindi written in Roman script), use Hinglish.
- NEVER switch languages unless specifically asked.

PACING & MIXTURE RULES:
1. DIALOGUE BLOCKS: Characters should engage in a conversation for 2 to 3 segments back-to-back.
2. STRATEGIC NARRATION: Use a 'Sutradhar' (Narrator) after blocks of dialogue to describe the scene, emotions, or transitions.
3. PERFORMANCE CUES: Use parentheses ( ) for acting instructions and [ ] for ambient sound effects.
4. EMOTION: Every segment must have a clearly defined emotion field.
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

  private getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");
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
    const chat = await this.getChat();
    const response = await chat.sendMessage({ 
      message: `Start a new story. Write it ENTIRELY in the language of this prompt: "${initialPrompt}". Use the 2-3 dialogue pacing rule.` 
    });
    return JSON.parse(response.text || '{}');
  }

  async continueStory(userPrompt: string): Promise<StoryResponse> {
    const chat = await this.getChat();
    const response = await chat.sendMessage({ 
      message: `Continue the story in the SAME language used before. Instruction: ${userPrompt}` 
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
