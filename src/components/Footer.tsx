import { Sparkles } from 'lucide-react';

const techBadges = [
  { label: 'React 18', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' },
  { label: 'TypeScript', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  { label: 'Claude AI', color: 'text-orange-400 border-orange-400/30 bg-orange-400/10' },
  { label: 'jsPDF', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
  { label: 'Tailwind CSS', color: 'text-sky-400 border-sky-400/30 bg-sky-400/10' },
  { label: 'Supabase', color: 'text-green-400 border-green-400/30 bg-green-400/10' },
  { label: 'Vite', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Sparkles size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">NoteVision AI</div>
              <div className="text-slate-500 text-xs">AI Video Notes Generator</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-sm text-center md:text-right max-w-xs">
            Transform any video into beautiful, intelligent notes using cutting-edge AI vision technology.
          </p>
        </div>

        {/* Tech badges */}
        <div className="border-t border-slate-800 pt-8">
          <p className="text-slate-600 text-xs uppercase tracking-wider text-center mb-4">Built With</p>
          <div className="flex flex-wrap justify-center gap-2">
            {techBadges.map((badge) => (
              <span
                key={badge.label}
                className={`text-xs font-medium px-3 py-1 rounded-full border ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} NoteVision AI. All processing is client-side. Your videos stay private.
        </div>
      </div>
    </footer>
  );
}
