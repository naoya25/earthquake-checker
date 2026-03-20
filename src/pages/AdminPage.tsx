import { useState, useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Earthquake } from "../types/earthquake";
import LoginForm from "../components/LoginForm";

// ---- 編集・追加モーダル ----

type EarthquakeFormData = Omit<Earthquake, "id" | "created_at" | "updated_at">;

const EMPTY_FORM: EarthquakeFormData = {
  no: null,
  name: null,
  occurred_date: null,
  affected_area: null,
  latitude: null,
  longitude: null,
  magnitude: null,
};

function EarthquakeModal({
  initial,
  onSave,
  onClose,
}: {
  initial: EarthquakeFormData;
  onSave: (data: EarthquakeFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EarthquakeFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof EarthquakeFormData, value: string) => {
    setForm((f) => ({
      ...f,
      [key]:
        value === ""
          ? null
          : ["no", "latitude", "longitude", "magnitude"].includes(key)
            ? Number(value)
            : value,
    }));
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const fields: {
    key: keyof EarthquakeFormData;
    label: string;
    type: string;
    placeholder: string;
  }[] = [
    { key: "no", label: "No", type: "number", placeholder: "例: 1" },
    {
      key: "name",
      label: "地震名",
      type: "text",
      placeholder: "例: 関東大地震",
    },
    {
      key: "occurred_date",
      label: "発生日",
      type: "text",
      placeholder: "例: 1923-09-01",
    },
    {
      key: "affected_area",
      label: "被災地域",
      type: "text",
      placeholder: "例: 関東地方",
    },
    {
      key: "latitude",
      label: "緯度",
      type: "number",
      placeholder: "例: 35.68",
    },
    {
      key: "longitude",
      label: "経度",
      type: "number",
      placeholder: "例: 139.76",
    },
    {
      key: "magnitude",
      label: "マグニチュード",
      type: "number",
      placeholder: "例: 7.9",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {initial === EMPTY_FORM ? "地震データを追加" : "地震データを編集"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}
              </label>
              <input
                type={f.type}
                step="any"
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- 管理ダッシュボード ----

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<Earthquake | "new" | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Earthquake | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshRef = useRef(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchAll = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    void refreshRef;
    supabase
      .from("earthquakes")
      .select("*")
      .order("no", { ascending: true })
      .then(({ data }) => {
        setEarthquakes((data as Earthquake[]) ?? []);
        setLoading(false);
      });
  }, [refreshKey]);

  const handleSave = async (data: EarthquakeFormData) => {
    if (modalTarget === "new") {
      const { error } = await supabase.from("earthquakes").insert([data]);
      if (error) throw new Error(error.message);
    } else if (modalTarget) {
      const { error } = await supabase
        .from("earthquakes")
        .update(data)
        .eq("id", modalTarget.id);
      if (error) throw new Error(error.message);
    }
    await fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("earthquakes").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await fetchAll();
  };

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              地震データ管理
              <span className="ml-2 text-sm font-normal text-gray-400">
                {earthquakes.length} 件
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalTarget("new")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                ＋ 追加
              </button>
              <button
                onClick={onLogout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              読み込み中...
            </div>
          ) : (
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
                    <th className="px-4 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {earthquakes.map((eq) => (
                    <tr
                      key={eq.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {eq.no ?? "-"}
                      </td>
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
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setModalTarget(eq)}
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                          >
                            編集
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => setDeleteTarget(eq)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalTarget !== null && (
        <EarthquakeModal
          initial={
            modalTarget === "new"
              ? EMPTY_FORM
              : {
                  no: modalTarget.no,
                  name: modalTarget.name,
                  occurred_date: modalTarget.occurred_date,
                  affected_area: modalTarget.affected_area,
                  latitude: modalTarget.latitude,
                  longitude: modalTarget.longitude,
                  magnitude: modalTarget.magnitude,
                }
          }
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">削除の確認</h2>
            <p className="text-sm text-gray-600 mb-6">
              「{deleteTarget.name ?? "この地震"}
              」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- メインコンポーネント ----

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (checking)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  return session ? <AdminDashboard onLogout={handleLogout} /> : <LoginForm />;
}

export default AdminPage;
