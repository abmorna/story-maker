
export type SegmentType = 'narration' | 'dialogue' | 'transition';

export interface StorySegment {
  id: string;
  type: SegmentType;
  content: string;
  speaker?: string;
  age?: string;
  emotion?: string;
}

export interface StoryResponse {
  title?: string;
  segments: StorySegment[];
}

export enum StoryAction {
  TWIST = "कहानी में एक नया मोड़ लाओ (Add a twist)",
  EMOTION = "ज्यादा भावनाओं के साथ लिखो (Add more emotion)",
  DIALOGUE = "पात्रों के बीच बातचीत बढ़ाओ (More dialogue)",
  ACTION = "कहानी को रोमांचक बनाओ (Make it exciting)",
  END = "कहानी का समापन करो (End the story)"
}
