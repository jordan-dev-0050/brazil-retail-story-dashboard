---
author: Codex
date: 2026-06-19
title: P06 - Customer State / Product Category Global Filter Productization Plan
uuid: 0f8d5b6a1d3a4f1b9c7e2a4d6b8c9e10
version: 0.3
status: in_progress
---

# 規劃 P06 - Customer State / Product Category Global Filter Productization Plan

## 1. 背景與動機

P05 已經先收斂出目前 dashboard 的 hybrid boundary：
1. KPI cards 已經 fully real-backed。
2. Time Trend 採 monthly real-backed，daily / weekly 保留為明示的 projection。
3. `Customer State` 與 `Product Category` 雖然已經有 artifact-backed options，但先前刻意維持 disabled，避免 UI 提早暗示它們已經具備真正的 global filter coverage。

P06 的任務，就是把這兩個 disabled placeholder 正式提升成 staged global filters，補上語意定義、coverage boundary、artifact slice、selector wiring 與 UI disclosure。

## 2. 整體目標

以 P05 的 hybrid boundary 為基線，建立一條可逐步 productize 的 global filter 路徑，讓：
- `Customer State` 成為有真實 downstream coverage 的 global cohort。
- `Product Category` 在後續 phase 補上 membership-based cohort contract 與 artifact extension。
- `Payment Type` 明確維持為 payment-aware panels 的 secondary slice，而不是偷偷變成 global cohort 成員。
- same-dimension panel 採 focused mode，而不是偽裝成已被全域過濾。

## 3. 現況盤點

### 3.1 Coverage Tier

- `Options only`
  filter 只有選項，還沒有任何下游 selector 真正消費。
- `Dimension-backed panel`
  panel 本身已含有某個維度的資料，但不代表它已經是 global cohort。
- `Filter-slice-backed`
  artifact 與 selector 已支援真正的 filtered cohort。

### 3.2 Inventory Snapshot

| Surface | Customer State | Product Category | Notes |
|---|---|---|---|
| `FilterBar` UI control | P2 已啟用 | disabled placeholder | `Customer State` 已可用；`Product Category` 仍 staged |
| `getDashboardFilterOptions()` | active | options only | state options 已帶動 downstream cohort-aware selectors |
| `DashboardPage` filter state | active | stored but inactive | `customerState` 已參與 selector wiring |
| KPI cards | P2 supported | no | 讀取 state-scoped cohort |
| Time Trend | P2 supported | no | 讀取 state-scoped cohort |
| Payment-aware panels | P2 supported | no | `Customer State` cohort first，`Payment Type` second |
| Delay vs Review | P2 supported | no | 讀取 state-scoped cohort |
| Category Share | P2 supported | same-dimension later | 已套用 state cohort；category focus 等 P3 |
| Brazil Map | focused mode | no | 維持 range-backed map，並用 focused-state disclosure |
| `customerStateOptionsByRange` | supported | n/a | artifact-backed options |
| `productCategoryOptionsByRange` | n/a | options only | artifact-backed options，仍 staged |
| `kpisByRange` | `byState` 已加入 | no | P2 新增 state-scoped slices |
| `monthlySeriesByRange` | `byState` 已加入 | no | P2 新增 state-scoped slices |
| `paymentPanelsByRange` | `byState` 已加入 | no | P2 新增 state-scoped slices |
| `categoryPanelsByRange` | `byState` 已加入 | no | P2 新增 state-scoped slices |
| `reviewPanelsByRange` | `byState` 已加入 | no | P2 新增 state-scoped slices |

## 4. 語意邊界

### 4.1 Global Cohort

P06 目前將 global cohort 定義為：

`dateRange x customerState x productCategory`

規則如下：
- `Date Range` 仍是 primary global filter。
- `Customer State` 是第一個先 productize 的 order-level cohort。
- `Product Category` 已先定義語意，但 activation 延到後續 phase。
- `Payment Type` 不屬於 global cohort，只在已選 cohort 內切 payment-aware panels。

### 4.2 維度語意

#### Customer State

- 來源：`customers.customer_state`
- 語意：一筆 order 對應一個 customer state
- P2 選擇它作為第一個 fully supported 的 global-filter 維度

