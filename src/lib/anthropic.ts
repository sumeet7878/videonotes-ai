import type { FrameData, NoteSection, GeneratedNotes } from '../types';
import { formatDuration } from './youtube';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export async function analyzeFrames(
  frames: FrameData[],
  videoTitle: string,
  duration: number,
  onProgress?: (progress: number, message: string) => void
): Promise<GeneratedNotes> {
  if (frames.length === 0) {
    throw new Error('No frames to analyze');
  }

  const sections: NoteSection[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    onProgress?.(
      Math.round((i / frames.length) * 100),
      `Analyzing frame ${i + 1} of ${frames.length} at ${frame.label}...`
    );

    try {
      const result = await analyzeFrame(frame, videoTitle, i + 1, frames.length);
      sections.push(result);
    } catch (err) {
      console.error(`Frame analysis failed for ${frame.label}:`, err);
      sections.push({
        frameIndex: i,
        timestamp: frame.label,
        imageDataUrl: frame.imageDataUrl,
        keyPoint: `Scene at ${frame.label}`,
        explanation: 'Frame analysis temporarily unavailable. Please try again.',
        importantDetails: [],
        highlightTerms: [],
      });
    }
  }

  onProgress?.(95, 'Generating executive summary...');

  try {
    const summary = await generateSummary(sections, videoTitle);
    const tableOfContents = sections.map(
      (s, i) => `${i + 1}. ${s.timestamp} — ${s.keyPoint}`
    );

    return {
      videoTitle,
      duration: formatDuration(duration),
      generatedAt: new Date().toLocaleString(),
      sections,
      summary,
      tableOfContents,
    };
  } catch (err) {
    console.error('Summary generation failed:', err);
    const tableOfContents = sections.map(
      (s, i) => `${i + 1}. ${s.timestamp} — ${s.keyPoint}`
    );
    return {
      videoTitle,
      duration: formatDuration(duration),
      generatedAt: new Date().toLocaleString(),
      sections,
      summary: `This ${videoTitle} video contains ${sections.length} key scenes analyzed by Claude AI.`,
      tableOfContents,
    };
  }
}

async function analyzeFrame(
  frame: FrameData,
  videoTitle: string,
  frameNum: number,
  totalFrames: number
): Promise<NoteSection> {
  if (!frame.imageDataUrl.startsWith('data:')) {
    throw new Error('Invalid frame data format');
  }

  const base64 = frame.imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64,
            },
          },
          {
            type: 'text',
            text: `You are analyzing frame ${frameNum} of ${totalFrames} from a video titled "${videoTitle}" at timestamp ${frame.label}.

Analyze what you see and generate concise, structured educational notes. Respond ONLY with a valid JSON object matching this exact structure (no markdown, no extra text):
{
  "keyPoint": "One clear sentence describing the main topic or action in this frame",
  "explanation": "2-3 sentences explaining what is happening, the concepts involved, or what is being taught",
  "importantDetails": ["specific detail 1", "specific detail 2", "specific detail 3"],
  "highlightTerms": ["key term 1", "key term 2", "key term 3"]
}

Be specific, educational, and insightful.`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid response structure from API');
    }

    const text = data.content[0]?.text || '{}';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', text);
      throw new Error('Invalid response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      frameIndex: frame.timestamp,
      timestamp: frame.label,
      imageDataUrl: frame.imageDataUrl,
      keyPoint: String(parsed.keyPoint || 'Key point').substring(0, 200),
      explanation: String(parsed.explanation || '').substring(0, 500),
      importantDetails: Array.isArray(parsed.importantDetails)
        ? parsed.importantDetails.slice(0, 5).map((d: unknown) => String(d).substring(0, 100))
        : [],
      highlightTerms: Array.isArray(parsed.highlightTerms)
        ? parsed.highlightTerms.slice(0, 5).map((t: unknown) => String(t).substring(0, 50))
        : [],
    };
  } catch (err) {
    console.error(`Failed to analyze frame ${frameNum}:`, err);
    throw err;
  }
}

async function generateSummary(sections: NoteSection[], videoTitle: string): Promise<string> {
  if (sections.length === 0) {
    return `This video titled "${videoTitle}" has been analyzed.`;
  }

  const pointsList = sections
    .slice(0, 10)
    .map((s) => `- ${s.keyPoint}`)
    .join('\n');

  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Write a concise 2-3 sentence executive summary for a video titled "${videoTitle}" based on these key points:\n\n${pointsList}\n\nRespond only with the summary text, no additional commentary.`,
      },
    ],
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Summary API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim() || '';
    return summary || `Video summary: ${sections.length} scenes analyzed.`;
  } catch (err) {
    console.error('Summary generation failed:', err);
    return `Video analysis complete: ${sections.length} key scenes identified.`;
  }
}
