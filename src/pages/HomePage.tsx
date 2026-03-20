import { useState } from "react";
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

function HomePage() {
  const [form, setForm] = useState<FormValues>({
    latitude: "",
    longitude: "",
    groundType: "II",
    naturalPeriod: 0.3,
  });
  const [results, setResults] = useState<EarthquakeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.from("earthquakes").select("*");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const inputLat = parseFloat(form.latitude);
    const inputLon = parseFloat(form.longitude);
    const { a, b, c } =
      ATTENUATION_COEFFICIENTS[form.groundType][form.naturalPeriod];

    const calculated: EarthquakeResult[] = (data as Earthquake[])
      .filter(
        (eq) =>
          eq.latitude != null && eq.longitude != null && eq.magnitude != null,
      )
      .map((eq) => {
        const distanceKm = calcDistance(
          inputLat,
          inputLon,
          eq.latitude!,
          eq.longitude!,
        );
        const spectrum = calcSpectrum(a, b, c, eq.magnitude!, distanceKm);
        const intensity = spectrumToIntensity(spectrum);
        return { ...eq, distanceKm, spectrum, intensity };
      })
      .sort((a, b) => b.spectrum - a.spectrum);

    setResults(calculated);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            地震チェッカー
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            建物の所在地（緯度・経度）と地盤種別・固有周期を入力することで、過去に発生したすべての地震についての応答水平加速度（gal）と推定震度を一覧で確認できます。
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  required
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
                  required
                />
              </div>
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
              disabled={loading}
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

        {results !== null && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                計算結果
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {results.length} 件
                </span>
              </h2>
            </div>

            {results.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                計算可能なデータがありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs tracking-wide">
                      <th className="px-4 py-3 text-left">順位</th>
                      <th className="px-4 py-3 text-left">地震名</th>
                      <th className="px-4 py-3 text-left">発生日</th>
                      <th className="px-4 py-3 text-right">マグニチュード</th>
                      <th className="px-4 py-3 text-right">震央距離 (km)</th>
                      <th className="px-4 py-3 text-right">応答水平加速度 (gal)</th>
                      <th className="px-4 py-3 text-right">震度 (目安)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((eq, i) => (
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
                          <span className={`inline-block font-bold px-2 py-0.5 rounded text-white text-xs ${INTENSITY_COLOR[eq.intensity]}`}>
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
