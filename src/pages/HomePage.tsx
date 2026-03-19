import { useState } from "react";
import type { GroundType, NaturalPeriod } from "../types/earthquake";
import { NATURAL_PERIOD_OPTIONS } from "../types/earthquake";

type FormValues = {
  latitude: string;
  longitude: string;
  groundType: GroundType;
  naturalPeriod: NaturalPeriod;
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
    groundType: "I",
    naturalPeriod: 0.3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("送信:", form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">地震チェッカー</h1>

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
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
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
              地盤の種類
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            検索する
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
