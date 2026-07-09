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
          <div className="px-6 py-4 border-b-2 border-ink">
            <h1 className="text-h2 text-ink">
              地震データ
              <span className="ml-2 text-sm font-normal data-num text-ink-muted">
                {earthquakes.length} 件
              </span>
            </h1>
            <p className="text-caption text-ink-muted mt-1">
              データは src/data/earthquakes.json で管理しています。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink text-paper text-xs">
                  <th className="px-4 py-3 text-left font-bold">No</th>
                  <th className="px-4 py-3 text-left font-bold">地震名</th>
                  <th className="px-4 py-3 text-left font-bold">発生日</th>
                  <th className="px-4 py-3 text-left font-bold">被災地域</th>
                  <th className="px-4 py-3 text-right font-bold">緯度</th>
                  <th className="px-4 py-3 text-right font-bold">経度</th>
                  <th className="px-4 py-3 text-right font-bold">M</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink">
                {earthquakes.map((eq) => (
                  <tr
                    key={eq.id}
                    className="transition-colors duration-100 ease-standard hover:bg-accent/10"
                  >
                    <td className="px-4 py-3 data-num text-ink-muted">
                      {eq.no ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {eq.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 data-num text-ink">
                      {eq.occurred_date ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {eq.affected_area ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right data-num text-ink-muted">
                      {eq.latitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right data-num text-ink-muted">
                      {eq.longitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right data-num text-ink">
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
