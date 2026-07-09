// 震度(intensity)ごとの色定義。
// テーブルの震度バッジ(Tailwindクラス)と地図の波紋リング(16進カラー)の
// 両方から参照される単一の定義source。

/** テーブルの震度バッジ用 Tailwind 背景色クラス */
export const INTENSITY_BADGE_CLASS: Record<number, string> = {
  0: "bg-gray-400",
  1: "bg-gray-500",
  2: "bg-blue-400",
  3: "bg-blue-600",
  4: "bg-yellow-500",
  5: "bg-orange-500",
  6: "bg-red-500",
  7: "bg-red-700",
};

/** 地図の波紋リング用 16進カラー(上記 Tailwind クラスと同系色) */
export const INTENSITY_RING_COLOR: Record<number, string> = {
  0: "#9ca3af", // gray-400
  1: "#6b7280", // gray-500
  2: "#60a5fa", // blue-400
  3: "#2563eb", // blue-600
  4: "#eab308", // yellow-500
  5: "#f97316", // orange-500
  6: "#ef4444", // red-500
  7: "#b91c1c", // red-700
};
