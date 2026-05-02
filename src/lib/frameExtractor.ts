import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { FrameData } from '../types';

let ffmpeg: FFmpeg | null = null;

async function initFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  return ffmpeg;
}

export async function extractFramesFromVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FrameData[]> {
  try {
    return await extractFramesWithFFmpeg(file, onProgress);
  } catch {
    // Fallback to Canvas-based extraction
    return await extractFramesWithCanvas(file, onProgress);
  }
}

async function extractFramesWithFFmpeg(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FrameData[]> {
  const ff = await initFFmpeg();

  // Write input file to FFmpeg filesystem
  onProgress?.(5);
  await ff.writeFile('input.mp4', await fetchFile(file));

  // Get video info
  onProgress?.(10);
  await ff.exec(['-i', 'input.mp4', '-f', 'null', '-']);

  // Extract frames every 30 seconds + first frame
  onProgress?.(15);
  const outputPattern = 'frame_%04d.jpg';
  await ff.exec([
    '-i', 'input.mp4',
    '-vf', 'fps=1/30',
    '-q:v', '2',
    outputPattern,
  ]);

  onProgress?.(70);

  // Collect generated frames
  const files = await ff.listDir('/');
  const frames: FrameData[] = [];
  let frameIndex = 0;

  for (const entry of files) {
    if (!entry.isDir && entry.name.startsWith('frame_')) {
      const data = await ff.readFile(entry.name);
      const blob = new Blob([data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const seconds = frameIndex * 30;
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);

      frames.push({
        timestamp: seconds,
        imageDataUrl: canvas.toDataURL('image/jpeg', 0.85),
        label: `${mins}:${secs.toString().padStart(2, '0')}`,
      });

      frameIndex++;
      onProgress?.(70 + Math.round((frameIndex / 10) * 20));
    }
  }

  // Clean up FFmpeg filesystem
  onProgress?.(95);
  await ff.deleteFile('input.mp4');
  for (const entry of files) {
    if (!entry.isDir && entry.name.startsWith('frame_')) {
      await ff.deleteFile(entry.name);
    }
  }

  if (frames.length === 0) throw new Error('No frames extracted');

  onProgress?.(100);
  return frames;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

async function extractFramesWithCanvas(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FrameData[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (duration > 300) {
        URL.revokeObjectURL(url);
        reject(new Error('VIDEO_TOO_LONG'));
        return;
      }

      const frames: FrameData[] = [];
      const capturePoints: number[] = [0];
      for (let t = 30; t < duration; t += 30) {
        capturePoints.push(t);
      }
      if (duration > 5 && capturePoints[capturePoints.length - 1] < duration - 5) {
        capturePoints.push(duration - 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d')!;

      for (let i = 0; i < capturePoints.length; i++) {
        const t = capturePoints[i];
        await seekAndCapture(video, canvas, ctx, t);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        frames.push({
          timestamp: t,
          imageDataUrl,
          label: `${mins}:${secs.toString().padStart(2, '0')}`,
        });

        onProgress?.(Math.round(((i + 1) / capturePoints.length) * 100));
      }

      URL.revokeObjectURL(url);
      resolve(frames);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
  });
}

function seekAndCapture(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  time: number
): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

export async function captureFrameFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video metadata'));
    };
  });
}
