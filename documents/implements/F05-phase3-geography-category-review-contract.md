---
author: Codex
date: 2026-06-04
title: P03 階段 1 - Geography / Category / Review 共享資料契約
uuid: 35589fc6d20447f5a74d890bc2177d2c
version: 0.1
---

# 實作文檔 - P03 階段 1 Geography / Category / Review 共享資料契約

## 1. 功能概述 (Feature Overview)

本階段對應 [docs/P03_Real_Data_Integration_Phase3_Plan.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P03_Real_Data_Integration_Phase3_Plan.md) 的「階段 1 - Geography / Category / Review 共享資料契約」。

目標不是立刻把 `Brazil Map`、`Category Share / Top Categories`、`Delay vs Review Relationship` 三個 panel 切成 real-backed，而是先把它們共用的資料語意收斂到同一份 dashboard artifact 中，讓後續階段可以在不重談 join 與聚合口徑的前提下直接接 UI。

這一階段會補上三條共享資料路徑：

- `orders + customers` 對應州別 geography 聚合
- `orders + order_items + products + category translation` 對應 category share / top categories
- `orders + reviews` 對應 delay vs review relationship

同時把 `Customer State` 與 `Product Category` 的 artifact-backed options 準備好，但在本階段仍維持 disabled，不把它們偷渡成全域 filter 啟用需求。

## 2. User Story

- **As a** 正在做第三階段 real-data migration 的 dashboard 維護者
- **I want** geography / category / review 三個分析區塊先共享一致的 artifact 契約、join 口徑與驗證規則
- **So that** 後續第 2、3 階段切換 artifact 與 UI 時，不會因資料定義不一致導致 panel 對不起來，或提早承諾 `Customer State` / `Product Category` filter semantics

## 3. 驗收條件 (Acceptance Criteria)

- **Scenario 1: geography 州別聚合口徑固定**
  - **Given** `orders` 與 `customers` 透過 `customer_id` 可關聯
  - **When** 生成 geography section
  - **Then** 州別來源必須是 `customers.customer_state`，且每州至少能對出 `orderCount`、`totalGmv`、`lateDeliveryRate`

- **Scenario 2: category share 分母固定為 item_count**
  - **Given** `order_items` 可透過 `product_id` 接 `products`，再透過 `product_category_name` 接 translation 表
  - **When** 生成 category section
  - **Then** `share` 必須明確定義為 `category_item_count / ranged_total_items`
  - **And** 同一份 category row 仍需提供 `orderCount` 與 `totalGmv`，供後續 panel 顯示
  - **And** top category footer 必須與主表使用同一套排序與 share 口徑

- **Scenario 3: 缺失或未翻譯品類可穩定收斂**
  - **Given** 產品可能沒有 `product_category_name` 或 translation
  - **When** 生成 category section
  - **Then** 缺失值要收斂到 `Unknown Category`
  - **And** 未翻譯值優先保留原始葡文，再轉成可讀 label，不可直接丟棄訂單

- **Scenario 4: delay vs review 採 bucketed points 避免圖爆量**
  - **Given** review 是訂單附屬表，且第三階段 panel 不適合直接渲染每筆訂單一點
  - **When** 生成 review section
  - **Then** 只納入同時有 `order_delivered_customer_date`、`order_estimated_delivery_date`、`review_score` 的 delivered orders
  - **And** 輸出必須採「以整數 delay days 為桶」的 bucketed points
  - **And** 每個 bucket 至少提供 `delayDays`、`reviewScoreAvg`、`orderCount`
  - **And** section 需包含 correlation 值與 review population coverage

- **Scenario 5: 第三階段仍不啟用 state/category filters**
  - **Given** artifact 已能產出 `Customer State` 與 `Product Category` options
  - **When** dashboard facade 暴露 filter configs
  - **Then** 兩個 filters 仍維持 disabled
  - **And** 不修改 `KPI + Time Trend + payment-aware panels` 的現有作用域

## 4. 測試情境 / 例子 (Test Scenarios / Examples)

| ID  | Scenario | Given | When | Then | Priority |
|-----|----------|-------|------|------|----------|
| TC1 | geography join | qualifying delivered orders | 以 `customer_id` 接 customers | artifact 內可見各州 `orderCount / totalGmv / lateDeliveryRate` | High |
| TC2 | category translation fallback | 缺失或未翻譯品類 | 生成 category rows | 不遺失訂單，label 落到 `Unknown Category` 或可讀 fallback | High |
| TC3 | category share denominator | ranged total items | 計算 category share | `shareOfItems` 與 `totals.totalItems` 可對帳 | High |
| TC4 | review population | delivered orders + reviews | 生成 review section | population 僅含 review-available orders，coverage 清楚 | High |
| TC5 | delay-review buckets | review population 很大 | 生成 scatter data | 產出 bucketed points，不直接輸出全部訂單點 | High |
| TC6 | disabled filters | dashboard filter facade | 讀取 customer/product filters | options 來自 artifact，但 `disabled = true` | Medium |

## 5. 實作說明 (Implementation Notes)

- **資料來源**
  - `data/olist_orders_dataset.csv`
  - `data/olist_customers_dataset.csv`
  - `data/olist_order_items_dataset.csv`
  - `data/olist_products_dataset.csv`
  - `data/product_category_name_translation.csv`
  - `data/olist_order_reviews_dataset.csv`

- **artifact 擴充方向**
  - 維持單一 `src/data/phase2DashboardArtifact.json`
  - 新增 `geographyPanelsByRange`
  - 新增 `categoryPanelsByRange`
  - 新增 `reviewPanelsByRange`
  - 新增 artifact-backed `customerStateOptionsByRange` / `productCategoryOptionsByRange`

- **口徑固定**
  - order population 仍以 `delivered_orders_only` 且 `order_purchase_timestamp` 落在既有 coverage
  - geography 以 `customers.customer_state` 聚合
  - category share 以 `item_count` 為 share 分母
  - review population 以 `delivered + review_available + delay_computable` 為母體
  - delay-review 以整數 `delayDays` 分桶，不直接輸出 raw order points

- **本階段明確不做**
  - 不切換 `Brazil Map`、`Category SharePanel`、`DelayReviewPanel` 到 real-backed
  - 不啟用 `Customer State` / `Product Category` filters
  - 不改動 KPI、Time Trend、payment-aware panels 的現有範圍語意

## 6. TDD 實作檢查清單 (TDD Implementation Checklist)

1. 先擴充 types，讓 artifact schema 可描述 geography/category/review sections 與 filter options
2. 擴充生成腳本，加入 customers / products / translations / reviews joins
3. 擴充驗證腳本，至少對出 1 組州別、1 組 top category、1 組 delay-review sample
4. 更新 dashboard facade，讓 disabled filters 的 options 來自 artifact
5. 重新生成 artifact，執行 `npm run test:phase2-artifact` 與 `npm run build`

## 7. 補充說明

- 本文檔只處理共享資料契約，不處理 panel rendering。
- 若執行中發現 `Customer State` 或 `Product Category` 必須提前啟用，應停下來重新確認範圍，不能直接視為本階段隱含需求。
