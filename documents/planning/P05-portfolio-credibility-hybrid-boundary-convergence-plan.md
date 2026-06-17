---
author: Codex
date: 2026-06-15
title: P05 - Portfolio Credibility Hybrid Boundary Convergence Plan
uuid: 3f8a6d9bf97c4f4d8f37c8845a4b1c2e
version: 0.1
status: synced
---

# 規劃文件 P05 - Portfolio Credibility Hybrid Boundary Convergence Plan

## 1. 背景與動機 (Background & Motivation)

目前專案已完成前幾階段的 real-data integration，並建立 `artifact / script / facade / types` 的資料流與 hybrid boundary。現況下，dashboard 的主要版面已不再是純 mock，但仍保留幾個對作品可信度影響最大的混合邊界：

1. `src/data/dashboardData.ts` 的 `KPI cards` 仍混有 mock-backed 指標，造成首頁最醒目的 summary layer 並非完全對齊真實 artifact。
2. `Time Trend` 雖已支援 monthly real-backed series，但 `daily / weekly` granularity 與其 highlights 仍來自 mock data，互動行為與資料語意並未完全一致。
3. `Customer State` / `Product Category` filter 雖已有 artifact-backed options，但目前刻意維持 disabled；本次不打算將其 productize 為 active filters。

本次 P05 的目的不是把 dashboard 擴成完整 BI 系統，也不是把所有 hybrid area 一次清空，而是聚焦在面試作品集最需要誠實交代、最容易被質疑的資料邊界，做最小必要補強，讓 demo、履歷敘述、walkthrough 都能更一致地說明：

- 主要 summary 與核心趨勢敘事已接上真實 Olist artifact。
- 剩餘 hybrid boundary 是有意識保留，而不是不清楚資料來源的殘留狀態。

## 2. 整體目標 (Overall Goal)

P05 要在不擴大產品範圍的前提下，為目前的 hybrid dashboard 建立一份可落地的 phase-based 收斂計畫，優先處理會直接削弱作品可信度的 mock / hybrid 邊界，並明確定義：

- 這次要收斂哪些 summary / trend 指標。
- 哪些互動仍維持 intentionally disabled 或 intentionally hybrid。
- KPI cards 與 Time Trend 若都要做，應如何排序與拆解。
- 後續可往下拆成哪些 `FXX / RXX` 文檔，而不讓 scope creep 混入新產品能力。

> P05 的優先答案：最應優先收斂的是 `KPI cards`，其次才是 `Time Trend` 的 mock behavior。  
> 原因是 KPI cards 位於 dashboard 第一視覺層，也是面試時最常被拿來口頭總結的指標；若 summary layer 仍混有 mock，整體 real-backed 敘事會先失去可信度。  
> 若兩者都做，建議順序是：`KPI cards fully real-backed` -> `Time Trend granularity / highlight convergence` -> `boundary disclosure / verification`。

## 3. 範圍與影響 (Scope & Impact)

| 影響模組 / 檔案 | 本次規劃定位 | 說明 |
|----------------|-------------|------|
| `src/data/dashboardData.ts` | 主要收斂對象 | 目前同時拼接 phase2 real facade 與 mock KPI / mock trend granularity，是 P05 的核心 hybrid boundary |
| `src/data/phase2DashboardData.ts` | 既有真資料 facade 基底 | 已具備 date range、monthly series、late delivery KPI 等 real-backed 能力，P05 應盡量延續而非重寫 |
| `src/data/dashboardMock.ts` | boundary inventory 對照來源 | 用來盤點哪些 KPI / granularity / highlights 仍依賴 mock |
| `src/components/DashboardPage.tsx` | UI boundary disclosure 影響點 | 目前已有 hybrid boundary 文案，後續需與實際資料邊界保持一致 |
| `src/components/TimeTrendPanel.tsx` | trend behavior 收斂對象 | monthly 已 real-backed，daily / weekly tabs 與 subtitle/highlights 仍具 mock 性質 |
| `src/components/FilterBar.tsx` | 明確維持現狀 | `Customer State` / `Product Category` 仍維持 disabled，不納入本次啟用 |
| artifact generation / verification scripts | 可能需要最小延伸 | 僅在支撐 KPI / Time Trend 收斂所必須時才擴充，不延伸到新維度 productization |

