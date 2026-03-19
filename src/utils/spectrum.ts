/**
 * 減衰式によるスペクトル値の計算
 * S = a * 10^(b * M) * (距離 + 30)^c
 */
export function calcSpectrum(
  a: number,
  b: number,
  c: number,
  magnitude: number,
  distanceKm: number
): number {
  return a * Math.pow(10, b * magnitude) * Math.pow(distanceKm + 30, c);
}
