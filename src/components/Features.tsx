import { Brain, FileText, PenLine, Zap, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Claude AI Analysis',
    description: 'State-of-the-art vision AI extracts meaning from every frame — not just transcription, but genuine understanding.',
  },
  {
    icon: FileText,
    title: 'Professional Smart PDF',
    description: 'A4 format with embedded screenshots, structured key points, explanations, and auto-generated table of contents.',
  },
  {
    icon: PenLine,
    title: 'Handwritten Style PDF',
    description: 'Notebook paper texture, Caveat handwriting font, yellow highlights, margin doodles — feels authentically human.',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Frame extraction runs entirely in-browser using HTML5 Canvas. No uploads needed for video files.',
  },
  {
    icon: Shield,
    title: 'Private by Design',
    description: 'No account required. Video data is processed locally; only frame images are sent for AI analysis.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Fully optimized for all screen sizes. Generate notes on desktop, tablet, or phone.',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3 block">Everything You Need</span>
          <h2 className="text-4xl font-bold text-white mb-4">Built for Learners & Professionals</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Every feature thoughtfully designed to make video learning more effective and enjoyable.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/30 hover:bg-slate-800 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Icon size={22} className="text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Sample preview */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SamplePreview type="smart" />
          <SamplePreview type="handwritten" />
        </div>
      </div>
    </section>
  );
}

function SamplePreview({ type }: { type: 'smart' | 'handwritten' }) {
  const isSmart = type === 'smart';

  return (
    <div className={`rounded-2xl overflow-hidden border ${isSmart ? 'border-blue-500/30' : 'border-amber-500/30'}`}>
      {/* PDF header mockup */}
      <div className={`${isSmart ? 'bg-blue-900' : 'bg-amber-900/70'} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className={`text-xs font-medium ${isSmart ? 'text-blue-300' : 'text-amber-300'}`}>
          {isSmart ? 'AI Smart Notes.pdf' : 'Handwritten Notes.pdf'}
        </span>
        <div />
      </div>

      {/* PDF content mockup */}
      <div className={`p-6 ${isSmart ? 'bg-white' : 'bg-amber-50'} min-h-48`}>
        {isSmart ? <SmartNoteMockup /> : <HandwrittenMockup />}
      </div>

      <div className={`px-5 py-3 text-center text-xs font-medium ${isSmart ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'}`}>
        {isSmart ? 'Professional · A4 · Color-coded · TOC included' : 'Notebook Style · Handwriting Font · Highlighted Terms'}
      </div>
    </div>
  );
}

function SmartNoteMockup() {
  return (
    <div className="space-y-3">
      <div className="bg-blue-800 rounded px-3 py-2 flex items-center justify-between">
        <span className="text-white text-xs font-bold">NoteVision AI — Smart Notes</span>
        <span className="text-blue-300 text-xs">Page 1</span>
      </div>
      <div className="bg-gray-100 rounded h-20 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
        [ Video Frame Screenshot ]
      </div>
      <div className="bg-blue-800 rounded px-2 py-1">
        <span className="text-white text-xs font-bold">KEY POINT</span>
      </div>
      <div className="bg-blue-50 rounded px-3 py-2">
        <span className="text-blue-900 text-xs font-medium">Introduction to machine learning concepts</span>
      </div>
      <div className="space-y-1">
        <div className="h-2 bg-gray-200 rounded w-full" />
        <div className="h-2 bg-gray-200 rounded w-5/6" />
        <div className="h-2 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="flex gap-2">
        {['Neural Networks', 'Training Data', 'Backprop'].map(t => (
          <span key={t} className="bg-yellow-200 text-yellow-900 text-xs px-2 py-0.5 rounded">{t}</span>
        ))}
      </div>
    </div>
  );
}

function HandwrittenMockup() {
  return (
    <div
      className="space-y-3 p-2"
      style={{
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, #b4c8e6 22px, #b4c8e6 23px)',
        fontFamily: "'Caveat', cursive",
      }}
    >
      <div className="text-blue-900 text-xl font-bold" style={{ fontFamily: "'Caveat', cursive" }}>NoteVision AI Notes</div>
      <div className="text-red-700 text-sm" style={{ fontFamily: "'Caveat', cursive" }}>Date: Today | Video Analysis</div>
      <div className="flex items-center gap-2">
        <span className="text-red-700 font-bold text-sm" style={{ fontFamily: "'Caveat', cursive" }}>Key Point:</span>
        <span className="text-blue-900 text-sm" style={{ fontFamily: "'Caveat', cursive" }}>Main concept explained here</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['Neural Nets', 'Training'].map(t => (
          <span key={t} className="bg-yellow-300 text-blue-900 text-sm px-2 rounded" style={{ fontFamily: "'Caveat', cursive" }}>{t}</span>
        ))}
      </div>
      <div className="text-red-700 text-sm" style={{ fontFamily: "'Caveat', cursive" }}>→ Important detail #1</div>
      <div className="text-slate-400 text-xs text-right italic">Written by AI ✨ | Page 1</div>
    </div>
  );
}
