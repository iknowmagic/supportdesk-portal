import { useEffect, useState } from 'react';

const MS_PER_SECOND = 1000;

const getTimeRemaining = () => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  const diffMs = nextHour.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.ceil(diffMs / MS_PER_SECOND));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
};

type ResetCountdownProps = {
  seconds?: boolean;
};

export function ResetCountdown({ seconds = true }: ResetCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const displayValue = seconds ? `${timeLeft.minutes}:${String(timeLeft.seconds).padStart(2, '0')}` : timeLeft.minutes;

  return (
    <span data-testid="reset-countdown" aria-live="polite">
      {displayValue}
    </span>
  );
}
