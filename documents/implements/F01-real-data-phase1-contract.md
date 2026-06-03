---
author: Codex
date: 2026-06-03
title: 鎖定第一階段真資料接入規格
uuid: 1ec76e92f1bc4c50a59d6c91f89bbcdf
version: 0.1
---

# 功能需求書 - 第一階段真資料接入規格收斂

## 1. 功能概述 (Feature Overview)
本文件承接 [P01 真實資料整合第一階段規劃](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P01_Real_Data_Integration_Plan.md)，目的是把 `P1` 階段需要鎖定的規則寫成單一可執行規格，避免後續 `P2` 與 `P3` 一邊處理資料、一邊重談定義。

本次只收斂第一版真資料接入契約，聚焦在 `KPI + Time Trend + Date Filter`。不直接實作資料產物、不修改前端元件、不延伸到地圖、物流、品類、付款或評論模組。

## 2. 需求描述 (Requirement/User Story)
- **As a** dashboard 開發者與規格確認者
- **I want** 在開始接 Olist 真資料前，先把第一版分析母體、KPI 定義、日期區間、artifact 輸出責任與 mock / real 邊界寫死
- **So that** 後續實作可以直接對照固定規則產出資料並接線，不會在中途反覆改口徑

## 3. 驗收準則 (Acceptance Criteria)

- **Scenario 1: 第一版分析母體已鎖定**
  - **Given** 專案使用 `data/olist_orders_dataset.csv` 作為訂單主表
  - **When** 團隊準備第一版真資料接入規格
  - **Then** 第一版分析母體必須明確定義為 `order_status = delivered`、`order_purchase_timestamp` 非空，且只納入 `2017-01-01` 到 `2018-08-31` 的下單資料

- **Scenario 2: 第一版訂單數定義已鎖定**
  - **Given** 已套用第一版分析母體過濾條件
  - **When** 計算 `Total Orders`
  - **Then** 必須以 `orders.order_id` 去重後的筆數作為結果，不得以 `order_items` 列數或付款筆數替代

- **Scenario 3: 第一版 GMV 定義已鎖定**
  - **Given** 已套用第一版分析母體過濾條件，並使用 `order_items` 與 `orders` 透過 `order_id` 連接
  - **When** 計算 `Total GMV`
  - **Then** 必須使用 `SUM(order_items.price)`，明確不含 `freight_value`、不以 `payment_value` 取代，且時間歸屬以 `order_purchase_timestamp` 為準

- **Scenario 4: 日期篩選固定選項已鎖定**
  - **Given** 第一版只允許固定日期區間
  - **When** 前端需要顯示 `Date Range` 選項
  - **Then** 必須提供且只提供 `All Period (2017-01 to 2018-08)`、`2017 Full Year`、`2018 YTD (Jan-Aug)` 三個選項，並對應固定起訖日

- **Scenario 5: 第一版 artifact 契約已鎖定**
  - **Given** 第一版真資料需先轉成 dashboard-ready artifact
  - **When** 團隊定義前後責任邊界
  - **Then** artifact 必須至少包含 `metadata`、`dateRanges`、`kpisByRange`、`monthlySeriesByRange` 四個區塊，且 `monthlySeriesByRange` 只提供月粒度的 `orders` 與 `gmv`

- **Scenario 6: 第一版 UI 接線邊界已鎖定**
  - **Given** 第一版只做最小可驗證切面
  - **When** dashboard 切到 real data 模式
  - **Then** 真資料只承諾支援 `Total Orders`、`Total GMV`、月別 `Orders/GMV` 趨勢與 `Date Range` 篩選；`daily/weekly`、成長率、前期比較、`Late Delivery Rate` 與其他篩選器真邏輯皆不屬於第一版交付

- **Scenario 7: mock / real 共存規則已鎖定**
  - **Given** 專案仍保留 `src/data/dashboardMock.ts`
  - **When** 第一版真資料接入開始實作
  - **Then** 必須保留 app 層級的簡單資料源切換能力，且任何尚未接上真資料的模組不得被誤描述為 real-backed 輸出

## 4. 測試情境 (Test Scenarios / Examples)

| ID  | Scenario | Given | When | Then | Priority |
|-----|----------|-------|------|------|----------|
| TC1 | 鎖定分析母體 | 已讀取 Olist 訂單主表 | 確認第一版資料母體 | 只接受 `delivered` 且下單日介於 `2017-01-01` 至 `2018-08-31` 的訂單 | High |
| TC2 | 鎖定訂單數算法 | 已完成母體過濾 | 計算 `Total Orders` | 使用去重後 `order_id` 筆數 | High |
| TC3 | 鎖定 GMV 算法 | 已完成 `orders` 與 `order_items` 連接 | 計算 `Total GMV` | 使用 `SUM(order_items.price)`，不含 `freight_value` | High |
| TC4 | 鎖定日期選項 | 前端需要第一版日期篩選 | 讀取 `dateRanges` | 只能得到三個固定區間 `all`、`2017`、`2018_ytd` | High |
| TC5 | 鎖定 artifact schema | 資料產物準備提供給前端 | 驗證欄位結構 | 具備 metadata、dateRanges、kpisByRange、monthlySeriesByRange | High |
| TC6 | 鎖定第一版 UI 邊界 | dashboard 切到 real 模式 | 檢查可互動與可視元素 | 只有 `Date Range` 真的影響真資料，Time Trend 只看月別 orders/gmv | Medium |
| TC7 | 鎖定 mock / real 共存規則 | mock 資料仍存在 | 啟用 real 模式 | 未完成的資料區塊不宣稱為真資料結果 | Medium |

