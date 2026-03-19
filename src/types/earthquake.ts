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
