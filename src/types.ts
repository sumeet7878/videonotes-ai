export type VideoSource = 'file' | 'youtube';

export type ProcessingStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'ready' | 'error';

export interface VideoMetadata {
  title: string;
  duration: number; // seconds
  thumbnail?: string;
  source: VideoSource;
  url?: string;
  file?: File;
}

export interface FrameData {
  timestamp: number; // seconds
  imageDataUrl: string;
  label: string; // e.g. "0:30"
}

export interface NoteSection {
  frameIndex: number;
  timestamp: string;
  imageDataUrl: string;
  keyPoint: string;
  explanation: string;
  importantDetails: string[];
  highlightTerms: string[];
}

export interface GeneratedNotes {
  videoTitle: string;
  duration: string;
  generatedAt: string;
  sections: NoteSection[];
  summary: string;
  tableOfContents: string[];
}

export interface ProcessingState {
  step: ProcessingStep;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
  error?: string;
}

export interface AppState {
  videoMeta: VideoMetadata | null;
  processing: ProcessingState;
  notes: GeneratedNotes | null;
  smartPdfUrl: string | null;
  handwrittenPdfUrl: string | null;
}
