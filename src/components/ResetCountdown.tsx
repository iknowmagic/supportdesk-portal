import { useEffect, useState } from 'react';

const MS_PER_MINUTE = 60_000;

const getMinutesUntilNextHour = () => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  const diffMs = nextHour.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / MS_PER_MINUTE));
};

export function ResetCountdown() {
  const [minutesLeft, setMinutesLeft] = useState(getMinutesUntilNextHour);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMinutesLeft(getMinutesUntilNextHour());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span data-testid="reset-countdown" aria-live="polite">
      {minutesLeft}
    </span>
  );
}
