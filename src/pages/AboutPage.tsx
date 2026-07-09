import { Card } from "../components/Card";

type NaturalPeriodRow = {
  label: string;
  rc: string;
  s: string;
  w: string;
};

const NATURAL_PERIOD_TABLE: NaturalPeriodRow[] = [
  { label: "平屋", rc: "-", s: "0.10~0.18", w: "0.1~0.2" },
  { label: "2階建", rc: "0.15~0.20", s: "0.18~0.25", w: "0.2~0.3" },
  { label: "5階建", rc: "0.25~0.35", s: "0.35~0.50", w: "-" },
  { label: "10階建", rc: "0.6~1.0", s: "0.9~1.5", w: "-" },
  { label: "20階建", rc: "0.9~1.2", s: "1.8~3.0", w: "-" },
];

const INTENSITY_TABLE = [
  { level: 7, name: "激震", range: "400 〜" },
  { level: 6, name: "烈震", range: "250 〜 400" },
  { level: 5, name: "強震", range: "80 〜 250" },
  { level: 4, name: "中震", range: "25 〜 80" },
  { level: 3, name: "弱震", range: "8 〜 25" },
  { level: 2, name: "軽震", range: "2.5 〜 8" },
  { level: 1, name: "微震", range: "0.8 〜 2.5" },
  { level: 0, name: "無震", range: "〜 0.8" },
];

const INTENSITY_COLOR: Record<number, string> = {
  7: "bg-red-700",
  6: "bg-red-500",
  5: "bg-orange-500",
  4: "bg-yellow-500",
  3: "bg-blue-600",
  2: "bg-blue-400",
  1: "bg-gray-500",
  0: "bg-gray-400",
};

function AboutPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6 sm:p-8">
          <h1 className="text-h1 text-ink mb-6">
            このアプリについて
          </h1>

          <section className="mb-8">
            <h2 className="text-h3 text-ink mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent inline-block" />
              取扱い説明書
            </h2>
            <ul className="space-y-2.5 text-sm text-ink-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                任意地点の緯度と経度を入力すると、主な既往地震に対する推定応答値がわかります。
              </li>
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                対象構造物の地盤種別と固有周期を絞り込めると、より正確な推定応答値がわかります。
              </li>
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                旧震度階級（震度0〜7）と推定応答値（応答加速度）の関係は下表の通りです。なお、980
                gal が 1G（重力加速度）です。
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-h3 text-ink mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent inline-block" />
              旧震度階級と推定応答値の対応
            </h2>
            <div className="overflow-x-auto border-2 border-ink">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink text-paper text-xs">
                    <th className="px-4 py-3 text-left font-bold">震度階級</th>
                    <th className="px-4 py-3 text-left font-bold">名称</th>
                    <th className="px-4 py-3 text-right font-bold">
                      応答加速度 (gal)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink">
                  {INTENSITY_TABLE.map((row) => (
                    <tr
                      key={row.level}
                      className="transition-colors duration-100 ease-standard hover:bg-accent/10"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 text-white text-xs data-num ${INTENSITY_COLOR[row.level]}`}
                        >
                          震度 {row.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-right data-num text-ink-muted">
                        {row.range}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-h3 text-ink mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent inline-block" />
              地盤種別
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "第Ⅰ種（硬質地盤）",
                  desc: "岩盤や砂礫層。最も揺れにくい。",
                },
                {
                  label: "第Ⅱ種（普通地盤）",
                  desc: "洪積層など、比較的しっかりした土砂層。",
                },
                {
                  label: "第Ⅲ種（軟弱地盤）",
                  desc: "沖積層、埋立地、粘性土など。地震の際に最も揺れやすい。",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex gap-3 items-start border-2 border-ink px-4 py-3 text-sm bg-paper text-ink-muted"
                >
                  <span className="font-bold text-ink whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-ink-muted">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-h3 text-ink mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent inline-block" />
              固有周期の目安 (s)
            </h2>
            <p className="text-caption text-ink-muted mb-3">
              建物の構造形式・階数による固有周期のおおよその目安です。
            </p>
            <div className="overflow-x-auto border-2 border-ink">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink text-paper text-xs">
                    <th className="px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-center font-bold" colSpan={2}>
                      鉄筋コンクリート
                    </th>
                    <th
                      className="px-4 py-3 text-center font-bold border-l-2 border-paper/30"
                      colSpan={2}
                    >
                      鉄骨
                    </th>
                    <th
                      className="px-4 py-3 text-center font-bold border-l-2 border-paper/30"
                      colSpan={2}
                    >
                      木造
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink">
                  <tr className="bg-paper text-xs">
                    <td className="px-4 py-2 font-bold text-ink">
                      築年数
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted">
                      <div className="text-ink-muted font-normal text-xs">
                        1996年以降
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted">
                      <div className="text-ink-muted font-normal text-xs">
                        1995年以前
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted border-l-2 border-ink">
                      <div className="text-ink-muted font-normal text-xs">
                        1996年以降
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted">
                      <div className="text-ink-muted font-normal text-xs">
                        1995年以前
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted border-l-2 border-ink">
                      <div className="text-ink-muted font-normal text-xs">
                        1996年以降
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center data-num text-ink-muted">
                      <div className="text-ink-muted font-normal text-xs">
                        1995年以前
                      </div>
                    </td>
                  </tr>
                  {NATURAL_PERIOD_TABLE.map((row) => (
                    <tr
                      key={row.label}
                      className="transition-colors duration-100 ease-standard hover:bg-accent/10"
                    >
                      <td className="px-4 py-3 font-bold text-ink">
                        {row.label}
                      </td>
                      <td
                        className="px-4 py-3 text-center data-num text-ink-muted"
                        colSpan={2}
                      >
                        {row.rc}
                      </td>
                      <td
                        className="px-4 py-3 text-center data-num text-ink-muted border-l-2 border-ink"
                        colSpan={2}
                      >
                        {row.s}
                      </td>
                      <td
                        className="px-4 py-3 text-center data-num text-ink-muted border-l-2 border-ink"
                        colSpan={2}
                      >
                        {row.w}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-ink mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent inline-block" />
              注意事項
            </h2>
            <ul className="space-y-2.5 text-sm text-ink-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                本アプリで使用する震度は、2026年3月現在の震度階級ではなく
                <strong className="text-ink">旧震度階級（0〜7）</strong>
                です。
              </li>
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                掲載している地震は主要なものに絞っており、抜け漏れが存在する場合があります。また、一部の記録には解釈が含まれます。なお、今後発生する地震が随時追加されるとは限りません。
              </li>
              <li className="flex gap-2">
                <span className="text-accent mt-0.5">・</span>
                本アプリの
                <strong className="text-ink">
                  営利目的での利用を禁止
                </strong>
                します。
              </li>
            </ul>
          </section>
        </Card>
      </div>
    </div>
  );
}

export default AboutPage;
