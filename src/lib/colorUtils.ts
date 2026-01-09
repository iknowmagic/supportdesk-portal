import chroma from 'chroma-js';

// Choose between black/white for readable text/icon color on a background.
export function getReadableTextColor(background: string | null | undefined): '#000000' | '#ffffff' {
  // Default to white for saturated/darker tones; still respect WCAG contrast when clear.
  const fallback = '#ffffff';
  if (!background) return fallback;
  try {
    const bg = chroma(background);
    const contrastWithBlack = chroma.contrast(bg, '#000');
    const contrastWithWhite = chroma.contrast(bg, '#fff');

    // Heuristic: if white has reasonable contrast or the color is medium/dark, prefer white.
    const luminance = bg.luminance(); // 0 (dark) to 1 (light)
    if (luminance < 0.5) return '#ffffff';
    if (contrastWithWhite >= 4.5) return '#ffffff';
    if (contrastWithBlack >= contrastWithWhite) return '#000000';
    return '#ffffff';
  } catch {
    return fallback;
  }
}