## 4. 分階段計畫 (Phase Plan)

### Phase Summary

| Phase | 狀態 | 階段名稱 | 目標摘要 | 預計對應文檔類型 | 預計對應文檔 |
|------|------|---------|---------|----------------|-------------|
| P1 | [x] 已完成 | 現況盤點與 scope freeze | 明確列出目前 KPI / Time Trend / disabled filters 的 hybrid 邊界與本次收斂順序 | FXX | `documents/implements/F07-p05-boundary-inventory-contract.md` |
| P2 | [x] 已完成 | KPI cards fully real-backed 收斂 | KPI row 已完全切到 artifact-backed facade，首頁不再混入 mock KPI；本輪同步補齊文件與型別語意清理 | FXX | `documents/implements/F08-p05-kpi-cards-real-backed-contract.md` |
| P3 | [ ] 未開始 | Time Trend mock behavior 最小收斂 | 收斂 granularity / highlight / subtitle 的 mock 性質，但不擴成完整多 grain productization | FXX + RXX | `documents/implements/F09-p05-time-trend-convergence-contract.md` / `documents/implements/R01-p05-dashboard-facade-boundary-cleanup.md` |
| P4 | [ ] 未開始 | Boundary disclosure 與驗收基線 | 讓 UI 說明、驗收方式、portfolio disclosure 與實際資料邊界一致 | FXX | `documents/implements/F10-p05-portfolio-disclosure-verification.md` |

> Sync note (2026-06-17): P1、P2 已完成。`src/data/dashboardData.ts` 已完全改為透過 `buildPhase2KpiCards()` 輸出 KPI，`src/data/phase2DashboardData.ts` 已以 artifact/review panel 計算 `Avg Review Score`，`DashboardPage.tsx` 已揭露目前 hybrid boundary，且 KPI card 的 `delta / comparison / tone` 舊 mock 語意已自 app-facing 型別與元件移除。

---

### Phase 1 - 現況盤點與 scope freeze

**目標**

在開始任何 FXX 實作前，先把目前 dashboard 中真正影響作品可信度的 mock / hybrid 邊界盤點清楚，並凍結本次只處理的範圍，避免後續把 disabled filters、geography semantics、更多 panel productization 一併捲入。

**範圍**

- 盤點 `KPI cards` 各張卡片的資料來源現況。
- 盤點 `Time Trend` 在 `monthly / weekly / daily` 三種 granularity 下的 series、highlights、subtitle、interaction 行為來源。
- 確認 `Customer State` / `Product Category` 雖然 options 已 artifact-backed，但本次仍維持 disabled。
- 明確定義「portfolio credibility 最小補強」的驗收標準，而非「全 dashboard fully real-backed」。

**Checklist**

- [ ] 列出 `dashboardData.ts` 中目前哪些 KPI 是 real-backed、哪些仍是 mock-backed。
- [ ] 列出 `Time Trend` 中哪些部分已 real-backed，哪些仍屬 mock-backed behavior。
- [ ] 確認本次不啟用 `Customer State` / `Product Category` filters。
- [ ] 確認本次不新增新的 filter semantics、API、backend、warehouse、或完整 BI drill-down。
- [ ] 形成一份後續 FXX 可直接引用的 boundary inventory 與優先順序結論。

**預計對應的 FXX / RXX 類型**

`FXX` - boundary inventory / scope contract

**驗收重點**

- 後續所有 phase 都能引用同一套 boundary 定義。
- 優先順序有明確答案：先 KPI，後 Time Trend。
- scope creep 來源已被明示排除。

---

### Phase 2 - KPI cards fully real-backed 收斂

**目標**

優先把 dashboard 第一視覺層的 summary 指標從「部分 real-backed、部分 mock-backed」收斂為一致的 real-backed 敘事，讓使用者在 demo 時不需要先為 KPI 的資料來源做額外保留。

**範圍**

