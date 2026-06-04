---
author: Codex
date: 2026-06-04
title: P02 第 1 階段 - Payment-aware 切片契約
uuid: 5f0b549d51b84d8897c1af40e76c5a2a
version: 0.1
---

# 功能實作文檔 - P02 第 1 階段 Payment-aware 切片契約

## 1. 功能概覽 (Feature Overview)
本文件承接 [docs/P02_Real_Data_Integration_Phase2_Plan.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P02_Real_Data_Integration_Phase2_Plan.md) 的 `P1`，目的是先鎖定第二階段共用的資料切片語意，再進入 artifact 與 UI 實作。

第一階段已經完成 `KPI + Time Trend + Date Range` 的 real-backed 主路徑，並且維持 hybrid dashboard 邊界清楚。本階段不新增第二份 artifact、不改寫 UI 版型，而是定義 `Date Range -> Payment Type` 的切片順序，以及 `Freight Distribution`、`Payment Mix`、`On-time vs Delayed` 三個面板各自使用的 order-level / payment-level 聚合口徑。

這份契約的責任是讓後續 `P2` 的 artifact 擴充與 `P3` 的 dashboard 接線，都建立在同一套母體與命中規則上，避免同一個 `Payment Type` 在不同面板代表不同意思。

## 2. 需求 / User Story
- **As a** 正在推進第二階段真實資料整合的 dashboard 團隊
- **I want** 先把 `Date Range`、`Payment Type`、訂單型聚合與付款型聚合之間的依賴關係說清楚
- **So that** 後續生成的 artifact、驗證腳本與 UI 面板可以共享一致數字口徑，不會在切換 filter 後出現彼此對不起來的結果

## 3. 驗收條件 (Acceptance Criteria)

- **Scenario 1: `Date Range` 是第一層切片**
  - **Given** 第二階段仍沿用第一階段的 delivered-order 母體與日期覆蓋範圍
  - **When** 任一 payment-aware 面板需要取數
  - **Then** 必須先以 `order_status = delivered` 與 `order_purchase_timestamp` 落在指定 `Date Range` 內的訂單建立 cohort，再進行下一層 `Payment Type` 切片

- **Scenario 2: `Payment Type` 的命中規則是訂單 membership**
  - **Given** 一筆訂單可能在 `olist_order_payments_dataset.csv` 中出現多筆付款紀錄
  - **When** 使用者選擇某個 `payment_type`
  - **Then** 只要該訂單曾出現所選 `payment_type` 即視為命中；不定義主付款方式，也不把多付款訂單壓平成單一付款類型

- **Scenario 3: 訂單型面板使用同一批命中訂單**
  - **Given** `Freight Distribution` 與 `On-time vs Delayed` 都是訂單型面板
  - **When** 對已套用 `Date Range + Payment Type` 的 cohort 做聚合
  - **Then** 兩者都應以去重後的 `order_id` 為母體，不得因為付款資料有多筆而重複計算同一張訂單

- **Scenario 4: `Freight Distribution` 的 freight 口徑固定**
  - **Given** 一張訂單可能包含多個 `order_items`
  - **When** 計算該訂單對應的 freight
  - **Then** 使用 `SUM(order_items.freight_value)` by `order_id` 作為該訂單的 freight 值，再投入分箱統計

- **Scenario 5: `On-time vs Delayed` 的配送分類固定**
  - **Given** 訂單已落在第二階段的 delivered-order cohort 中
  - **When** 判斷配送是否準時
  - **Then** `order_delivered_customer_date <= order_estimated_delivery_date` 視為 `On-time`，大於則視為 `Delayed`

- **Scenario 6: `Payment Mix` 保留 payment-level 明細**
  - **Given** `Payment Mix` 是付款型面板
  - **When** 對已命中的訂單集合做支付統計
  - **Then** 使用這批訂單對應的所有 payment rows，加總 `payment_value` 並依 `payment_type` 聚合；同一訂單的多筆付款必須保留，不得先彙總成單筆訂單付款

- **Scenario 7: 選到特定 `Payment Type` 時，`Payment Mix` 不必變成 100% 單一類型**
  - **Given** 某些命中訂單同時含有其他付款方式
  - **When** 使用者選擇 `credit_card`、`boleto` 或其他特定 `payment_type`
  - **Then** `Payment Mix` 仍可出現其他付款類型，因為 filter 代表「命中這類付款的訂單 cohort」，不是「只保留這類付款 row」

- **Scenario 8: `payment_type = all` 時必須能解釋 order-level 與 payment-level 的母體差異**
  - **Given** `Payment Type` 選擇 `all`
  - **When** 檢查訂單型面板與付款型面板
  - **Then** 團隊必須能清楚說明前者以去重後訂單數為母體、後者以 payment rows / `payment_value` 為母體，兩者可對帳但不要求數值型態一致

