import type { Earthquake } from "../types/earthquake";
import earthquakeData from "../data/earthquakes.json";

const earthquakes = [...(earthquakeData as Earthquake[])].sort(
  (a, b) => (a.no ?? Number.MAX_SAFE_INTEGER) - (b.no ?? Number.MAX_SAFE_INTEGER),
);

function AdminPage() {
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-800">
              地震データ
              <span className="ml-2 text-sm font-normal text-gray-400">
                {earthquakes.length} 件
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              データは src/data/earthquakes.json で管理しています。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">地震名</th>
                  <th className="px-4 py-3 text-left">発生日</th>
                  <th className="px-4 py-3 text-left">被災地域</th>
                  <th className="px-4 py-3 text-right">緯度</th>
                  <th className="px-4 py-3 text-right">経度</th>
                  <th className="px-4 py-3 text-right">M</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earthquakes.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{eq.no ?? "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {eq.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {eq.occurred_date ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {eq.affected_area ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 font-mono">
                      {eq.latitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 font-mono">
                      {eq.longitude ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {eq.magnitude ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
