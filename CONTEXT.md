# CONTEXT

最後更新：2026-06-04

## 目的

這份文件是 `Brazil Retail Story Dashboard` 專案共用的詞彙表與邊界地圖。

在撰寫實作文檔、重構文檔、Bug 文檔或程式註解時：

- 優先使用這裡定義的術語，不要臨時換同義詞
- 只要可行，就讓 UI 名稱和程式碼名稱保持一致
- 如果發現術語衝突，要明確提出，不要默默改名

## 產品定位

- 產品名稱：`Brazil Retail Story Dashboard`
- 產品風格：`map-first editorial dashboard`
- 主要資料來源：`data/` 底下的 `Olist Brazilian E-Commerce` CSV 資料集
- 主要目標：在維持 dashboard 外型穩定的前提下，分階段把 mock-backed 區塊替換成 real-backed 區塊

## 核心敘事

這個 repo 不是通用型 BI warehouse 專案，而是一個 dashboard 遷移專案。

它的核心故事是：

1. 從一個視覺上已經完整的 dashboard 開始
2. 維持 UI 形狀穩定
3. 以可控的 phase 逐步把 mock data 換成 real data
4. 用 artifact 與 facade 隔開原始 CSV join 邏輯與 React 元件

## 通用語言

以下術語請一致使用。

### Dashboard 術語

- `dashboard`：完整的使用者端 retail story 體驗
- `panel`：dashboard 的一個區塊，例如 `Brazil Map` 或 `Payment Mix`
- `KPI card`：dashboard 頂部的摘要卡片
- `Time Trend`：orders / GMV 趨勢區塊
- `Filter Bar`：頂部的篩選列
- `hybrid dashboard`：部分區塊是 real-backed、部分區塊仍是 mock-backed 的 dashboard
- `hybrid boundary`：明確描述當前 phase 中哪些 filter 會影響哪些 panel 的邊界線

### 資料遷移術語

- `real-backed`：由 Olist 衍生的 artifact 資料驅動，不是手寫 mock 值
- `mock-backed`：仍由 `src/data/dashboardMock.ts` 或其他 mock facade 驅動
- `artifact`：提供給 app 使用的產出 JSON view model
- `artifact generator`：讀取原始 CSV 並產出 dashboard artifact 的 script
- `artifact facade`：把 artifact 資料轉成 UI 可直接使用函式的 TypeScript 存取層
- `phase`：一個計畫中的遷移切片，例如 payment-aware integration 或 geography/category/review integration

### 篩選術語

- `Date Range`：分階段 real-data integration 的主要有效 filter
- `Payment Type`：payment-aware cohort selector，不是一般自由維度 filter
- `Customer State`：state 層級的 geography filter 選項，存在於 artifact 詞彙中，但 UI 可能仍為 disabled
- `Product Category`：category filter 選項，存在於 artifact 詞彙中，但 UI 可能仍為 disabled

不要隨意把它們改叫成：

- 當你指的是 `Date Range` 時，不要寫成 `period`
- 當你指的是 dashboard 裡的 `Payment Type` 時，不要寫成 `payment method filter`
- 當你指的是 `Customer State` 時，不要寫成 `region filter`
- 當你指的是 `Product Category` 時，不要寫成 `category filter`

### 商業指標術語

- `Orders`：所選 cohort 內的 delivered-order 數量
- `GMV`：`order_items.price` 的總和，不包含 freight
- `Late Delivery Rate`：delayed delivered orders 的比率
- `On-time`：`order_delivered_customer_date <= order_estimated_delivery_date`
- `Delayed`：已送達但不屬於 on-time 的 orders
- `Payment Mix`：依 `payment_type` 聚合的 payment-row 與 payment-value 組成
- `Freight Distribution`：依 `order_id` 彙總 `freight_value` 後得到的 order-level freight 分布
- `Category Share`：依 category 計算的 item-share 分布
- `Delay vs Review`：delay days 與 review score 的關係

## 標準資料語意

除非某份文件明確另有說明，否則預設採用以下語意：

- 主要時間軸：`order_purchase_timestamp`
- 預設 artifact 粒度：`month`
- 預設 order population：`delivered_orders_only`
- 目前主要 coverage 區間：`2017-01-01` 到 `2018-08-31`
- 幣別：`BRL`
- GMV 不包含 freight
- category share 基準：`item_count`
- payment-aware slices 可能混用：
  - `Freight Distribution` 與 `On-time vs Delayed` 使用 order-level metrics
  - `Payment Mix` 使用 payment-level metrics

## 架構邊界

### Raw Data Layer

原始資料檔位於 `data/`，包含：

- `orders`
- `order_items`
- `payments`
- `customers`
- `products`
- `reviews`
- `geolocation`
- category translation

這些是來源資料集，不是 app-facing model。

### Artifact Layer

這是 dashboard-ready data contract。

核心檔案：

- `scripts/generate-phase2-dashboard-artifact.mjs`
- `scripts/verify-phase2-dashboard-artifact.mjs`
- `src/data/phase2DashboardArtifact.json`
- `src/data/phase2DashboardTypes.ts`

artifact 是 CSV 邏輯與 UI 邏輯之間的主要邊界。

