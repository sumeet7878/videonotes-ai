import { Sparkles, FileVideo, Download } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-36">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-blue-400" />
            <span>Powered by Claude AI · claude-sonnet-4-20250514</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="text-white">Transform Videos Into</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
              Intelligent Notes
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any video or paste a YouTube link. NoteVision AI extracts key frames,
            analyzes content with Claude AI, and generates two beautiful PDF note styles —
            instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-400/40 hover:-translate-y-0.5"
            >
              <FileVideo size={20} />
              Start Generating Notes
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              No signup required · Free to use
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '2', label: 'PDF Styles' },
              { value: '30s', label: 'Frame Intervals' },
              { value: '100%', label: 'Client-Side' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileVideo size={16} className="text-blue-400" />
              </div>
              <span className="font-semibold text-white">AI Smart Notes</span>
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">PDF</span>
            </div>
            <p className="text-sm text-slate-400">Professional A4 layout with screenshots, structured analysis, color-coded sections & table of contents.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Download size={16} className="text-amber-400" />
              </div>
              <span className="font-semibold text-white">Handwritten Style</span>
              <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">PDF</span>
            </div>
            <p className="text-sm text-slate-400">Notebook-style with lined paper, handwriting font, yellow highlights & margin doodles for a personal feel.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
