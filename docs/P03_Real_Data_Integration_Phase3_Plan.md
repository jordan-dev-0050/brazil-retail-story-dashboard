---
author: Codex
date: 2026-06-04
title: 真實資料整合第三階段總規劃
uuid: 59ac75b812684b469bce7e830b816616
version: 0.1
status: synced
---

# 規劃書 - 真實資料整合第三階段

## 1. 背景與動機 (Background & Motivation)

第二階段已經把 dashboard 的 `Date Range`、`Payment Type`、`KPI + Time Trend` 與三個 payment-aware panels 接上真實資料，並保留明確的 hybrid 邊界。以目前程式現況來看，尚未 real-backed 的主要區塊只剩三塊：

1. `Brazil Map`
2. `Category Share / Top Categories`
3. `Delay vs Review Relationship`

這三塊剛好對應到 Olist 資料集中已可取得、但目前尚未接入 dashboard 主 artifact 的三條資料路徑：

- `orders + customers` 對應州別地理分布
- `order_items + products + category translation` 對應品類分析
- `orders + reviews` 對應延遲與評價關係

根據第二階段文件的收斂方向，第三階段不應再沿著 payment-aware 邏輯繼續外擴，也不應一次同時打開新的全域 filter 交互。較穩健的下一步，是延續既有單一 artifact 策略，把剩餘三個核心分析面板從 mock-backed 轉成 real-backed，同時維持現有 UI 形狀、互動節奏與 hybrid guardrails。

這樣做有三個直接價值：

1. 讓 dashboard 主畫面中最醒目的剩餘 mock 區塊逐步退出。
2. 先把 geography / category / review 的資料語意在 artifact 層收斂清楚，再決定未來是否開放 `Customer State` / `Product Category` filter。
3. 避免在同一階段同時處理「新資料來源」與「新全域篩選語意」兩個高風險決策。

## 2. 總體目標 (Overall Goal)

第三階段完成後，使用者應該能在不改變 dashboard 版型的前提下，看見下列差異：

- `Brazil Map` 不再是靜態 mock 色塊，而是基於真實訂單資料呈現州別 `Orders / GMV / Late Delivery Rate`。
- `Category Share / Top Categories` 不再顯示假資料，而是基於真實訂單商品與品類映射，呈現可對帳的 top categories。
- `Delay vs Review Relationship` 不再是 mock 散點，而是基於真實配送延遲與 review score 的 real-backed 關聯視圖。
- 第二階段已落地的 `Date Range`、`Payment Type`、`KPI + Time Trend` 與三個 payment-aware panels 維持穩定，不因第三階段而被改寫或回歸。

第三階段的目標不是把整張 dashboard 宣告為「100% fully real-backed」，而是把目前仍明顯是 mock 的三個分析區塊完成真實化，並把未來是否啟用 `Customer State` / `Product Category` filter 的決策，留到資料契約與驗證更穩定之後再開。

## 3. 影響範圍 (Scope & Impact)

| 受影響模組 / 功能 | 預計改動類型 | 備註 |
|----------------|-------------|------|
| `data/olist_orders_dataset.csv` | 既有資料延伸使用 | 州別聚合、配送延遲基礎、review join 主鍵 |
| `data/olist_customers_dataset.csv` | 既有資料延伸使用 | 以 `customer_state` 提供州別維度；第三階段不需要新增 geolocation 底圖 |
| `data/olist_order_items_dataset.csv` | 既有資料延伸使用 | category share 與 GMV 聚合 |
| `data/olist_products_dataset.csv` | 既有資料延伸使用 | 商品品類來源 |
| `data/product_category_name_translation.csv` | 既有資料延伸使用 | 品類名稱正規化與顯示用英文標籤 |
| `data/olist_order_reviews_dataset.csv` | 既有資料延伸使用 | review score 與評論層資料來源 |
| `scripts/generate-phase2-dashboard-artifact.mjs` | 功能擴充 | 延續單一 artifact 策略，加入 geography / category / review sections |
| `scripts/verify-phase2-dashboard-artifact.mjs` 或後續 phase3 驗證腳本 | 功能擴充 | 增加州別、品類、延遲-評價對帳檢查 |
| `src/data/phase2DashboardTypes.ts` / `src/data/phase2DashboardData.ts` | 功能擴充 | 加入新 panel 所需型別與讀取 helper |
| `src/data/dashboardData.ts` | 功能擴充 | 維持 app-facing facade，避免 UI 直接綁定底層 artifact 細節 |
| `src/components/BrazilMapPanel.tsx` | 資料來源切換 | 保留現有地圖 SVG 與 toggle UI，改吃 real-backed metrics |
| `src/components/CategorySharePanel.tsx` | 資料來源切換 | 保留現有版型，改吃真實 category share 排名 |
| `src/components/DelayReviewPanel.tsx` | 資料來源切換 | 改吃 real-backed scatter / trend / correlation |
| `src/components/DashboardPage.tsx` | 文案與邊界同步 | 更新 hybrid boundary 提示，反映第三階段後的真實資料範圍 |
| `src/components/FilterBar.tsx` | 明確維持現況 | `Customer State` / `Product Category` 在第三階段仍維持 disabled，避免提早承諾全域 filter semantics |