#### Product Category

- 來源：`order_items + products + product_category_name_translation`
- 語意：一筆 order 可能同時屬於多個 categories
- P3 將採用 membership-based cohort rule

### 4.3 Same-Dimension Handling

- `Customer State = SP`
  `Brazil Map` 不應塌成誤導性的單州 choropleth，而應維持 map-first 呈現並明示 focused-state mode。
- `Product Category = bed_bath_table`
  `Category Share` 後續應改採 focused-category behavior，而不是假裝 same-dimension ranking 已被全域過濾。

## 5. 影響範圍

| Area | 預期影響 | Notes |
|---|---|---|
| `scripts/generate-phase2-dashboard-artifact.mjs` | large | 新增 `byState` cohort slices |
| `scripts/verify-phase2-dashboard-artifact.mjs` | medium | 驗證 state-scoped slices 與 cohort consistency |
| `src/data/phase2DashboardTypes.ts` | medium | 擴充 state-scoped artifact contract |
| `src/data/phase2DashboardData.ts` | medium | 加入 state-aware selectors |
| `src/data/dashboardData.ts` | medium | app-facing facade wiring 與 contract copy |
| `src/components/DashboardPage.tsx` | medium | 啟用 `customerState` 並維持 payment-type validity |
| `BrazilMapPanel.tsx` | small | focused-state mode |
| `CategorySharePanel.tsx` | small | state-cohort disclosure |
| `TimeTrendPanel.tsx` / `DelayReviewPanel.tsx` / payment panels | small | 在 panel copy 顯示 active state cohort |
| current-state docs | medium | 保持 staged-coverage narrative 誠實 |

## 6. Phase Plan

### Phase Summary

| Phase | 狀態 | 主題 | 目標 | 交付類型 | 交付物 |
|---|---|---|---|---|---|
| P1 | [x] 已完成 | Global filter semantics contract | 凍結 cohort semantics、coverage tiers 與 payment-type precedence | FXX | `F10-p06-global-filter-semantics-contract.md` |
| P2 | [x] 已完成 | Customer State end-to-end productization | 將 `Customer State` productize 成第一條可用的 global cohort vertical slice | FXX + RXX | `F09-p06-customer-state-global-filter-contract.md`、`R01-p06-dashboard-state-filter-facade-cleanup.md` |
| P3 | [ ] 待處理 | Product Category artifact coverage productization | 補上 membership-based category cohort coverage | FXX + RXX | category cohort contract + artifact extension |
| P4 | [ ] 待處理 | UI activation / disclosure / acceptance baseline | 統一 rollout disclosure 與 verification baseline | FXX | rollout / disclosure / verification baseline |

---

### Phase 1 - Global filter semantics contract

**目標**

在擴寫實作前，先把語意邊界凍結：
1. `Customer State` 的 order-level cohort semantics。
2. `Product Category` 的 membership-based cohort semantics。
3. `Payment Type` 位於 global cohort 之外的 precedence。
4. 哪些 panels 是 supported now、supported later、或 special handling required。

**Acceptance Criteria**

- [x] `Customer State` 已明確定義為 single-value order-level cohort。
- [x] `Product Category` 已明確定義為 membership-based cohort。
- [x] `Payment Type` 已明確定義為 secondary slice，而不是 global cohort 成員。
- [x] 各 panel 已被歸類為 `supported now`、`supported later`、或 `special handling required`。
- [x] UI disclosure 規則已明示不可 silently ignore active filters。

**交付物**

- `F10` - P06 global filter semantics contract

---

### Phase 2 - Customer State end-to-end productization

**目標**

把 `Customer State` productize 成第一條 supported global cohort vertical slice，同時不提早啟用 `Product Category`。

**Covered Surfaces**

1. KPI cards
2. Time Trend
3. payment-aware panels
4. Delay vs Review
5. Category Share
6. Brazil Map special-state mode

**Implementation Focus**

- artifact `byState` cohort slices
- 接受 `customerState` 的 facade selectors
- active `Customer State` UI wiring
- Brazil Map focused-state mode

**Acceptance Criteria**

