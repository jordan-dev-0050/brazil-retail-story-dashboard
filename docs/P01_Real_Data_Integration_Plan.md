---
author: Codex
date: 2026-06-04
title: 真實資料整合第一階段總規劃
uuid: 8f4d34e7dc2d4fb6ac8e1b5b7b84ab31
version: 0.1
status: synced
---

# 規劃書 – 真實資料整合第一階段

## 1. 背景與動機 (Background & Motivation)

目前 dashboard 主要使用 [src/data/dashboardMock.ts](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/dashboardMock.ts) 提供展示資料，畫面上的 KPI、Time Trend、篩選器選項與其他圖表資料皆為假資料。專案中已具備 Olist 真實資料 CSV，位於 `data/` 目錄，可用資料包含 `orders`、`order_items`、`payments`、`customers`、`products`、`sellers`、`reviews`、`geolocation` 與 category translation。

這份規劃聚焦在從 mock data 過渡到 real data 的第一階段，只處理足以驗證資料鏈路、前端接線方式與日期篩選行為的最小成功切面，避免一開始就把 map、category、payment、delivery、review 等額外依賴一起拉進來。

本次規劃要解的核心問題如下：

1. 如何讓 dashboard 在不直接讀原始 CSV 的前提下開始使用真實資料。
2. 如何用最小切面驗證資料模型、前端接線與日期篩選鏈路。
3. 如何避免一次拔掉 mock，保留安全回退與視覺比對能力。
4. 如何把第一階段的產出整理成後續 DDD 工作可持續推進的基礎。

## 2. 總體目標 (Overall Goal)

當這份規劃的各階段完成後，使用者能在不破壞現有 dashboard 體驗的前提下，切換到一個以 Olist 真實資料驅動的最小版本，並看到 `KPI + Time Trend + Date Filter` 真正隨真實資料變化；同時團隊保留 mock / real 並存能力，能逐步擴大 real-backed 範圍，而不是一次性重構整個 dashboard。

## 3. 影響範圍 (Scope & Impact)

| 受影響模組 / 功能 | 預計改動類型 | 備註 |
|----------------|-------------|------|
| `data/` Olist CSV 輸入資料 | 新增功能 | 作為第一階段真實資料來源 |
| dashboard artifact 產出流程 | 新增功能 | 產出 dashboard-ready 中間結果檔 |
| KPI 資料來源 | 新增功能 | 由 mock 切換為可讀取 real artifact |
| Time Trend 資料來源 | 新增功能 | 以 `order_purchase_timestamp` 月序列驅動 |
| `Date Range` 篩選 | 新增功能 | 第一版唯一真正影響資料的 filter |
| mock / real 切換機制 | 新增功能 | 保留雙資料源並存與回退能力 |
| 其他圖表與 filters UI | 修正 | 暫時保留 UI，但不接真實邏輯 |

## 4. 各階段計劃 (Phase Plan)

### 總覽

| 階段 | 名稱 | 建議文檔類型 | 關聯文檔 | 狀態 |
|------|------|------------|--------|------|
| P1 | 規格收斂與資料定義 | FXX | [F01-real-data-phase1-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F01-real-data-phase1-contract.md) | [x] 已完成 |
| P2 | 真資料 artifact 生成 | FXX | [F02-real-data-phase2-artifact-generation.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F02-real-data-phase2-artifact-generation.md) | [x] 已完成 |
| P3 | 前端最小接線與雙資料源切換 | FXX | [F03-real-data-phase3-dashboard-switch.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F03-real-data-phase3-dashboard-switch.md) | [x] 已完成 |
| P4 | 人工驗證與範圍封板 | FXX | [verify-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/verify-phase2-dashboard-artifact.mjs) | [~] 部分完成 |

---

### 階段 1 — 規格收斂與資料定義

**描述**
先鎖定第一階段的成功條件、資料母體、KPI 定義、日期範圍、artifact 責任邊界與 mock / real 切換策略，避免後續實作時一邊接資料一邊重談規則。

第一階段已知決策與規劃假設如下：

- 第一階段只處理 `KPI + Time Trend`。
- 主時間軸使用 `order_purchase_timestamp`。
- 第一版指標只做「訂單數」與「GMV」。
- 第一版 `GMV` 採 `order_items.price` 加總，不含 `freight_value`。
- 第一版訂單數母體為 `order_status = delivered`、`order_purchase_timestamp` 非空，時間窗限定於 `2017-01-01` 至 `2018-08-31`。
- 第一版時間範圍選項固定為 `All Period (2017-01 to 2018-08)`、`2017 Full Year`、`2018 YTD (Jan-Aug)`。
- 前端不直接讀原始 CSV，而是讀取單一 dashboard-ready artifact。
- mock 與 real data 先並存，切換先用程式內簡單開關。
- 第一版只處理 dashboard 首屏所需資料，不預先為後續頁面抽象化。

**使用者確認方式**
- [x] 團隊可以清楚回答第一版做什麼、不做什麼，且不再對 `GMV`、訂單母體、日期區間定義有歧義。
- [x] 團隊可以指出第一版唯一真正接真實資料的範圍是 `KPI + Time Trend + Date Filter`，其餘區塊仍保留 mock 或 placeholder。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：[F01-real-data-phase1-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F01-real-data-phase1-contract.md)

**狀態**：`[x] 已完成`

---

### 階段 2 — 真資料 artifact 生成