## 4. 各階段計畫 (Phase Plan)

### 總覽

| 階段 | 名稱 | 建議文檔類型 | 關聯文檔 | 狀態 |
|------|------|------------|--------|------|
| P1 | Geography / Category / Review 共享資料契約 | FXX | [F05-phase3-geography-category-review-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F05-phase3-geography-category-review-contract.md) | [x] 已完成 |
| P2 | 單一 dashboard artifact 擴充至 v0.3 | FXX | [generate-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/generate-phase2-dashboard-artifact.mjs) | [x] 已完成 |
| P3 | 三個剩餘分析面板切換到 real-backed | FXX | [DashboardPage.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/DashboardPage.tsx) | [x] 已完成 |
| P4 | 對帳、baseline 與第三階段封板 | FXX | [verify-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/verify-phase2-dashboard-artifact.mjs) | [~] 部分完成 |

---

### 階段 1 - Geography / Category / Review 共享資料契約

**描述**

先把第三階段真正困難的語意問題寫清楚，再開始生成 artifact。這一階段的核心不是「接線」，而是避免三個新面板各自偷用不同口徑。

本階段至少要明確回答：

- `Brazil Map` 的州別來源是 `customers.customer_state`，不是重新建一套 geolocation 幾何。
- `Orders`、`GMV`、`Late Delivery Rate` 在州別地圖上的分母與聚合粒度是什麼。
- `Category Share` 的 share 是依 `order_count`、`item_count` 還是 `GMV` 來定義，且 top category footer 必須與主表一致。
- `Product Category` 名稱要如何透過 translation 表正規化，如何處理缺失或未翻譯值。
- `Delay vs Review` 要以「每筆訂單一個點」、「抽樣點」或「bucketed points」呈現，避免真實資料量直接把圖打爆。
- 第三階段是否允許 `Payment Type` 影響這三個新面板；若不允許，必須在文件中清楚寫成刻意邊界。
- `Customer State` / `Product Category` filter 在本階段先維持 disabled，不偷渡成隱性需求。

**使用者確認方式**

- [x] 文件中能直接找到州別、品類、review 三條資料路徑的 join 與聚合口徑。
- [x] 文件中能直接回答「Category Share 的 share 分母是什麼」與「Delay vs Review 如何降採樣或分箱」。
- [x] 文件中已明確寫出第三階段不啟用 `Customer State` / `Product Category` filter。

**建議文檔類型**：`FXX`

**關聯文檔**：[F05-phase3-geography-category-review-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F05-phase3-geography-category-review-contract.md)

**狀態**：`[x] 已完成`

---

### 階段 2 - 單一 dashboard artifact 擴充至 v0.3

**描述**

延續前兩階段的單一 artifact 策略，在同一份 dashboard artifact 中加入 geography / category / review 區塊，而不是另外拆新檔或為單一面板各自生 JSON。

建議新增的 artifact 責任包含：

- 州別地圖所需的 `orders / GMV / lateDeliveryRate` 指標
- category share 排名、share、GMV 與 top-category summary
- delay-review scatter / trend / correlation 所需資料
- 對應的 metadata、coverage 與必要的口徑說明

這一階段也要同步補上驗證機制，至少能檢查：

- 州別 totals 與已存在的 date-range cohort 是否對得起來
- category aggregates 是否能回推到原始 item / GMV 總和
- delay / review 使用的母體是否符合已定義的 delivered-order + review-available 規則

**使用者確認方式**

- [x] artifact 生成後，檔案中可見 geography / category / review 新 sections。
- [x] 驗證腳本可通過，且至少能對出一組州別、一組 top category 與一組 delay-review sample。
- [x] 沒有新增第二份 dashboard artifact，也沒有讓 UI 直接讀原始 CSV。

**建議文檔類型**：`FXX`

**關聯文檔**：[generate-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/generate-phase2-dashboard-artifact.mjs)

**狀態**：`[x] 已完成`

---

### 階段 3 - 三個剩餘分析面板切換到 real-backed

**描述**

把 `Brazil Map`、`Category Share / Top Categories`、`Delay vs Review Relationship` 三個元件改接第三階段 artifact，同時保留現有版型、互動按鈕與視覺節奏。

本階段的重點是資料來源切換，而不是重做視覺設計。預期包含：