### Facade Layer

這一層把 artifact 資料轉成 app-friendly selectors 與 formatters。

核心檔案：

- `src/data/phase2DashboardData.ts`
- `src/data/dashboardData.ts`

React 元件應優先使用 facade helpers，而不是在本地重新實作資料規則。

### UI Layer

React panels 與版面配置位於 `src/components/`。

標準 panel 名稱：

- `Brazil Map`
- `Time Trend`
- `On-time vs Delayed`
- `Freight Distribution`
- `Delay vs Review`
- `Category Share`
- `Payment Mix`

## 目前的 Hybrid Boundary

目前在 app 中可觀察到的邊界如下：

- `Date Range` 會影響 dashboard 中所有 real-backed 區塊
- `Payment Type` 目前只會更新：
  - `Freight Distribution`
  - `Payment Mix`
  - `On-time vs Delayed`
- `Brazil Map`、`Category Share`、`Delay vs Review` 目前只依 `Date Range` 從 artifact 取值
- `Customer State` 與 `Product Category` 選項存在於 artifact 詞彙中，但目前在 UI 上是 disabled
- 某些 KPI 與 time-trend 內容仍然採用 real / mock 混合組成

在描述未來工作時，請把這種狀態稱為 `hybrid boundary`，不要把它描述成已經完全統一的 filter model。

## 模組職責地圖

- `scripts/`：artifact 生成與驗證
- `src/data/phase2DashboardTypes.ts`：artifact schema 與共用 typed contract
- `src/data/phase2DashboardData.ts`：低層 artifact selectors 與計算邏輯
- `src/data/dashboardData.ts`：app-facing data facade 與 formatting helpers
- `src/components/DashboardPage.tsx`：頁面組裝與目前 hybrid boundary 的 wiring
- `src/components/*Panel.tsx`：各自負責一個 dashboard panel 的呈現
- `docs/P0x_*`：phase plans
- `documents/implements/F0x-*`：implementation contracts

## 文檔規則

在撰寫 `FXX`、`RXX`、`BXX` 文件時：

- 以 `panels` 指稱使用者可見的區塊
- 清楚區分 `artifact schema` 與 `UI rendering`
- 清楚區分 `order-level` 與 `payment-level` 計算
- 明確寫出 `real-backed` 或 `mock-backed`
- 如果某個 panel 仍依賴 mock data，不要宣稱它已 fully real-backed
- 如果某個 filter 存在但被 disabled，這兩件事都要寫出來

### Planning 文檔規則

在撰寫 `PXX` 規劃文檔時，預設必須包含分階段規劃，不要省略。

每份 `PXX` 文檔應包含：

- `Phase Plan` 總表
- 每個 phase 的獨立小節
- 每個 phase 的可勾選 `驗收期望`
- 每個 phase 對應的實作文檔欄位，例如 `FXX`、`RXX`、`BXX`
- 每個 phase 的明確狀態欄位

`Phase Plan` 總表應至少包含：

- phase 編號，例如 `P1`、`P2`、`P3`
- phase 名稱
- 預期文檔類型
- 相關文檔
- 狀態

phase 狀態統一使用：

- `[ ] 未開始`
- `[~] 進行中`
- `[x] 已完成`

狀態同步規則：

- 當某個 phase 開始實作或開始撰寫對應文檔時，將狀態更新為 `[~] 進行中`
- 當某個 phase 完成且驗收期望滿足時，將狀態更新為 `[x] 已完成`
- 更新 phase 狀態時，要同步更新：
  - `Phase Plan` 總表
  - 該 phase 的獨立小節
  - 任何文中引用該 phase 進度的摘要段落

驗收期望規則：

- 每個 phase 都要有可勾選 checklist
- checklist 要寫成人可以直接核對的結果，不要只寫模糊的工作動詞
- 驗收項目應偏向「完成後可被確認的結果」，例如資料已接線、UI 已切換、測試已通過、文檔已落地

若沒有特殊理由，`PXX` 文檔應以 [P00-planning-template.md](D:/Jordan_Backup/brazil-retail-story-dashboard/documents/planning/P00-planning-template.md) 為基準結構。

## 命名守則

在文檔與程式討論中，優先使用以下名稱：

- `phase2 dashboard artifact`
- `artifact-backed options`
- `payment-aware slices`
- `geography panel`
- `category panel`
- `review panel`
- `dashboard facade`
- `hybrid boundary`

避免使用過於含糊的替代詞，例如：

- `data blob`
- `chart payload`
- `state stuff`
- `real mode`
- `map stats thing`

## 尚未封口的邊界

以下概念區塊未來仍可能演進：

- `Customer State` 是否會變成可用的 active filter，或維持 artifact-only
- `Product Category` 是否會變成可用的 active filter，或維持 artifact-only
- KPI 與 Time Trend 要做到多大程度的 fully real-backed
- 未來 phase 是否會引入 daily 或 weekly 的 real-data trend grain
- geography 是否只使用 `customer_state`，還是會擴展成更完整的 geospatial semantics

如果未來文件要改動其中任何一項，請先更新這份檔案，或與該變更一起更新。