- [x] 任一非 `all-states` 選擇都會讓所有 supported panels 共用同一個 state cohort。
- [x] KPI、Time Trend、payment-aware 與 review panels 不再停留在 date-range only。
- [x] Brazil Map 採 focused-state behavior，而不是 confusing 的 same-dimension filtered map。
- [x] `Payment Type` 仍是在 selected state cohort 內切 payment-aware panels。
- [x] panel copy 與 disclosure 已清楚說明 `Customer State` 的 active coverage。

**交付物**

- `F09` - customer-state artifact + selector contract
- `R01` - dashboard facade / panel mode cleanup

---

### Phase 3 - Product Category artifact coverage productization

**目標**

補上 membership-based `Product Category` cohort support、artifact coverage、selector wiring 與 same-dimension disclosure。

**Acceptance Criteria**

- [ ] UI 清楚說明 membership-based category cohort semantics。
- [ ] supported panels 共用一套一致的 category cohort。
- [ ] Category Share 採 explicit focused-category mode 與 disclosure strategy。
- [ ] KPI / Trend / payment / review totals 可與 selected category cohort 對齊。
- [ ] coverage gap 會被明示，而不是 silently ignored。

**交付物**

- `FXX` - product-category cohort contract
- `RXX` - artifact schema / selector extension cleanup

---

### Phase 4 - UI activation / disclosure / acceptance baseline

**目標**

統一 staged productization narrative，讓 active filters、unsupported surfaces 與 verification expectations 對使用者與維護者都清楚可見。

**Acceptance Criteria**

- [ ] 每個 active global filter 都有可見的 panel-level disclosure。
- [ ] unsupported 或 staged surfaces 都被明確標示，不會看起來像 accidentally complete。
- [ ] README / walkthrough / current-state notes 如實反映 coverage。
- [ ] verification baseline 同時覆蓋 state cohort 與 category cohort 情境。

**交付物**

- `FXX` - UI disclosure + verification baseline

## 7. UI Disclosure Strategy

### 7.1 Filter-Level Disclosure

- `Customer State`：active global cohort，覆蓋 KPI、Trend、Payment、Review、Category Share；Brazil Map 採 focused-state mode。
- `Product Category`：staged rollout；category-cohort support 尚未出貨，因此部分 panels 仍顯示 all-category baseline。

### 7.2 Panel-Level Disclosure

panel 應有三種狀態：
1. `Applied`
   panel 正在使用 active global cohort。
2. `Focused mode`
   panel 與 selected dimension 相同，因此採 explicit focused-mode semantics。
3. `Not yet applied`
   panel 仍顯示較寬的 baseline，必須明示 coverage gap。

### 7.3 Guardrails

- 不可 silently ignore active global filter。
- 不可把 staged surface 說成 fully supported。
- 不可把 membership-based category complexity 偽裝成 fake single-slice story。

## 8. 與 P05 的關係

P05 與 P06 解的是不同層次的誠實性：
1. P05 先收斂 portfolio credibility boundary，特別是 summary 與 trend。
2. P06 再把 disabled dimension-filter placeholders 正式提升為 productization track。
3. P05 建立了 unfinished coverage 必須 disclosure 的規則。
4. P06 把這個規則延伸到 global cohort semantics 與 panel coverage tiers。

簡單說：
- P05 = `summary / trend credibility boundary`
- P06 = `global filter semantics and coverage boundary`

## 9. Out of Scope

- 把所有 dashboard surface 一次做成 fully real-backed global BI system
- backend / API / database / ETL work
- 完整 panel layout redesign
- drill-down navigation
- 把 `Payment Type` 升級成 global filter
- 跳過 `Product Category` 的 semantics contract

## 10. 目前交付快照

P2 完成後，目前實作狀態為：
- `Customer State` 已成為第一個 shipped 的 supported global cohort。
- `Product Category` 仍維持 intentionally staged。
- KPI、trend、payment、review、category surfaces 已具備 state-scoped artifact slices。
- Brazil Map 仍是 same-dimension special case，並使用 focused-state disclosure。

下一步仍是：
- 以 `F10-p06-global-filter-semantics-contract.md` 固化整體 semantics freeze
- 進入 P3 的 category-focused FXX / RXX 工作
