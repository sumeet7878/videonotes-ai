export interface YouTubeMetadata {
  title: string;
  thumbnail: string;
  duration: number;
  videoId: string;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error('Invalid YouTube URL format');

  try {
    // Try oEmbed API first (no auth needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();

    return {
      videoId,
      title: data.title || 'YouTube Video',
      thumbnail: getYouTubeThumbnail(videoId),
      duration: 0,
    };
  } catch (err) {
    console.error('oEmbed fetch failed, falling back to noembed:', err);

    // Fallback to noembed.com
    try {
      const noembed = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(noembed);
      if (!response.ok) throw new Error('noembed failed');

      const data = await response.json();
      return {
        videoId,
        title: data.title || 'YouTube Video',
        thumbnail: getYouTubeThumbnail(videoId),
        duration: 0,
      };
    } catch {
      // Last resort: use videoId as title
      return {
        videoId,
        title: 'YouTube Video',
        thumbnail: getYouTubeThumbnail(videoId),
        duration: 0,
      };
    }
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
