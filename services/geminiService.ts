
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, StorySegment } from "../types";

const SYSTEM_INSTRUCTION = `
You are 'Katha Sagar', a master director of Hindi Audio-Dramas. 
Your task is to write stories that are rich in emotion, stable in pace (Tharav), and clearly structured.

PACING & MIXTURE RULES:
1. DIALOGUE BLOCKS: Characters should engage in a conversation for 2 to 3 segments back-to-back. Do not interrupt every single dialogue with narration.
2. STRATEGIC NARRATION: The 'Sutradhar' (Narrator) should typically appear after a block of 2-3 dialogue segments to describe the impact of the words, the shift in the scene, or the character's internal state.
3. SCENE SETTING: Start a new scene or major beat with 'Sutradhar' setting the environment.
4. REACTION & TRANSITION: Use narration primarily for transitions between characters' exchanges or to describe a significant physical action/reaction that words cannot express.
5. RATIO: Aim for a flow where you have 2-3 dialogues followed by 1 descriptive narration.

EMOTION & PERFORMANCE RULES:
1. CHARACTER DEPTH: Every character dialogue MUST have a clear emotional tone in the 'emotion' field (e.g., 'क्रोध', 'करुणा', 'उत्साह', 'भय', 'व्यंग्य').
2. ACTING CUES: Use parentheses ( ) inside the content to describe HOW a line is spoken. Example: "(धीमी आवाज़ में) मुझे डर लग रहा है..."
3. NARRATION: The 'Sutradhar' should describe the atmosphere and the physical manifestation of emotions (e.g., eyes welling up, hands trembling).
4. DIALOGUES: Keep them crisp, natural, and emotionally charged.

STRUCTURE:
- Strictly separate 'Sutradhar' (Narrator) and characters.
- Use [ ] for ambient sound effects.
- Use ( ) for performance cues inside content.
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
          content: { type: Type.STRING, description: "Hindustani text. Include (acting cues) and [sounds]." },
          speaker: { type: Type.STRING, description: "Character name or 'Sutradhar'" },
          emotion: { type: Type.STRING, description: "The core emotion of the segment (e.g., 'Angry', 'Sad', 'Happy', 'Fearful')" }
        },
        required: ['id', 'type', 'content', 'speaker', 'emotion']
      }
    }
  },
  required: ['segments', 'title']
};

export class StoryGenerator {
  private chat: any = null;

  private async getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private async getChat() {
    if (!this.chat) {
      const ai = await this.getAI();
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

  private cleanJson(text: string): string {
    return text.replace(/```json\n?|```/g, "").trim();
  }

  async startStory(initialPrompt: string): Promise<StoryResponse> {
    const chat = await this.getChat();
    const response = await chat.sendMessage({ 
      message: `एक नई कहानी शुरू करो। पात्रों के बीच 2-3 संवादों का सिलसिला चलने दो, फिर सूत्रधार (Sutradhar) का वर्णन जोड़ो। विषय: ${initialPrompt}` 
    });
    return JSON.parse(this.cleanJson(response.text));
  }

  async continueStory(userPrompt: string): Promise<StoryResponse> {
    const chat = await this.getChat();
    const response = await chat.sendMessage({ 
      message: `कहानी को आगे बढ़ाओ। पात्रों को आपस में 2-3 बार बात करने दो, उसके बाद ही सूत्रधार का वर्णन लाओ। निर्देश: ${userPrompt}` 
    });
    return JSON.parse(this.cleanJson(response.text));
  }

  async generateStoryAudio(segments: StorySegment[]): Promise<string> {
    const ai = await this.getAI();
    
    const speakerVoiceConfigs = [
      {
        speaker: 'Narrator',
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        }
      },
      {
        speaker: 'Character',
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' }
        }
      }
    ];

    const scriptText = segments.map(s => {
      const isNarration = s.type === 'narration' || s.speaker === 'सूत्रधार';
      const label = isNarration ? 'Narrator' : 'Character';
      const cleanContent = s.content.replace(/\[.*?\]|\(.*?\)/g, '').trim();
      return `${label}: ${cleanContent}`;
    }).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ 
        text: `Narrate this Hindi audio drama script with deep emotional resonance. 
        Use the 'Narrator' voice for descriptive parts and the 'Character' voice for all dialogues.
        Do not say the names "Narrator" or "Character", just speak the lines in the corresponding voice.

        SCRIPT:
        ${scriptText}` 
      }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: speakerVoiceConfigs
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed - no data returned.");
    return base64Audio;
  }
}
