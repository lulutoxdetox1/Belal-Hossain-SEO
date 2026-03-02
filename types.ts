
export interface Voice {
  id: string;
  name: string;
  description: string;
  gender: 'Male' | 'Female';
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface GenerationHistory {
  id: string;
  text: string;
  language: string;
  voice: string;
  timestamp: number;
  audioUrl: string;
}
