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
import AddressInput from "../components/AddressInput";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Card } from "../components/Card";
import earthquakeData from "../data/earthquakes.json";

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

const COLUMNS: {
  key: SortKey;
  label: string;
  align: "left" | "right";
  numeric?: boolean;
}[] = [
  { key: "name", label: "地震名", align: "left" },
  { key: "occurred_date", label: "発生日", align: "left" },
  { key: "magnitude", label: "マグニチュード", align: "right", numeric: true },
  { key: "distanceKm", label: "震央距離 (km)", align: "right", numeric: true },
  {
    key: "spectrum",
    label: "応答水平加速度 (gal)",
    align: "right",
    numeric: true,
  },
  { key: "intensity", label: "震度 (目安)", align: "right" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`ml-1 inline-block h-3 w-3 align-[-1px] transition-transform duration-100 ease-standard ${
        active ? "text-paper" : "text-paper/40"
      } ${active && dir === "asc" ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  const earthquakes = earthquakeData as Earthquake[];

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const coords = getLatLng();
    if (!coords) {
      setError("場所を選択または入力してください");
      return;
    }
    setLoading(true);
    setError(null);

    const { a, b, c } =
      ATTENUATION_COEFFICIENTS[form.groundType][form.naturalPeriod];

    const calculated: EarthquakeResult[] = earthquakes
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
  const filterActive =
    filter.yearFrom || filter.yearTo || filter.galMin || filter.galMax;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="p-6 sm:p-8 mb-6">
          <h1 className="text-h1 text-ink mb-2">
            建物の耐震性を今すぐ確認
          </h1>
          <p className="text-sm text-ink-muted mb-6 leading-relaxed">
            所在地・地盤種別・固有周期を入力すると、過去に発生した既往地震
            {earthquakes.length}件について、推定応答水平加速度（gal）と震度を一覧で確認できます。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div
                role="tablist"
                className="flex w-full border-2 border-ink mb-3"
              >
                {INPUT_MODE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={inputMode === tab.value}
                    onClick={() => setInputMode(tab.value)}
                    className={`flex-1 py-2 text-sm font-bold transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 border-l-2 border-ink first:border-l-0 ${
                      inputMode === tab.value
                        ? "bg-ink text-paper"
                        : "bg-paper text-ink-muted hover:text-ink"
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
                      <div className="h-80 flex items-center justify-center text-ink-muted text-sm border-2 border-ink">
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
                    <p className="text-caption data-num text-ink-muted mt-1.5">
                      選択中: 緯度 {mapLat.toFixed(5)} / 経度{" "}
                      {mapLng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-caption text-ink-muted mt-1.5">
                      地図をクリックして場所を選択してください
                    </p>
                  )}
                </div>
              )}

              {inputMode === "latlng" && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-label font-bold text-ink mb-1 block">
                      緯度
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="例: 35.68"
                      value={form.latitude}
                      onChange={(e) =>
                        setForm({ ...form, latitude: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-label font-bold text-ink mb-1 block">
                      経度
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="例: 139.76"
                      value={form.longitude}
                      onChange={(e) =>
                        setForm({ ...form, longitude: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {inputMode === "address" && (
                <div>
                  <label className="text-label font-bold text-ink mb-1 block">
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
                  <p className="text-caption text-ink-muted mt-1.5">
                    住所を選択すると緯度経度が自動入力されます
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-label font-bold text-ink mb-1 block">
                地盤種別
              </label>
              <Select
                value={form.groundType}
                onChange={(e) =>
                  setForm({ ...form, groundType: e.target.value as GroundType })
                }
              >
                {GROUND_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-label font-bold text-ink mb-1 block">
                固有周期 (s)
              </label>
              <Select
                value={form.naturalPeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    naturalPeriod: Number(e.target.value) as NaturalPeriod,
                  })
                }
              >
                {NATURAL_PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period}>
                    {period} s
                  </option>
                ))}
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading || coords === null}
              className="w-full"
            >
              {loading ? "計算中..." : "検索する"}
            </Button>
          </form>
        </Card>

        {error && (
          <div className="bg-paper border-2 border-red-700 text-red-700 p-4 mb-6 text-sm font-bold">
            エラー: {error}
          </div>
        )}

        {displayedResults !== null && (
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-h3 text-ink shrink-0">
                計算結果
                <span className="ml-2 text-sm font-normal data-num text-ink-muted">
                  {displayedResults.length} 件
                </span>
              </h2>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-caption text-ink-muted">年号:</span>
                <input
                  type="number"
                  placeholder="西暦から"
                  value={filter.yearFrom}
                  onChange={(e) =>
                    setFilter({ ...filter, yearFrom: e.target.value })
                  }
                  className="w-24 data-num border-2 border-ink px-2 py-1 text-xs transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                />
                <span className="text-caption text-ink-muted">〜</span>
                <input
                  type="number"
                  placeholder="西暦まで"
                  value={filter.yearTo}
                  onChange={(e) =>
                    setFilter({ ...filter, yearTo: e.target.value })
                  }
                  className="w-24 data-num border-2 border-ink px-2 py-1 text-xs transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                />
                <span className="text-caption text-ink-muted ml-2">gal:</span>
                <input
                  type="number"
                  placeholder="最小"
                  value={filter.galMin}
                  onChange={(e) =>
                    setFilter({ ...filter, galMin: e.target.value })
                  }
                  className="w-20 data-num border-2 border-ink px-2 py-1 text-xs transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                />
                <span className="text-caption text-ink-muted">〜</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={filter.galMax}
                  onChange={(e) =>
                    setFilter({ ...filter, galMax: e.target.value })
                  }
                  className="w-20 data-num border-2 border-ink px-2 py-1 text-xs transition-colors duration-100 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                />
                {filterActive && (
                  <button
                    onClick={() =>
                      setFilter({
                        yearFrom: "",
                        yearTo: "",
                        galMin: "",
                        galMax: "",
                      })
                    }
                    className="text-caption text-ink-muted hover:text-accent underline transition-colors duration-100 ease-standard"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            {displayedResults.length === 0 ? (
              <p className="px-6 py-8 text-center text-ink-muted text-sm">
                条件に一致するデータがありません
              </p>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-ink text-paper text-xs">
                      <th className="px-4 py-3 text-left font-normal w-10 bg-ink">
                        順位
                      </th>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={`px-4 py-3 cursor-pointer select-none bg-ink font-bold transition-colors duration-100 ease-standard hover:bg-accent ${col.align === "right" ? "text-right" : "text-left"}`}
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
                  <tbody className="divide-y-2 divide-ink">
                    {displayedResults.map((eq, i) => (
                      <tr
                        key={eq.id}
                        className="transition-colors duration-100 ease-standard hover:bg-accent/10"
                      >
                        <td className="px-4 py-3 data-num text-ink-muted">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-ink">
                          {eq.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 data-num text-ink">
                          {eq.occurred_date ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right data-num text-ink">
                          {eq.magnitude?.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right data-num text-ink">
                          {eq.distanceKm.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right data-num font-bold text-accent">
                          {Math.round(eq.spectrum)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 text-white text-xs data-num ${INTENSITY_COLOR[eq.intensity]}`}
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
          </Card>
        )}
      </div>
    </div>
  );
}

export default HomePage;
