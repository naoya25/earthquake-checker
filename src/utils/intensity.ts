const INTENSITY_THRESHOLDS: { min: number; intensity: number }[] = [
  { min: 400, intensity: 7 },
  { min: 250, intensity: 6 },
  { min: 80, intensity: 5 },
  { min: 25, intensity: 4 },
  { min: 8, intensity: 3 },
  { min: 2.5, intensity: 2 },
  { min: 0.8, intensity: 1 },
  { min: 0, intensity: 0 },
];

export function spectrumToIntensity(spectrum: number): number {
  return INTENSITY_THRESHOLDS.find((t) => spectrum >= t.min)?.intensity ?? 0;
}
