import type { ReactNode } from 'react';

export const renderHighlightedText = (value: string, matchStart: number, matchLength: number): ReactNode => {
  if (matchStart < 0 || matchLength <= 0) {
    return value;
  }

  const safeStart = Math.min(matchStart, value.length);
  const safeEnd = Math.min(safeStart + matchLength, value.length);
  const before = value.slice(0, safeStart);
  const match = value.slice(safeStart, safeEnd);
  const after = value.slice(safeEnd);

  return (
    <>
      {before}
      <strong className="text-foreground font-extrabold">{match}</strong>
      {after}
    </>
  );
};
