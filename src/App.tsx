import { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Footer from './components/Footer';
import VideoInput from './components/VideoInput';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsPanel from './components/ResultsPanel';
import { extractFramesFromVideo } from './lib/frameExtractor';
import { analyzeFrames } from './lib/anthropic';
import { generateSmartNotesPdf, generateHandwrittenPdf } from './lib/pdfGenerator';
import type { AppState, VideoMetadata, ProcessingStep } from './types';

const INITIAL_STATE: AppState = {
  videoMeta: null,
  processing: { step: 'idle', progress: 0, message: '' },
  notes: null,
  smartPdfUrl: null,
  handwrittenPdfUrl: null,
};

function setStep(
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  step: ProcessingStep,
  progress: number,
  message: string,
  extra?: Partial<AppState['processing']>
) {
  setState((s) => ({
    ...s,
    processing: { ...s.processing, step, progress, message, ...extra },
  }));
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const workAreaRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    workAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (meta: VideoMetadata) => {
    setState((s) => ({ ...s, videoMeta: meta, notes: null, smartPdfUrl: null, handwrittenPdfUrl: null }));

    try {
      // Step 1: Upload / prepare
      setStep(setState, 'uploading', 10, 'Preparing video...');
      await delay(400);

      // Step 2: Extract frames
      setStep(setState, 'extracting', 20, 'Extracting video frames...');

      let frames;
      if (meta.source === 'file' && meta.file) {
        frames = await extractFramesFromVideo(meta.file, (p) => {
          setStep(setState, 'extracting', 20 + Math.round(p * 0.2), `Extracting frames... ${p}%`);
        });
      } else {
        // YouTube: use thumbnail as single frame (browser can't decode YouTube video directly)
        const dataUrl = await fetchImageAsDataUrl(meta.thumbnail || '');
        frames = [
          {
            timestamp: 0,
            imageDataUrl: dataUrl,
            label: '0:00',
          },
        ];
        setStep(setState, 'extracting', 40, 'Loaded YouTube thumbnail frame');
        await delay(500);
      }

      // Step 3: Analyze with Claude
      setStep(setState, 'analyzing', 45, 'Sending frames to Claude AI...');
      const estimatedTime = frames.length * 6;

      const notes = await analyzeFrames(
        frames,
        meta.title,
        meta.duration,
        (p, msg) => {
          const remaining = Math.max(0, Math.round(estimatedTime * (1 - p / 100)));
          setStep(setState, 'analyzing', 45 + Math.round(p * 0.35), msg, {
            estimatedTimeRemaining: remaining,
          });
        }
      );

      setState((s) => ({ ...s, notes }));

      // Step 4: Generate PDFs
      setStep(setState, 'generating', 82, 'Generating Smart Notes PDF...');
      const smartPdf = await generateSmartNotesPdf(notes);

      setStep(setState, 'generating', 92, 'Generating Handwritten Notes PDF...');
      const hwPdf = await generateHandwrittenPdf(notes);

      // Done
      setState((s) => ({
        ...s,
        smartPdfUrl: smartPdf,
        handwrittenPdfUrl: hwPdf,
        processing: { step: 'ready', progress: 100, message: 'Complete!' },
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message === 'VIDEO_TOO_LONG'
          ? 'Video exceeds 5 minutes. Please use a shorter video for best results.'
          : err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';

      setState((s) => ({
        ...s,
        processing: { step: 'error', progress: 0, message: '', error: message },
      }));
    }
  };

  const handleRetry = () => {
    if (state.videoMeta) {
      handleSubmit(state.videoMeta);
    } else {
      setState(INITIAL_STATE);
    }
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    workAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isProcessing = ['uploading', 'extracting', 'analyzing', 'generating'].includes(state.processing.step);
  const isReady = state.processing.step === 'ready' && state.notes && state.smartPdfUrl && state.handwrittenPdfUrl;
  const hasError = state.processing.step === 'error';
  const showInput = state.processing.step === 'idle';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Sparkles size={16} className="text-blue-400" />
            </div>
            <span className="text-white font-bold text-lg">NoteVision AI</span>
          </div>
          <button
            onClick={handleGetStarted}
            className="text-sm text-slate-300 hover:text-white font-medium transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700"
          >
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16">
        <Hero onGetStarted={handleGetStarted} />
      </div>

      {/* Work area */}
      <section ref={workAreaRef} className="py-20 bg-slate-900">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Generate Your Notes</h2>
            <p className="text-slate-400">Upload a video file or paste a YouTube link to get started.</p>
          </div>

          {showInput && (
            <VideoInput onSubmit={handleSubmit} disabled={isProcessing} />
          )}

          {(isProcessing || hasError) && (
            <ProcessingStatus state={state.processing} onRetry={hasError ? handleRetry : undefined} />
          )}

          {isReady && state.notes && state.smartPdfUrl && state.handwrittenPdfUrl && (
            <ResultsPanel
              notes={state.notes}
              smartPdfUrl={state.smartPdfUrl}
              handwrittenPdfUrl={state.handwrittenPdfUrl}
              onReset={handleReset}
            />
          )}
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  if (!url) return '';
  try {
    const response = await fetch(url);
    if (!response.ok) return '';
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}