## 4. 測試情境 / 範例 (Test Scenarios / Examples)

| ID  | Scenario | Given | When | Then | Priority |
|-----|----------|-------|------|------|----------|
| TC1 | 鎖定第一層日期切片 | delivered orders 與第一階段日期範圍 | 先取 `Date Range = 2017` | 只留下 `2017-01-01` 到 `2017-12-31` 的 delivered orders | High |
| TC2 | 驗證 payment membership 命中 | 某訂單有 `voucher` 與 `credit_card` 兩筆付款 | 選擇 `payment_type = credit_card` | 該訂單命中 filter，不被排除 | High |
| TC3 | 防止訂單型面板重複計算 | 命中 cohort 的訂單含多筆 payment rows | 計算 freight / on-time vs delayed | 同一 `order_id` 只計一次 | High |
| TC4 | 鎖定 freight 聚合方式 | 同一訂單含多筆 `order_items` | 計算 freight 值 | 使用 `SUM(order_items.freight_value)` by `order_id` | High |
| TC5 | 鎖定配送分類 | 命中 cohort 的 delivered orders | 比較 delivered 與 estimated 日期 | 依 `<=` 判定 `On-time`，其餘為 `Delayed` | High |
| TC6 | 保留 payment-level 明細 | 命中 cohort 內存在多筆付款 | 生成 `Payment Mix` | 以 `payment_value` 聚合且保留多付款特性 | High |
| TC7 | 驗證特定付款類型下的 mix 行為 | 命中 `credit_card` 的訂單仍含其他付款列 | 查看 `Payment Mix` | 圖上可出現非 `credit_card` 類型 | Medium |
| TC8 | 驗證 `all` 時的母體差異 | `payment_type = all` | 對比三個面板 | 可說明 order-level 與 payment-level 的分母不同 | Medium |

## 5. 實作說明 (Implementation Notes)

- **資料來源範圍**
  - `data/olist_orders_dataset.csv`
    - `order_id`
    - `order_status`
    - `order_purchase_timestamp`
    - `order_delivered_customer_date`
    - `order_estimated_delivery_date`
  - `data/olist_order_items_dataset.csv`
    - `order_id`
    - `freight_value`
  - `data/olist_order_payments_dataset.csv`
    - `order_id`
    - `payment_type`
    - `payment_value`

- **共享切片順序**
  1. 先建立 delivered-order + `Date Range` cohort
  2. 再用 `payment_type` membership 篩出命中訂單
  3. 訂單型面板基於去重後 `order_id` 聚合
  4. 付款型面板基於命中訂單對應的 payment rows 聚合

- **本階段產物責任**
  - 本文件只鎖定共享資料契約
  - 不直接新增 artifact schema
  - 不直接修改 dashboard UI
  - `P2` 再把此契約落進單一 dashboard artifact
  - `P3` 再把 artifact-backed 面板與 `Payment Type` filter 接到 UI

- **與既有 guardrails 的關係**
  - 延續 [docs/Real_Data_Integration_UI_Guardrails.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/Real_Data_Integration_UI_Guardrails.md) 的 hybrid UI 原則
  - 即使 `Payment Type` 變成可互動 filter，也不得暗示整頁所有面板都已 real-backed
  - 第二階段只處理 `Payment Type`、`Freight Distribution`、`Payment Mix`、`On-time vs Delayed`

- **明確不在本階段處理**
  - `Brazil Map`
  - `Category Share`
  - `Delay vs Review`
  - `Customer State`
  - `Product Category`
  - 任何第二份 payment / delivery artifact
  - 重新定義第一階段的 `GMV` 與 `Time Trend` 口徑

## 6. 補充說明 (Additional Notes)

- 這份契約刻意把 `Payment Type` 定義為 cohort selector，而不是單純的 payment-row filter，目的是讓訂單型與付款型面板可以共享同一層使用者心智模型。
- 後續若實作驗證發現 `order_delivered_customer_date` 缺值需要額外處理，必須在後續 FXX 中明寫例外規則，不能默默改寫本文件的 `On-time / Delayed` 定義。
- 若未來需要把 payment / delivery 邏輯拆成獨立 domain section，也應延後到 `P4` 驗證後再評估；第二階段目前仍以單一 artifact 為前提。

## TDD 實作檢查清單 (TDD Implementation Checklist)

1. 先用這份文件確認 `Date Range -> Payment Type` 與 order/payment 粒度定義。
2. 在 `P2` 撰寫 failing verification cases，覆蓋 membership、multi-payment、order-level dedupe 與 `payment_type = all` 的差異。
3. 擴充 artifact schema 與生成腳本直到驗證通過。
4. 在 `P3` 接 UI 時，只讓第二階段範圍內的 filter 與面板吃到新切片。
5. 完成後回到 `P4` 做人工對帳與 hybrid 邊界確認。
