import { Download, FileText, PenLine, Clock, Image, RefreshCw } from 'lucide-react';
import type { GeneratedNotes } from '../types';

interface ResultsPanelProps {
  notes: GeneratedNotes;
  smartPdfUrl: string;
  handwrittenPdfUrl: string;
  onReset: () => void;
}

export default function ResultsPanel({ notes, smartPdfUrl, handwrittenPdfUrl, onReset }: ResultsPanelProps) {
  const downloadPdf = (dataUri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.click();
  };

  const safeName = notes.videoTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 40);

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-green-400" />
        </div>
        <div>
          <p className="text-green-400 font-semibold">Notes Generated Successfully!</p>
          <p className="text-slate-400 text-sm">{notes.sections.length} frames analyzed · {notes.duration} duration · {notes.generatedAt}</p>
        </div>
      </div>

      {/* Video title */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Video Title</p>
        <h3 className="text-white font-semibold text-lg leading-snug">{notes.videoTitle}</h3>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">AI Summary</p>
        <p className="text-slate-300 text-sm leading-relaxed">{notes.summary}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Image, label: 'Frames', value: notes.sections.length },
          { icon: Clock, label: 'Duration', value: notes.duration },
          { icon: FileText, label: 'Key Points', value: notes.sections.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <Icon size={16} className="text-blue-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{value}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* TOC preview */}
      {notes.tableOfContents.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Table of Contents</p>
          <ul className="space-y-1.5">
            {notes.tableOfContents.slice(0, 6).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center justify-center font-medium flex-shrink-0">{i + 1}</span>
                <span className="text-slate-300 truncate">{item}</span>
              </li>
            ))}
            {notes.tableOfContents.length > 6 && (
              <li className="text-slate-500 text-xs pl-7">+{notes.tableOfContents.length - 6} more sections...</li>
            )}
          </ul>
        </div>
      )}

      {/* Download buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DownloadCard
          title="AI Smart Notes"
          subtitle="Professional · A4 · Color-coded"
          icon={FileText}
          color="blue"
          onClick={() => downloadPdf(smartPdfUrl, `${safeName}_smart_notes.pdf`)}
        />
        <DownloadCard
          title="Handwritten Style"
          subtitle="Notebook · Handwriting Font"
          icon={PenLine}
          color="amber"
          onClick={() => downloadPdf(handwrittenPdfUrl, `${safeName}_handwritten_notes.pdf`)}
        />
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 py-3 rounded-xl transition-colors text-sm font-medium"
      >
        <RefreshCw size={15} />
        Process Another Video
      </button>
    </div>
  );
}

function DownloadCard({
  title,
  subtitle,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'amber';
  onClick: () => void;
}) {
  const isBlue = color === 'blue';
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 text-left ${
        isBlue
          ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10'
          : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isBlue ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
        <Icon size={22} className={isBlue ? 'text-blue-400' : 'text-amber-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className={`text-xs mt-0.5 ${isBlue ? 'text-blue-400/70' : 'text-amber-400/70'}`}>{subtitle}</p>
      </div>
      <Download size={18} className={`flex-shrink-0 group-hover:translate-y-0.5 transition-transform ${isBlue ? 'text-blue-400' : 'text-amber-400'}`} />
    </button>
  );
}
