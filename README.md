# 日本中の耐震検査

建物の緯度・経度・地盤種別・固有周期から、過去の地震に対する推定応答水平加速度（gal）と推定震度を一覧表示するWebアプリ。

**URL**: https://naoya25.github.io/earthquake-checker/

## 技術スタック

| カテゴリ         | 技術                                    |
| ---------------- | --------------------------------------- |
| フロントエンド   | React 19 + TypeScript + Vite            |
| スタイリング     | Tailwind CSS v4                         |
| ルーティング     | React Router v7                         |
| データベース     | Supabase (PostgreSQL)                   |
| 地図             | Leaflet + react-leaflet (OpenStreetMap) |
| ジオコーディング | Nominatim API (OpenStreetMap)           |
| デプロイ         | GitHub Pages + GitHub Actions           |
