import { useState, useRef } from "react";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  onSelect: (lat: number, lng: number, label: string) => void;
};

function AddressInput({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = async (q: string) => {
    if (q.trim().length < 2) {
      setCandidates([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=jp`,
        { headers: { "Accept-Language": "ja", "User-Agent": "earthquake-checker" } }
      );
      const data: NominatimResult[] = await res.json();
      setCandidates(data);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (item: NominatimResult) => {
    setQuery(item.display_name);
    setSelected(item.display_name);
    setCandidates([]);
    onSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="例: 東京都千代田区丸の内1丁目"
        value={query}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <p className="text-xs text-gray-400 mt-1">検索中...</p>
      )}
      {candidates.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {candidates.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <p className="text-xs text-green-600 mt-1">✓ 座標を取得しました</p>
      )}
    </div>
  );
}

export default AddressInput;
