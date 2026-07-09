import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ResultsMap.css";
import type { Earthquake } from "../types/earthquake";
import { INTENSITY_RING_COLOR } from "../constants/intensityColors";

// Viteでのデフォルトマーカー画像パス解決 (MapSelectorと同様の対応)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type RippleEarthquake = Earthquake & {
  spectrum: number;
  intensity: number;
};

type Props = {
  /** 建物所在地(検索に使用した緯度) */
  buildingLat: number;
  /** 建物所在地(検索に使用した経度) */
  buildingLng: number;
  /** 計算済みの地震結果一覧(応答水平加速度でソート済みでなくてよい) */
  earthquakes: RippleEarthquake[];
};

type RipplePoint = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  /** 波紋開始タイミングをずらすための遅延(秒) */
  delay: number;
};

const TOP_N = 15;
const RING_COUNT = 3;
const RING_STAGGER_SEC = 0.85;

/**
 * 地震IDから 0〜2秒の間で決定的な擬似乱数遅延を作る。
 * Math.random() を直接使うと地図の pan/zoom による再描画のたびに
 * 波紋のタイミングがガタつくため、IDに基づく決定的な値にする。
 */
function seededDelaySeconds(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 200) / 100;
}

function FitBounds({
  points,
  building,
}: {
  points: RipplePoint[];
  building: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const latLngs: [number, number][] = [
      building,
      ...points.map((p): [number, number] => [p.lat, p.lng]),
    ];
    const bounds = L.latLngBounds(latLngs);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
    }
    // pointsの中身(IDの並び)が変わったときのみ再フィットする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.map((p) => p.id).join(","), building[0], building[1]]);

  return null;
}

function RippleLayer({ points }: { points: RipplePoint[] }) {
  const map = useMap();
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((n) => n + 1);
    map.on("move", rerender);
    map.on("zoom", rerender);
    map.on("resize", rerender);
    window.addEventListener("resize", rerender);
    rerender();
    return () => {
      map.off("move", rerender);
      map.off("zoom", rerender);
      map.off("resize", rerender);
      window.removeEventListener("resize", rerender);
    };
  }, [map]);

  const size = map.getSize();

  return (
    <svg
      className="results-map-ripple-layer"
      width={size.x}
      height={size.y}
      aria-hidden="true"
    >
      {points.map((p) => {
        const pt = map.latLngToContainerPoint([p.lat, p.lng]);
        return (
          <g key={p.id}>
            {Array.from({ length: RING_COUNT }).map((_, ringIndex) => (
              <circle
                key={ringIndex}
                cx={pt.x}
                cy={pt.y}
                r={7}
                className="ripple-ring"
                vectorEffect="non-scaling-stroke"
                style={{
                  stroke: p.color,
                  animationDelay: `${p.delay + ringIndex * RING_STAGGER_SEC}s`,
                }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function ResultsMap({ buildingLat, buildingLng, earthquakes }: Props) {
  const building: [number, number] = [buildingLat, buildingLng];

  const topPoints: RipplePoint[] = useMemo(() => {
    return [...earthquakes]
      .filter((eq) => eq.latitude != null && eq.longitude != null)
      .sort((a, b) => b.spectrum - a.spectrum)
      .slice(0, TOP_N)
      .map((eq) => ({
        id: eq.id,
        lat: eq.latitude as number,
        lng: eq.longitude as number,
        color: INTENSITY_RING_COLOR[eq.intensity] ?? INTENSITY_RING_COLOR[0],
        delay: seededDelaySeconds(eq.id),
      }));
  }, [earthquakes]);

  return (
    <div
      className="mb-6 border-2 border-ink overflow-hidden relative"
      style={{ height: "360px" }}
    >
      <MapContainer
        center={building}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={building} />
        <RippleLayer points={topPoints} />
        <FitBounds points={topPoints} building={building} />
      </MapContainer>
    </div>
  );
}

export default ResultsMap;
