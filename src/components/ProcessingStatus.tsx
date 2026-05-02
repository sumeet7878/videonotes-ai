import { Check, Loader2, Upload, Cpu, FileText, Download, AlertCircle } from 'lucide-react';
import type { ProcessingState } from '../types';

interface ProcessingStatusProps {
  state: ProcessingState;
  onRetry?: () => void;
}

const STEPS = [
  { id: 'uploading', label: 'Upload', icon: Upload },
  { id: 'extracting', label: 'Extracting', icon: Cpu },
  { id: 'analyzing', label: 'Analyzing', icon: Cpu },
  { id: 'generating', label: 'Generating', icon: FileText },
  { id: 'ready', label: 'Ready!', icon: Download },
];

const STEP_ORDER = ['uploading', 'extracting', 'analyzing', 'generating', 'ready'];

function getStepStatus(stepId: string, currentStep: string): 'completed' | 'active' | 'pending' {
  const stepIdx = STEP_ORDER.indexOf(stepId);
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  if (currentStep === 'error') return stepIdx < currentIdx ? 'completed' : 'pending';
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function ProcessingStatus({ state, onRetry }: ProcessingStatusProps) {
  const isError = state.step === 'error';

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const status = getStepStatus(step.id, state.step);
          const Icon = step.icon;
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : status === 'active'
                      ? 'bg-blue-500/20 border-blue-500 animate-pulse'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check size={16} className="text-white" />
                  ) : status === 'active' ? (
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                  ) : (
                    <Icon size={15} className="text-slate-500" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    status === 'active' ? 'text-blue-400' : status === 'completed' ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${
                    getStepStatus(STEPS[idx + 1].id, state.step) !== 'pending'
                      ? 'bg-green-500'
                      : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {!isError && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{state.message}</span>
            <span>{state.progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          {state.estimatedTimeRemaining !== undefined && state.estimatedTimeRemaining > 0 && (
            <p className="text-slate-500 text-xs mt-1.5 text-right">
              ~{state.estimatedTimeRemaining}s remaining
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">Processing Failed</p>
            <p className="text-slate-400 text-sm max-w-sm">{state.error || 'An unexpected error occurred. Please try again.'}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Processing tips */}
      {!isError && state.step !== 'ready' && (
        <div className="bg-slate-700/30 rounded-xl px-4 py-3 flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
          <p className="text-slate-400 text-xs">
            {state.step === 'extracting'
              ? 'Extracting frames every 30 seconds from your video using HTML5 Canvas...'
              : state.step === 'analyzing'
              ? 'Claude AI is examining each frame for key concepts, visuals, and important information...'
              : state.step === 'generating'
              ? 'Building your two PDF documents with embedded screenshots and structured notes...'
              : 'Preparing your video for processing...'}
          </p>
        </div>
      )}
    </div>
  );
}
