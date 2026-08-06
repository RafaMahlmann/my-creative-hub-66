export type Cue = { start: number; end: number; text: string };

function parseTime(v: string): number {
  const m = v.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) return 0;
  const [, h, mm, ss, ms] = m;
  return Number(h ?? 0) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms) / 1000;
}

/** Minimal WebVTT parser (also tolerates SRT-style timings). */
export function parseVtt(content?: string | null): Cue[] {
  if (!content) return [];
  const blocks = content.replace(/\r/g, '').split(/\n{2,}/);
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (!lines.length) continue;
    if (/^WEBVTT/i.test(lines[0])) continue;
    const timeIdx = lines.findIndex((l) => l.includes('-->'));
    if (timeIdx === -1) continue;
    const [rawStart, rawEnd] = lines[timeIdx].split('-->');
    const text = lines
      .slice(timeIdx + 1)
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (!text) continue;
    cues.push({ start: parseTime(rawStart), end: parseTime(rawEnd.split(' ')[0]), text });
  }
  return cues;
}

export function formatCueTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Turns WebVTT into a plain readable text block. */
export function vttToPlainText(content?: string | null) {
  return parseVtt(content)
    .map((c) => c.text)
    .join(' ');
}
