# Brazil Retail Story Dashboard

這是一個互動式作品集儀表板，將 Olist 巴西電商資料集整理成適合招募方閱讀的零售分析故事，重點是可操作的篩選與分析，不是靜態截圖。

線上展示：`ADD_YOUR_VERCEL_URL_HERE`

## 分析亮點

- 使用真實的 Olist 交易資料，並轉換成可穩定公開部署的靜態 dashboard artifact。
- 支援 `Date Range`、`Customer State`、`Product Category` 與付款行為等互動式 cohort 篩選。
- 提供適合作品集展示的分析視角，包含 KPI 摘要、區域需求、品類結構、配送表現、運費分布與評論關聯。

## 技術棧

- `Vite`
- `React`
- `TypeScript`
- `Recharts`
- 建置時由原始 CSV 產生的靜態 JSON artifact

## 本機執行

```bash
npm install
npm run build
npm run preview
```

## Vercel 部署

此專案已可直接部署到 Vercel，並採用靜態站點方式發布。

- 目前設定不需要額外建立 `vercel.json`。
- Vercel 可直接使用既有的 `npm run build` 指令。
- 建置輸出目錄為預設的 Vite `dist/`。
- 大型 dashboard artifact 會在建置期間由已提交的 CSV 原始資料產生，因此不需要手動提交產物檔。

### 最短部署流程

1. 將此 repo 推到 GitHub。
2. 使用 GitHub 帳號登入 Vercel。
3. 點選 `Add New...` -> `Project`。
4. 匯入這個 repository。
5. 確認以下設定：
   - Framework Preset：`Vite`
   - Build Command：`npm run build`
   - Output Directory：`dist`
6. 點選 `Deploy`。
7. 部署完成後，複製公開的 Vercel 網址，並替換上方的 `ADD_YOUR_VERCEL_URL_HERE`。

## 部署補充說明

- `vite.config.ts` 使用 `publicDir: data/public`，因此 `data/public/` 內的內容會自動複製到 `dist/`。
- dashboard artifact 透過 `import.meta.env.BASE_URL` 讀取，這對 Vercel 根目錄部署是安全的，未來若改掛在子路徑下也比較穩定。
- 如果未來要部署到非根路徑，請設定 `VITE_BASE_PATH`，例如 `/brazil-retail-story-dashboard/`。
- 這個專案目前沒有使用 client-side routing，因此不需要額外設定 SPA rewrite。

## 分享前要注意的風險

- `data/public/dashboard-artifacts/phase2DashboardArtifact.json` 大約有 `65 MB`，即使是靜態託管，首次載入仍可能偏慢。
- 正式版 JS bundle 在傳輸壓縮前約為 `613 kB`，對作品集來說可接受，但仍比輕量型 landing page 更重。
- 由於瀏覽器需要載入大型 JSON artifact，行動裝置或較慢的網路環境會比桌機更容易感受到延遲。