## 5. 實作註記 (Implementation Notes)

- **資料分布依據**
  - 2026-06-03 以本地 `data/olist_orders_dataset.csv` 檢查得知：`order_purchase_timestamp` 最早為 `2016-09-04`，最晚為 `2018-10-17`。
  - `delivered` 訂單的穩定月份分布集中於 `2017-01` 至 `2018-08`；`2016-09/10/12` 為極少量早期資料，`2018-09/10` 則只剩尾端零星紀錄。
  - 因此第一版分析視窗明確鎖定為 `2017-01-01` 至 `2018-08-31`，避免把稀疏或未完整月份帶進第一輪人工對帳。

- **第一版固定日期區間**

| ID | Label | Start | End | 說明 |
|----|-------|-------|-----|------|
| `all` | `All Period (2017-01 to 2018-08)` | `2017-01-01` | `2018-08-31` | 第一版主對帳區間 |
| `2017` | `2017 Full Year` | `2017-01-01` | `2017-12-31` | 驗證年別切面 |
| `2018_ytd` | `2018 YTD (Jan-Aug)` | `2018-01-01` | `2018-08-31` | 驗證近期切面 |

- **第一版 artifact 型別契約**

```ts
type Phase1DashboardArtifact = {
  metadata: {
    source: 'olist';
    version: string;
    generatedAt: string;
    currency: 'BRL';
    timeAxis: 'order_purchase_timestamp';
    grain: 'month';
    orderPopulation: 'delivered_orders_only';
  };
  dateRanges: Array<{
    id: 'all' | '2017' | '2018_ytd';
    label: string;
    start: string;
    end: string;
  }>;
  kpisByRange: Record<
    'all' | '2017' | '2018_ytd',
    {
      totalOrders: number;
      totalGmv: number;
    }
  >;
  monthlySeriesByRange: Record<
    'all' | '2017' | '2018_ytd',
    Array<{
      month: string;
      label: string;
      orders: number;
      gmv: number;
    }>
  >;
};
```

- **第一版輸出責任**
  - 原始 CSV 清理與聚合邏輯屬於 `P2`。
  - 第一版前端只讀「已聚合好的 artifact」，不直接讀 CSV。
  - 第一版 artifact 建議放在 `src/data/` 下，以可直接匯入的 `ts` 模組型式提供；是否由腳本自動生成，留待 `P2` 決定。

- **第一版畫面邊界**
  - 真資料 KPI 只承諾 `Total Orders` 與 `Total GMV`。
  - 真資料 Time Trend 只承諾月別 `orders` 與 `gmv` 序列。
  - `Date Range` 是第一版唯一會真的改變真資料結果的篩選器。
  - `customerState`、`productCategory`、`paymentType` 在第一版保留 UI 但不接真邏輯。
  - `Late Delivery Rate`、成長率、comparison 文案、daily/weekly granularity 不納入第一版 artifact。

- **可能受影響的模組與檔案**
  - [docs/P01_Real_Data_Integration_Plan.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P01_Real_Data_Integration_Plan.md)
  - [src/data/dashboardMock.ts](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/dashboardMock.ts)
  - [src/components/DashboardPage.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/DashboardPage.tsx)
  - [src/components/FilterBar.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/FilterBar.tsx)
  - [src/components/TimeTrendPanel.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/TimeTrendPanel.tsx)

## 6. 補充說明 (Additional Notes)

- 本文件只負責鎖定第一版契約，不代表 `P2` 已完成資料產物生成。
- 目前 repo 尚未建立 `CONTEXT.md`，本文術語以現有 `P01`、`Brazil_Retail_Story_Dashboard_Plan` 與原始碼命名為準。
- 建議後續補一份 `documents/modules/dashboard-data-flow.md`，專門記錄 mock、artifact、前端面板之間的資料責任邊界。


## 附錄：TDD 需求實作流程提醒 (TDD Implementation Checklist)

請依照以下流程進行開發

1. 撰寫並調整需求說明

    使用 User Story 與 Acceptance Criteria 格式清楚描述需求情境與預期結果。

    所有條件應能對應到「可驗證」、「可自動化」的測試案例。

2. 建立測試

    根據驗收準則撰寫對應的失敗測試（紅燈）。

    每個 Scenario 至少對應一筆測試案例（可含邊界條件與例外處理）。

3. 撰寫最簡實作

    僅為通過測試撰寫必要最少的邏輯，避免過度開發。

4. 測試通過（綠燈）

    所有測試案例通過，自動化測試無錯誤。

5. 重構（Refactor）

    在測試綠燈狀態下，優化程式結構與可讀性，保留功能行為一致。

6. 文件與版本同步

    驗證文件內容與實作結果一致，更新需求版本與測試記錄。
    更新該文件內容，增加實作註記
