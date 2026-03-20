import { useState, lazy, Suspense, useMemo } from "react";
import type {
  GroundType,
  NaturalPeriod,
  Earthquake,
} from "../types/earthquake";
import { NATURAL_PERIOD_OPTIONS } from "../types/earthquake";
import { ATTENUATION_COEFFICIENTS } from "../constants/attenuationCoefficients";
import { calcDistance } from "../utils/distance";
import { calcSpectrum } from "../utils/spectrum";
import { spectrumToIntensity } from "../utils/intensity";
import { supabase } from "../lib/supabase";
import AddressInput from "../components/AddressInput";

const MapSelector = lazy(() => import("../components/MapSelector"));

type InputMode = "map" | "latlng" | "address";

type FormValues = {
  latitude: string;
  longitude: string;
  groundType: GroundType;
  naturalPeriod: NaturalPeriod;
};

type EarthquakeResult = Earthquake & {
  distanceKm: number;
  spectrum: number;
  intensity: number;
};

type SortKey =
  | "name"
  | "occurred_date"
  | "magnitude"
  | "distanceKm"
  | "spectrum"
  | "intensity";
type SortDir = "asc" | "desc";

type FilterState = {
  yearFrom: string;
  yearTo: string;
  galMin: string;
  galMax: string;
};

const INTENSITY_COLOR: Record<number, string> = {
  0: "bg-gray-400",
  1: "bg-gray-500",
  2: "bg-blue-400",
  3: "bg-blue-600",
  4: "bg-yellow-500",
  5: "bg-orange-500",
  6: "bg-red-500",
  7: "bg-red-700",
};

const GROUND_TYPE_OPTIONS: { value: GroundType; label: string }[] = [
  { value: "I", label: "Ⅰ種地盤" },
  { value: "II", label: "Ⅱ種地盤" },
  { value: "III", label: "Ⅲ種地盤" },
];

