// Duration options shared between settings and task modal
export const DURATION_OPTIONS: { value: number; label: string }[] = [];

for (let i = 5; i <= 45; i += 5) {
  DURATION_OPTIONS.push({ value: i, label: `${i}m` });
}

for (let i = 60; i <= 1410; i += 30) {
  const hours = Math.floor(i / 60);
  const minutes = i % 60;
  const label = minutes === 0 ? `${hours}hr` : `${hours}hr ${minutes}m`;
  DURATION_OPTIONS.push({ value: i, label });
}
