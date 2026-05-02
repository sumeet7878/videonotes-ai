import { Upload, Cpu, FileDown } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload or Link',
    description: 'Drop a video file (MP4, MOV, AVI, WEBM — up to 5 minutes) or paste any YouTube URL. We handle the rest.',
    color: 'blue',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Analyzes',
    description: 'Claude AI examines captured frames every 30 seconds, identifying key concepts, visuals, and important information.',
    color: 'cyan',
  },
  {
    icon: FileDown,
    step: '03',
    title: 'Download PDFs',
    description: 'Receive two beautifully formatted PDFs: a professional smart notes document and a handwritten-style notebook.',
    color: 'sky',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
};

export default function HowItWorks() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3 block">Simple Process</span>
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Three steps from video to polished notes. No accounts, no waiting — just instant AI intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-sky-500/30" />

          {steps.map((step) => {
            const colors = colorMap[step.color];
            const Icon = step.icon;
            return (
              <div key={step.step} className={`relative p-8 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm group hover:scale-105 transition-transform duration-300`}>
                <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${colors.badge} rounded-full px-3 py-1 mb-6`}>
                  Step {step.step}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className={colors.text} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