- 針對 `KPI cards` 做最小必要真資料收斂。
- 優先處理目前仍由 `mockKpiCards` 提供的卡片。
- 可接受這一階段只把「適合用現有 artifact 或最小 artifact extension 支撐」的 KPI 收斂為 real-backed。
- 若某些 KPI 需要過度擴大資料模型或引入新的 product semantics，需在 contract 中明確標示是否延後或留在 hybrid。

**Checklist**

- [x] 確認每張 KPI card 是否值得納入本次 real-backed 收斂。
- [x] 確認 `Avg Delivery Days` 不以 mock card 留在首頁，並降級為後續 artifact extension 議題。
- [x] 確認 `Avg Review Score` 以既有 `reviewPanelsByRange` 聚合為 real-backed KPI。
- [x] 移除 app-facing KPI `delta / comparison / tone` 型別與渲染分支，避免殘留 mock period comparison 語意。
- [x] 定義完成後的 KPI layer 對 portfolio 的可敘述版本。

**預計對應的 FXX / RXX 類型**

**目前同步狀態（2026-06-17）**

- [x] `dashboardData.ts` 已改為直接委派 `buildPhase2KpiCards(rangeId)`
- [x] `Total Orders` / `Total GMV` / `Late Delivery Rate` 已由 artifact KPI facade 輸出
- [x] `Avg Review Score` 已改為由 `reviewPanelsByRange` 聚合計算
- [x] `Avg Delivery Days` 已自首頁 KPI row 移除，保留為後續 artifact extension 議題
- [x] UI disclosure、文件同步與 KPI 舊比較語意清理已完成

`FXX` - KPI cards real-backed contract

**驗收重點**

- 首屏 KPI 不再混用 mock-backed 與 real-backed 指標。
- 使用者可以誠實說明 KPI summary 來自 artifact，而不是「部分真、部分展示用假資料」。
- 若有保留項，也能清楚說明是刻意不納入，而不是遺漏。

---

### Phase 3 - Time Trend mock behavior 最小收斂

**目標**

在 KPI summary layer 已收斂後，再處理 `Time Trend` 中仍帶 mock 性質的 granularity / highlights / subtitle / interaction，讓核心趨勢敘事與 summary layer 互相一致。

**範圍**

- 盤點 `daily / weekly / monthly` 三種 granularity 是否都應保留。
- 若無法在最小成本下提供真資料 `daily / weekly`，可考慮縮減互動，而不是硬做新資料產品。
- 收斂 `highlights` 與 `subtitle` 文案，使其不再混雜 mock 假設。
- 視需要對 `dashboardData.ts` 做 boundary-oriented refactor，將 trend source selection 與 UI-facing copy 分離。

**Checklist**

- [ ] 評估保留 `daily / weekly` tabs 的價值是否高於其 mock 風險。
- [ ] 若保留多 granularity，定義其 real-backed artifact 需求是否仍屬最小補強。
- [ ] 若不保留多 granularity，定義更小範圍的 interaction convergence 方案。
- [ ] 收斂 `Time Trend` highlights，避免 monthly real data 與 weekly-style mock delta 同時存在。
- [ ] 視需要提出 `dashboardData.ts` / trend selector 的最小 refactor 邊界，避免之後再累積新的 source-mixing。

**預計對應的 FXX / RXX 類型**

`FXX` - Time Trend convergence contract  
`RXX` - dashboard facade / boundary cleanup

**驗收重點**

- `Time Trend` 的可見互動與可見文案不再暗示不存在的真資料 granularity。
- 使用者能清楚說明目前 trend 支援到哪個 grain，以及為何這是刻意的最小範圍。
- 資料來源切換邏輯比目前更清楚，不再把 mock fallback 散落在 summary-facing path。

---

### Phase 4 - Boundary disclosure 與驗收基線

**目標**

在 KPI 與 Time Trend 收斂後，補齊最後一層對外敘事與驗收方式，確保 UI 文案、README / portfolio 說法、以及驗收檢查都與真實邊界一致。

**範圍**