**描述**
從 Olist CSV 產出一份可供 dashboard 直接使用的中間結果檔，完成原始資料到 dashboard view model 的第一次穩定轉譯。

這個 artifact 的責任是承接原始 CSV 與前端呈現之間的轉譯層，而不是把 CSV 搬進前端。第一版 schema 只需要覆蓋 `KPI + Time Trend + Date Filter`，建議至少包含：

- `metadata`
- `dateRanges`
- `kpisByRange`
- `monthlySeriesByRange`

第一版 schema 明確不包含：

- 成長率、MoM、QoQ、YoY
- comparison label 與 previous period 值
- customer state / product category / payment type 的真實過濾結果
- 地圖、delivery、review 資料
- daily / weekly 等多粒度時間序列

**使用者確認方式**
- [x] 產出的 artifact 可被前端直接匯入，且至少能提供一組全期間 KPI 與對應月序列。
- [x] 抽查若干月份與日期區間後，artifact 中的訂單數與 GMV 可與原始 CSV 聚合結果對上。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：[F02-real-data-phase2-artifact-generation.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F02-real-data-phase2-artifact-generation.md)

**狀態**：`[x] 已完成`

---

### 階段 3 — 前端最小接線與雙資料源切換

**描述**
在不破壞現有畫面的前提下，讓 dashboard 能切換使用真資料，且第一版只有 `KPI + Time Trend + Date Filter` 真正接上 real data。

這一階段應：

- 在程式內加入 mock / real 簡單開關。
- 讓 KPI 改讀真資料欄位。
- 讓 Time Trend 改讀真資料月序列。
- 讓日期篩選固定選項實際影響上述兩個區塊。
- 保留其他篩選器 UI，但仍使用 mock 邏輯或不產生真實資料效果。

**使用者確認方式**
- [x] 切到 real 模式後，KPI 與 Time Trend 顯示真實資料，切換日期選項時兩者會同步變化。
- [x] 切回 mock 模式後，畫面仍可正常展示，其他未接真資料的區塊不會因第一階段接線而壞掉。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：[F03-real-data-phase3-dashboard-switch.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F03-real-data-phase3-dashboard-switch.md)

**狀態**：`[x] 已完成`

---

### 階段 4 — 人工驗證與範圍封板

**描述**
在人眼可控成本內，確認第一階段資料鏈路與畫面行為可靠，並為下一輪 DDD 工作建立明確邊界。

此階段聚焦：

- 對帳全期間與數個指定日期區間的 KPI。
- 對帳數個月份的 orders / GMV 趨勢值。
- 驗證 mock / real 切換行為。
- 記錄第一階段已知限制與下一階段候選項。

**使用者確認方式**
- [ ] 人工核對結果可說明 KPI 與月趨勢可信，且團隊同意第一階段已達最小可成功版本。
- [x] 已知問題被明確記錄，沒有在同一輪驗證中被無限制吸收成新的 scope。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：[verify-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/verify-phase2-dashboard-artifact.mjs)

**狀態**：`[~] 部分完成`

---

## 5. 接棒說明（AI 指引）

> 本節為接棒 AI 的執行指引。

接棒 AI 在開始工作前，請依序執行：

1. 閱讀「總體目標」與「各階段計劃」，先把第一階段限定在 `KPI + Time Trend + Date Filter` 的最小成功切面。
2. 目前 `P1`、`P2`、`P3` 已完成；若要延續本計畫，優先承接 `[~] 部分完成` 的 `P4`。
3. 在起草或實作前，先遵守本文件已鎖定的資料定義：`GMV` 不含運費、訂單母體為 delivered orders、主時間軸為 `order_purchase_timestamp`、日期區間固定。
4. 依照對應階段呼叫 `ddd-doc` 起草或更新相關 `FXX` 文件，再由人類審查核准後使用 `ddd-tdd` 實作。
5. 實作過程中保持 mock / real 並存，不要因為第一階段接線而提前移除 mock data 或擴張到其他故事面板。
6. 階段完成後，同步更新本文件的總覽表與各階段狀態；若實際產出文件編號有變動，也要更新關聯文檔。
7. 若發現需求已經超出 `KPI + Time Trend + Date Filter`、需要引入 payment/category/review/map 等新依賴，應視為下一階段議題，而不是直接吞進本階段。

> 若某階段的規則仍有歧義，先使用 `grill-me` 或 `ddd-start` 收斂，再起草對應 FXX。

## 6. 補充說明 (Additional Notes)

第一階段明確不做：

- 全 dashboard real data 化
- map、delivery、category、payment、review 的真資料接線
- customer state、product category、payment type 的真實過濾邏輯
- 自由起訖日日期選擇器
- 週 / 日 Time Trend
- KPI 成長率、前期比較值、環比或同比
- API、後端服務或資料庫落地
- 自動化測試與完整資料管線監控
- mock data 移除或大規模重構

未來階段建議方向：

- Future Phase A：擴充真實篩選維度，例如 customer state、product category、payment type。
- Future Phase B：擴充其他故事模組，例如地圖、物流、延遲分析、品類與支付分布、review layer。
- Future Phase C：資料模型升級，例如拆分單一 artifact、補上生成腳本與驗證流程、引入 staging / mart 分層。
- Future Phase D：使用者體驗強化，例如 comparison label、自由日期區間與更清楚的 filter 狀態管理。
