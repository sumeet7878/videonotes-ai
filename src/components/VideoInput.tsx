import { useState, useRef, useCallback } from 'react';
import { Upload, Link, AlertCircle, CheckCircle, Film, X } from 'lucide-react';
import { isValidYouTubeUrl, fetchYouTubeMetadata } from '../lib/youtube';
import { getVideoDuration } from '../lib/frameExtractor';
import type { VideoMetadata } from '../types';

interface VideoInputProps {
  onSubmit: (meta: VideoMetadata) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'];
const MAX_DURATION = 300; // 5 minutes

export default function VideoInput({ onSubmit, disabled }: VideoInputProps) {
  const [tab, setTab] = useState<'file' | 'youtube'>('file');
  const [dragging, setDragging] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [filePreview, setFilePreview] = useState<{ name: string; duration: number; size: string } | null>(null);
  const [youtubeMeta, setYoutubeMeta] = useState<{ title: string; thumbnail: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setFilePreview(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported format. Please use: MP4, MOV, AVI, or WEBM`);
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 15;
      });
    }, 100);

    try {
      const duration = await getVideoDuration(file);
      clearInterval(interval);
      setUploadProgress(100);

      if (duration > MAX_DURATION) {
        setError(`Video is ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s long. Please use a video under 5 minutes for best results.`);
        setUploadProgress(0);
        return;
      }

      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      setFilePreview({ name: file.name, duration, size: `${sizeMB} MB` });
    } catch {
      clearInterval(interval);
      setError('Could not read video file. Please try another file.');
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleYoutubeCheck = async () => {
    setError('');
    setYoutubeMeta(null);
    if (!youtubeUrl.trim()) { setError('Please enter a YouTube URL'); return; }
    if (!isValidYouTubeUrl(youtubeUrl)) { setError('Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...'); return; }

    setLoadingMeta(true);
    try {
      const meta = await fetchYouTubeMetadata(youtubeUrl);
      setYoutubeMeta({ title: meta.title, thumbnail: meta.thumbnail });
    } catch {
      setError('Could not fetch video metadata. Please check the URL and try again.');
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleSubmitFile = () => {
    if (!filePreview) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    onSubmit({
      title: filePreview.name.replace(/\.[^/.]+$/, ''),
      duration: filePreview.duration,
      source: 'file',
      file,
    });
  };

  const handleSubmitYoutube = () => {
    if (!youtubeMeta) return;
    onSubmit({
      title: youtubeMeta.title,
      duration: 0,
      thumbnail: youtubeMeta.thumbnail,
      source: 'youtube',
      url: youtubeUrl,
    });
  };

  const clearFile = () => {
    setFilePreview(null);
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        {(['file', 'youtube'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors duration-200 ${
              tab === t
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t === 'file' ? <Film size={16} /> : <Link size={16} />}
            {t === 'file' ? 'Upload Video File' : 'YouTube URL'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'file' ? (
          <div className="space-y-4">
            {/* Drop zone */}
            {!filePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  dragging
                    ? 'border-blue-400 bg-blue-400/10 scale-[1.02]'
                    : 'border-slate-600 hover:border-blue-500/50 hover:bg-blue-500/5'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <Upload size={28} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Drop your video here</p>
                    <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {['MP4', 'MOV', 'AVI', 'WEBM'].map((fmt) => (
                      <span key={fmt} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{fmt}</span>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs">Max 5 minutes duration</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/webm,video/quicktime"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </div>
            ) : (
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm truncate max-w-xs">{filePreview.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {Math.floor(filePreview.duration / 60)}m {Math.floor(filePreview.duration % 60)}s · {filePreview.size}
                      </p>
                    </div>
                  </div>
                  <button onClick={clearFile} className="text-slate-400 hover:text-white transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
                {uploadProgress === 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Ready to process</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-500 w-full" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload progress bar (during loading) */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Reading video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {filePreview && (
              <button
                onClick={handleSubmitFile}
                disabled={disabled}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
              >
                Generate AI Notes
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* YouTube URL input */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">YouTube Video URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => { setYoutubeUrl(e.target.value); setError(''); setYoutubeMeta(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleYoutubeCheck()}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  disabled={disabled}
                  className="flex-1 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  onClick={handleYoutubeCheck}
                  disabled={disabled || loadingMeta || !youtubeUrl.trim()}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors border border-slate-600 text-sm font-medium whitespace-nowrap"
                >
                  {loadingMeta ? 'Loading...' : 'Fetch'}
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">Supports youtube.com and youtu.be URLs</p>
            </div>

            {/* Video preview */}
            {youtubeMeta && (
              <div className="bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600/50">
                <img
                  src={youtubeMeta.thumbnail}
                  alt={youtubeMeta.title}
                  className="w-full aspect-video object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="p-3 flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm font-medium">{youtubeMeta.title}</p>
                </div>
              </div>
            )}

            {youtubeMeta && (
              <button
                onClick={handleSubmitYoutube}
                disabled={disabled}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
              >
                Generate AI Notes
              </button>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 mt-4 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
