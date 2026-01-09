import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique event/task ID
 */
export function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Format a Date object to YYYY-MM-DDTHH:MM format for datetime-local input
 */
export function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Calculate duration between two datetime strings in human-readable format
 * Returns format like "1h 30m" or "45m"
 */
export function calculateDuration(start: string, end: string): string {
  if (!start || !end) return '0min';

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}min`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  return mins > 0 ? `${hours}hr ${mins}min` : `${hours}hr`;
}