- `Brazil Map` 保留現有 polygon 底圖與 `Orders / GMV / Late Delivery Rate` toggle，但圖例、顏色分層與顯示值改由 real-backed metrics 驅動。
- `Category SharePanel` 改用真實 category ranking、share 與 GMV，footer 也改為 real-backed top category。
- `DelayReviewPanel` 改用真實散點、趨勢線與 correlation 值。
- `DashboardPage` 的 hybrid boundary 文案需改寫，因為第三階段完成後，原先三塊 mock-backed 面板不應再被描述為 mock-backed。

此階段仍刻意不處理：

- `Customer State` / `Product Category` filter 啟用
- daily / weekly 真實時間序列
- 額外 KPI 卡片真實化
- 新的 API、後端服務或資料庫層

**使用者確認方式**

- [x] 切換 `Date Range` 時，三個新面板的數值與內容會改變，且不再顯示 mock 資料。
- [x] 切換 `Brazil Map` 的 metric tabs 時，州別著色與圖例對應真實州別指標。
- [x] `Category Share` 與 `Delay vs Review` 畫面可正常渲染，且版型沒有因改接真實資料而崩壞。

**建議文檔類型**：`FXX`

**關聯文檔**：[DashboardPage.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/DashboardPage.tsx)

**狀態**：`[x] 已完成`

---

### 階段 4 - 對帳、baseline 與第三階段封板

**描述**

第三階段不只要「畫面跑起來」，還要把驗證紀錄補到足夠讓下一位接手者不需要重新猜測。

本階段建議至少包含：

- 依 guardrails 補上 phase3 前後 screenshot baseline
- 手動對帳 1 個州別、1 個 top category、1 組 delay-review 樣本
- 確認第三階段完成後的 hybrid 邊界描述
- 明確列出哪些內容仍未真實化，避免 repo 看起來像已全部完成

若在此階段才發現 `Customer State` / `Product Category` filter 有強烈啟用需求，應另外開新 phase 或新 PXX，不把需求臨時塞回第三階段。

**使用者確認方式**

- [ ] repo 中有第三階段前後的 baseline 或等價驗證紀錄。
- [x] 自動驗證與 build 可通過。
- [x] 文件中能清楚看出第三階段完成了什麼，以及哪些需求被刻意延後。

**建議文檔類型**：`FXX`

**關聯文檔**：[verify-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/verify-phase2-dashboard-artifact.mjs)

**狀態**：`[~] 部分完成`

---

## 5. 接棒說明 (AI 指引)

> 本節為接棒 AI 的執行指引。

接棒 AI 在開始第三階段工作前，請依序執行：

1. 先閱讀 [docs/P02_Real_Data_Integration_Phase2_Plan.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P02_Real_Data_Integration_Phase2_Plan.md)，確認第二階段的 hybrid 邊界與已落地語意。
2. 再閱讀 [docs/Real_Data_Integration_UI_Guardrails.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/Real_Data_Integration_UI_Guardrails.md)，避免在 phase3 直接改動 dashboard 形狀。
3. 目前 `P1`、`P2`、`P3` 已完成；若要延續本文件，優先承接 `[~] 部分完成` 的 `P4`，補齊 baseline 與人工對帳紀錄。
4. 針對該階段呼叫 `ddd-doc` 起草對應的 `FXX` 文件，先把語意與驗收條件鎖定，再進入實作。
5. 人類審查通過後，再使用 `ddd-tdd` 進行實作與驗證。
6. 每完成一個階段：
   - 補上實際 `FXX` 文件名稱
   - 將該階段改為 `[x] 已完成`
   - 同步更新總覽表
7. 若執行中發現 `Customer State` / `Product Category` filter 必須一併啟用，先停下來重新確認範圍，不可直接把它當成 phase3 的隱含子任務。

## 6. 補充說明 (Additional Notes)

### 明確列入第三階段範圍內

- `Brazil Map` 真實資料化
- `Category Share / Top Categories` 真實資料化
- `Delay vs Review Relationship` 真實資料化
- geography / category / review artifact 與驗證腳本
- 第三階段前後的 screenshot baseline / 對帳紀錄

### 明確不列入第三階段範圍

- 啟用 `Customer State` filter
- 啟用 `Product Category` filter
- 把 `Payment Type` 的作用域擴到全頁所有面板
- daily / weekly 真實時間序列
- `Avg Delivery Days`、`Late Delivery Rate` KPI 卡片、`Avg Review Score` KPI 卡片真實化
- 重新繪製巴西地圖、導入 geolocation 級座標或改做全新地圖視覺
- 新 API、資料庫、後端服務或 ETL 基礎建設

### 第三階段完成後的建議下一步

若第三階段順利完成，下一份總規劃建議再處理以下其中一條，不要同時開兩條：

1. `Customer State` / `Product Category` filter 真正啟用，並定義它們與 KPI / Time Trend / payment-aware panels 的作用域。
2. KPI 與時間序列補齊剩餘 mock-backed 指標，例如 `Avg Delivery Days`、`Avg Review Score` 與非 monthly granularity。
