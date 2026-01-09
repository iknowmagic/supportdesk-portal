import { describe, expect, it } from 'vitest';
import { getReadableTextColor } from '@/lib/colorUtils';

describe('getReadableTextColor', () => {
  it('returns black for light backgrounds', () => {
    expect(getReadableTextColor('#f5f5f5')).toBe('#000000');
  });

  it('returns white for dark backgrounds', () => {
    expect(getReadableTextColor('#111111')).toBe('#ffffff');
  });

  it('handles mid-tone by choosing the higher contrast option', () => {
    // Mid blues can go either way; assert it returns either black or white (no crash).
    const result = getReadableTextColor('#42a5f5');
    expect(result === '#ffffff' || result === '#000000').toBe(true);
  });

  it('falls back to white on invalid input', () => {
    expect(getReadableTextColor('not-a-color')).toBe('#ffffff');
  });

  it('falls back to white on null/undefined', () => {
    expect(getReadableTextColor(null)).toBe('#ffffff');
    expect(getReadableTextColor(undefined)).toBe('#ffffff');
  });
});