- 更新 dashboard 內的 hybrid boundary 說明文案。
- 定義本次驗收所需的 manual verification / artifact verification / build checks。
- 明確記錄「現在已 real-backed 的核心敘事」與「仍 intentionally disabled / intentionally hybrid 的區域」。
- 提供後續面試 walkthrough 可重複使用的 disclosure 語句。

**Checklist**

- [ ] UI 中的 hybrid boundary 說明需與實際收斂結果一致。
- [ ] 定義最小驗收清單：artifact source、KPI source、Time Trend source、build / smoke check。
- [ ] 將 disabled filters 與未 productize 的區域列為 intentionally out of scope。
- [ ] 明確寫出 portfolio walkthrough 時可使用的誠實說法。
- [ ] 確認 P05 完成後，不會被誤解為「全 dashboard fully real-backed」。

**預計對應的 FXX / RXX 類型**

`FXX` - portfolio disclosure / verification contract

**驗收重點**

- UI 說明、文件說明、實際資料來源三者一致。
- 作品集敘事能誠實而有說服力地描述 current state。
- 後續若再做 P06+，也能明確知道是擴範圍，而不是補 P05 漏項。

## 5. Out of Scope

以下項目明確不屬於 P05：

- 啟用 `Customer State` filter
- 啟用 `Product Category` filter
- 把 `Payment Type` 影響範圍擴到 geography / category / review panels
- 將 dashboard 改造成 fully productized BI system
- 新增 API、backend、database、warehouse、scheduled ETL
- 重新設計 geospatial semantics 或重做 map interaction
- 擴增到完整 `daily / weekly / monthly` 多 grain analytics 產品
- 為了補 KPI / Time Trend 而順便重寫整個 facade / component tree
- 追求所有 panel 100% fully real-backed

## 6. 優先順序結論

### P05 最應優先收斂的是什麼？

最應優先收斂的是 `KPI cards`。

理由：

1. KPI 是 dashboard 第一視覺層，也是最容易在面試中被直接引用的 summary。
2. 目前 `dashboardData.ts` 中 KPI 同時混用 real cards 與 `mockKpiCards`，這比 Time Trend granularity 更容易讓整體敘事失真。
3. 一旦 summary layer 還混有 mock，後續即使 Time Trend 再真，也難以支撐「核心指標已 real-backed」的說法。

### 如果 KPI 與 Time Trend 都做，順序應如何安排？

建議順序：

1. `KPI cards fully real-backed`
2. `Time Trend granularity / highlight / behavior convergence`
3. `boundary disclosure / verification baseline`

原因：

1. 先收斂 KPI，能先解決最顯眼的 credibility gap。
2. 再收斂 Time Trend，才能決定是否保留 `daily / weekly` tabs，或縮減為更誠實的 monthly-first interaction。
3. 最後再更新 boundary disclosure，才能讓文案反映最終狀態，而不是先寫死說法又被後續實作推翻。

## 7. 建議下一步

P05 完成後，建議依序往下拆：

1. 使用 `ddd-doc` 起草 `F07-p05-boundary-inventory-contract.md`
2. 以 `F07` 結論為依據，起草 `F08-p05-kpi-cards-real-backed-contract.md`
3. 視 `F08` 結果，再決定 `F09` 是否走「真資料多 granularity」或「縮減互動、降低 mock 風險」路線
4. 若 facade source-mixing 在 `dashboardData.ts` 已明顯造成理解成本，再補 `R01-p05-dashboard-facade-boundary-cleanup.md`
## 8. Latest Sync Note (2026-06-17)

- P1 已完成。
- P2 已完成，且核心 KPI facade 已落地到程式與文件。
- `buildKpiCards()` 已改為走 `buildPhase2KpiCards()`。
- `Avg Review Score` 已由 artifact-backed review panel 聚合計算。
- `Avg Delivery Days` 未納入本輪 artifact extension，但也已不再以 mock KPI 留在首頁。
- KPI card 的 `delta / comparison / tone` 舊 mock 比較語意已自 app-facing 型別與元件移除。
- P3 / P4 尚未開始；`Time Trend` 仍維持 monthly real-backed、daily/weekly mock-backed 的 hybrid 狀態。
