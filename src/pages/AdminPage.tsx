import type { Earthquake } from "../types/earthquake";
import earthquakeData from "../data/earthquakes.json";
import { Card } from "../components/Card";

const earthquakes = [...(earthquakeData as Earthquake[])].sort(
  (a, b) => (a.no ?? Number.MAX_SAFE_INTEGER) - (b.no ?? Number.MAX_SAFE_INTEGER),
);

function AdminPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h1 className="text-h2 text-neutral-900">
              地震データ
              <span className="ml-2 text-sm font-normal text-neutral-400 tabular-nums">
                {earthquakes.length} 件
              </span>
            </h1>
            <p className="text-caption text-neutral-400 mt-1">
              データは src/data/earthquakes.json で管理しています。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-xs">
                  <th className="px-4 py-3 text-left font-medium">No</th>
                  <th className="px-4 py-3 text-left font-medium">地震名</th>
                  <th className="px-4 py-3 text-left font-medium">発生日</th>
                  <th className="px-4 py-3 text-left font-medium">被災地域</th>
                  <th className="px-4 py-3 text-right font-medium">緯度</th>
                  <th className="px-4 py-3 text-right font-medium">経度</th>
                  <th className="px-4 py-3 text-right font-medium">M</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {earthquakes.map((eq) => (
                  <tr
                    key={eq.id}
                    className="transition-colors duration-100 ease-standard hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 text-neutral-400 tabular-nums">
                      {eq.no ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-800">
                      {eq.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {eq.occurred_date ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {eq.affected_area ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                      {eq.latitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                      {eq.longitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                      {eq.magnitude ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminPage;
