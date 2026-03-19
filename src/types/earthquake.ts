export type GroundType = "I" | "II" | "III";

export const NATURAL_PERIOD_OPTIONS = [0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 1.0, 1.5] as const;
export type NaturalPeriod = (typeof NATURAL_PERIOD_OPTIONS)[number];

export type Earthquake = {
  id: string;
  no: number | null;
  name: string | null;
  occurred_date: string | null;
  affected_area: string | null;
  latitude: number | null;
  longitude: number | null;
  magnitude: number | null;
  created_at: string;
  updated_at: string;
};
