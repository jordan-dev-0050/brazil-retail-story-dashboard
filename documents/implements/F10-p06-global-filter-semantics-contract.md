---
author: Codex
date: 2026-06-19
title: F10 - P06 Global Filter Semantics Contract
uuid: 8f6a6b2d4c24473da553e6f8f55fc2c3
version: 0.1
---

# F10 - P06 Global Filter Semantics Contract

## 1. 功能概述

本文件凍結 P06 的 global filter semantics，避免後續實作在沒有先講清楚的情況下，把 `Customer State`、`Product Category`、`Payment Type` 與 same-dimension panels 的語意混在一起。這份 contract 的目的不是直接開新功能，而是先定義哪些 filter 是 global cohort、哪些是 secondary slice、哪些 panels 已支援、哪些 panels 需要 special handling。

## 2. Requirement / User Story

- **As a** dashboard 維護者與作品審查者
- **I want** `Customer State`、`Product Category`、`Payment Type` 的 global filter 語意被先明確定義
- **So that** 後續 P2 / P3 / P4 的實作與 disclosure 不會互相矛盾，也不會誤導使用者

## 3. Acceptance Criteria

- **Scenario 1: Customer State 是 order-level global cohort**
  - **Given** dashboard 需要先 productize 一個真實可用的 global filter
  - **When** 定義 `Customer State` 語意
  - **Then** 它必須被視為 single-value order-level cohort

- **Scenario 2: Product Category 是 membership-based cohort**
  - **Given** 一筆 order 可能包含多個 categories
  - **When** 定義 `Product Category` 語意
  - **Then** 它必須被視為 membership-based cohort，而不是 single-value dimension

- **Scenario 3: Payment Type 不屬於 global cohort**
  - **Given** payment-aware panels 已有自身切片行為
  - **When** 定義 `Payment Type` 語意
  - **Then** 它必須維持 secondary slice，而不是 global cohort 成員

- **Scenario 4: same-dimension panel 不能假裝被全域過濾**
  - **Given** `Brazil Map` 與 `Category Share` 與某些 filter 維度相同
  - **When** 對應 filter 被啟用
  - **Then** 這些 panels 必須採 focused mode 或 staged disclosure，而不是 silent filtering

## 4. Coverage Tier 定義

- `supported now`
  panel 已經有 artifact slice、selector wiring 與 UI disclosure，可真實反映 active cohort。
- `supported later`
  語意已定義，但 artifact coverage 或 selector wiring 尚未完成。
- `special handling required`
  panel 與 filter 維度相同，必須採 focused mode 或其他明示策略。

## 5. P06 語意凍結結果

### 5.1 Global Cohort Formula

`dateRange x customerState x productCategory`

### 5.2 Filter Contract

- `Date Range`
  primary global filter。
- `Customer State`
  single-value order-level global cohort。
- `Product Category`
  membership-based global cohort，後續 phase 啟用。
- `Payment Type`
  secondary slice，只在 payment-aware panels 的 selected cohort 內再切分。

### 5.3 Panel Coverage Contract

| Panel Group | Customer State | Product Category | Notes |
|---|---|---|---|
| KPI cards | supported now | supported later | state cohort 已可下推；category 待後續 artifact coverage |
| Time Trend | supported now | supported later | 與 KPI 相同 |
| Payment-aware panels | supported now | supported later | `Payment Type` 仍為 secondary slice |
| Delay vs Review | supported now | supported later | review cohort 跟隨 selected cohort |
| Brazil Map | special handling required | not applicable | 對 state filter 採 focused-state mode |
| Category Share | supported now for state | special handling required | 對 category filter 後續採 focused-category mode |

## 6. UI Guardrails

- active filter 不可被 silently ignore。
- staged coverage 不可被描述成 already supported。
- same-dimension panel 不可用假 filtered state 混淆使用者。
- `Payment Type` 不可被敘述成 global cohort 成員。

## 7. 後續銜接

- P2 依本 contract 先完成 `Customer State` end-to-end productization。
- P3 再依本 contract 補上 `Product Category` membership-based cohort coverage。
- P4 統一 disclosure、README、walkthrough 與 verification baseline。