const INPUT_MODE_TABS: { value: InputMode; label: string }[] = [
  { value: "map", label: "地図から選択" },
  { value: "latlng", label: "緯度経度を入力" },
  { value: "address", label: "住所を入力" },
];

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "地震名", align: "left" },
  { key: "occurred_date", label: "発生日", align: "left" },
  { key: "magnitude", label: "マグニチュード", align: "right" },
  { key: "distanceKm", label: "震央距離 (km)", align: "right" },
  { key: "spectrum", label: "応答水平加速度 (gal)", align: "right" },
  { key: "intensity", label: "震度 (目安)", align: "right" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-gray-300">↕</span>;
  return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

function HomePage() {
  const [inputMode, setInputMode] = useState<InputMode>("map");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [form, setForm] = useState<FormValues>({
    latitude: "",
    longitude: "",
    groundType: "II",
    naturalPeriod: 0.3,
  });
  const [results, setResults] = useState<EarthquakeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("spectrum");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterState>({
    yearFrom: "",
    yearTo: "",
    galMin: "",
    galMax: "",
  });

  const getLatLng = (): { lat: number; lng: number } | null => {
    if (inputMode === "map") {
      if (mapLat === null || mapLng === null) return null;
      return { lat: mapLat, lng: mapLng };
    }
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const coords = getLatLng();
    if (!coords) {
      setError("場所を選択または入力してください");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.from("earthquakes").select("*");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { a, b, c } =
      ATTENUATION_COEFFICIENTS[form.groundType][form.naturalPeriod];

    const calculated: EarthquakeResult[] = (data as Earthquake[])
      .filter(
        (eq) =>
          eq.latitude != null && eq.longitude != null && eq.magnitude != null,
      )
      .map((eq) => {
        const distanceKm = calcDistance(
          coords.lat,
          coords.lng,
          eq.latitude!,
          eq.longitude!,
        );
        const spectrum = calcSpectrum(a, b, c, eq.magnitude!, distanceKm);
        const intensity = spectrumToIntensity(spectrum);
        return { ...eq, distanceKm, spectrum, intensity };
      });

    setResults(calculated);
    setSortKey("spectrum");
    setSortDir("desc");
    setFilter({ yearFrom: "", yearTo: "", galMin: "", galMax: "" });
    setLoading(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const displayedResults = useMemo(() => {
    if (!results) return null;

    let filtered = [...results];

    const yearFrom = parseInt(filter.yearFrom);
    const yearTo = parseInt(filter.yearTo);
    const galMin = parseFloat(filter.galMin);
    const galMax = parseFloat(filter.galMax);

    if (!isNaN(yearFrom)) {
      filtered = filtered.filter((eq) => {
        const year = eq.occurred_date
          ? parseInt(eq.occurred_date.split("-")[0])
          : null;
        return year !== null && year >= yearFrom;
      });
    }
    if (!isNaN(yearTo)) {
      filtered = filtered.filter((eq) => {
        const year = eq.occurred_date
          ? parseInt(eq.occurred_date.split("-")[0])
          : null;
        return year !== null && year <= yearTo;
      });
    }
    if (!isNaN(galMin))
      filtered = filtered.filter((eq) => eq.spectrum >= galMin);
    if (!isNaN(galMax))
      filtered = filtered.filter((eq) => eq.spectrum <= galMax);

    filtered.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [results, sortKey, sortDir, filter]);

  const coords = getLatLng();

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            地震チェッカー
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            建物の所在地（緯度・経度）と地盤種別・固有周期を入力することで、過去に発生したすべての地震についての応答水平加速度（gal）と推定震度を一覧で確認できます。
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-3">
                {INPUT_MODE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setInputMode(tab.value)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      inputMode === tab.value
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {inputMode === "map" && (
                <div>
                  <Suspense
                    fallback={
                      <div className="h-80 flex items-center justify-center text-gray-400 text-sm border border-gray-200 rounded-xl">
                        地図を読み込み中...
                      </div>
                    }
                  >
                    <MapSelector
                      lat={mapLat}
                      lng={mapLng}
                      onSelect={(lat, lng) => {
                        setMapLat(lat);
                        setMapLng(lng);
                      }}
                    />
                  </Suspense>
                  {mapLat !== null && mapLng !== null ? (
                    <p className="text-xs text-gray-500 mt-1.5">
                      選択中: 緯度 {mapLat.toFixed(5)} / 経度{" "}
                      {mapLng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1.5">
                      地図をクリックして場所を選択してください
                    </p>
                  )}
                </div>
              )}

              {inputMode === "latlng" && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緯度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 35.68"
                      value={form.latitude}
                      onChange={(e) =>
                        setForm({ ...form, latitude: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      経度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 139.76"
                      value={form.longitude}
                      onChange={(e) =>
                        setForm({ ...form, longitude: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {inputMode === "address" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <AddressInput
                    onSelect={(lat, lng) => {
                      setForm((f) => ({
                        ...f,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6),
                      }));
                      setInputMode("latlng");
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    住所を選択すると緯度経度が自動入力されます
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地盤種別
              </label>
              <select
                value={form.groundType}
                onChange={(e) =>
                  setForm({ ...form, groundType: e.target.value as GroundType })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {GROUND_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                固有周期 (s)
              </label>
              <select
                value={form.naturalPeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    naturalPeriod: Number(e.target.value) as NaturalPeriod,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {NATURAL_PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period}>
                    {period} s
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || coords === null}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              {loading ? "計算中..." : "検索する"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            エラー: {error}
          </div>
        )}

        {displayedResults !== null && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800 shrink-0">
                計算結果
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {displayedResults.length} 件
                </span>
              </h2>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-gray-400 text-xs">年号:</span>
                <input
                  type="number"
                  placeholder="西暦から"
                  value={filter.yearFrom}
                  onChange={(e) =>
                    setFilter({ ...filter, yearFrom: e.target.value })
                  }
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-gray-400 text-xs">〜</span>
                <input
                  type="number"
                  placeholder="西暦まで"
                  value={filter.yearTo}
                  onChange={(e) =>
                    setFilter({ ...filter, yearTo: e.target.value })
                  }
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-gray-400 text-xs ml-2">gal:</span>
                <input
                  type="number"
                  placeholder="最小"
                  value={filter.galMin}
                  onChange={(e) =>
                    setFilter({ ...filter, galMin: e.target.value })
                  }
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-gray-400 text-xs">〜</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={filter.galMax}
                  onChange={(e) =>
                    setFilter({ ...filter, galMax: e.target.value })
                  }
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                {(filter.yearFrom ||
                  filter.yearTo ||
                  filter.galMin ||
                  filter.galMax) && (
                  <button
                    onClick={() =>
                      setFilter({
                        yearFrom: "",
                        yearTo: "",
                        galMin: "",
                        galMax: "",
                      })
                    }
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            {displayedResults.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                条件に一致するデータがありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs">
                      <th className="px-4 py-3 text-left text-gray-400 font-normal w-10">
                        順位
                      </th>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={`px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors ${col.align === "right" ? "text-right" : "text-left"}`}
                        >
                          {col.label}
                          <SortIcon
                            active={sortKey === col.key}
                            dir={sortDir}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedResults.map((eq, i) => (
                      <tr
                        key={eq.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {eq.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {eq.occurred_date ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {eq.magnitude?.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {eq.distanceKm.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {Math.round(eq.spectrum)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded text-white text-xs ${INTENSITY_COLOR[eq.intensity]}`}
                          >
                            震度 {eq.intensity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
