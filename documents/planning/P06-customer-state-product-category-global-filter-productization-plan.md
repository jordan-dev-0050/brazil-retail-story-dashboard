---
author: Codex
date: 2026-06-18
title: P06 - Customer State / Product Category Global Filter Productization Plan
uuid: 0f8d5b6a1d3a4f1b9c7e2a4d6b8c9e10
version: 0.1
status: draft
---

# 規劃文件 P06 - Customer State / Product Category Global Filter Productization Plan

## 1. 背景與動機 (Background & Motivation)

P05 已把目前 dashboard 最影響可信度的 hybrid boundary 收斂到較誠實的 current state：

1. KPI cards 已 fully real-backed。
2. Time Trend 已明確改成 monthly real-backed + daily/weekly projected 的 hybrid 語意。
3. `Customer State` / `Product Category` 雖已有 artifact-backed options，但仍刻意 disabled，避免 UI 暗示它們已經能切整個 dashboard 母體。

這兩個 filters 在產品語意上都屬於 global filters。它們若被啟用，使用者自然會預期整個 dashboard 的 cohort 都被改寫，而不是只有某幾塊 panel 有反應。但以目前 repo 現況來看，dashboard 只具備「部分 state/category 維度資料」，尚未具備「跨 artifact 一致的 global slice contract」：

- `customerState` / `productCategory` 已有 range-scoped option inventory。
- `Brazil Map` 有 state 維度 panel。
- `Category Share / Top Categories` 有 category 維度 panel。
- 其他 summary、trend、payment-aware、review panels 仍只有 `dateRange` 或 `dateRange + paymentType` slice。

因此 P06 的目標不是急著把兩個下拉選單打開，而是先誠實盤點 coverage，再把 productization 拆成可驗收的 phase。核心原則是：

1. 語意上承認它們是 global filters。
2. 實作上不假裝所有 artifacts 已支援。
3. UI 上不允許任何 panel 在 filter 啟用後「默默不變」卻沒有 disclosure。

## 2. 總目標 (Overall Goal)

以 P05 的 hybrid boundary 為基線，建立一條可逐步 productize 的 global filter 路徑，讓 `Customer State` 與 `Product Category` 最終能成為有明確 coverage contract、artifact slice、selector wiring、UI disclosure 與驗收標準的產品功能，而不是只有 option inventory 的 disabled controls。

> 這份 P06 不預設「下一步就要直接把兩個 filters 全部打開」。
> 它先把 global semantics、coverage tiers、phase boundary 與 disclosure strategy 定清楚，之後再由 FXX / RXX 分階段落地。

## 3. 現況盤點 (Current Inventory)

### 3.1 Coverage 分類定義

- `Options only`
  只有選項資料，尚未接到任何 app-facing global slice。
- `Dimension-backed panel`
  panel 自身帶有該維度資料，但只以 `dateRange` 為切法，不代表已支援 global filter。
- `Filter-slice-backed`
  已存在可被 filter selector 直接切換的 slice contract。

### 3.2 Filters / Selectors / Panels / Artifact Slices Inventory

| 區塊 | Customer State | Product Category | 現況說明 |
|------|----------------|------------------|----------|
| `FilterBar` UI control | Options only | Options only | `src/components/FilterBar.tsx` 會 render 兩個 select，但 config 仍為 `disabled: true`。 |
| `getDashboardFilterOptions()` | Options only | Options only | `src/data/dashboardData.ts` 只回傳 options，沒有 downstream slice wiring。 |
| `getInitialFilterValues()` | Default value only | Default value only | 會初始化 `all-states` / `all-categories`，但目前沒有 selector 消費它們。 |
| `DashboardPage` filter state | Stored but inactive | Stored but inactive | `filters.customerState` / `filters.productCategory` 會存在 state 中，但 `updateFilter()` 只有處理 `dateRange` 的相依重算；沒有任何 panel selector 讀它們。 |
| KPI cards (`buildKpiCards`) | No | No | 只吃 `kpisByRange` + `reviewPanelsByRange`。 |
| Time Trend (`getTimeTrendModel`) | No | No | 只吃 `monthlySeriesByRange` 與 projection logic。 |
| Payment-aware selectors (`getDashboardPaymentPanelSlice`) | No | No | 只支援 `dateRange + paymentType`。 |
| Brazil Map (`getDashboardGeographyPanel`) | Dimension-backed panel | No | `geographyPanelsByRange` 具 state metrics，但沒有 `byState` slice。 |
| Category Share (`getDashboardCategoryPanel`) | No | Dimension-backed panel | `categoryPanelsByRange` 具 category metrics，但沒有 `byCategory` slice。 |
| Delay vs Review (`getDashboardReviewPanel`) | No | No | review artifact 只有 date-range cohort。 |
| Payment Mix / Freight Distribution / On-time vs Delayed | No | No | 全部依賴 `paymentPanelsByRange.slicesByPaymentType`。 |
| `customerStateOptionsByRange` | Options only | N/A | generator 已產出州別 options。 |
| `productCategoryOptionsByRange` | N/A | Options only | generator 已產出品類 options。 |
| `geographyPanelsByRange` | Dimension-backed panel | N/A | 只支援 range-scoped map metrics。 |
| `categoryPanelsByRange` | N/A | Dimension-backed panel | 只支援 range-scoped category ranking。 |
| `kpisByRange` | No | No | 目前沒有 `byState` / `byCategory` cohort。 |
| `monthlySeriesByRange` | No | No | 目前沒有 `byState` / `byCategory` cohort。 |
| `paymentPanelsByRange` | No | No | 只有 `paymentType` secondary slice。 |
| `reviewPanelsByRange` | No | No | 沒有 state/category cohort。 |

### 3.3 關鍵結論

1. 目前 repo 裡「有 state/category 維度資料」不等於「已支援 state/category global filters」。
2. `Customer State` 與 `Product Category` 的成熟度不相同：
   - `Customer State` 是 order-level single-value 維度，cohort semantics 相對穩定。
   - `Product Category` 是 order-item / order relationship 的多對多維度，若以 order cohort 切 dashboard，必須先定義 membership rule。
3. 真正缺的不是下拉選單，而是跨 artifact 一致的 global filter contract。

## 4. 語意邊界 (Semantics Boundary)

### 4.1 Global Filter 定義

P06 將 global cohort 定義為：

`dateRange x customerState x productCategory`

其中：

- `Date Range` 是第一層母體切分，維持現況。
- `Customer State` 與 `Product Category` 一旦 productize，語意上都應切 dashboard 母體，而不是只有單一 panel 的 local control。
- `Payment Type` 維持現況，屬於 payment-aware panels 的 secondary slice，而不是與 state/category 同級的 global filter。

### 4.2 維度差異

#### Customer State

- 來源穩定：`customers.customer_state`
- 粒度清楚：每筆 order 對應單一 customer state
- 適合優先 productize 成第一個真正可啟用的 global filter

#### Product Category

- 來源為 `order_items + products + product_category_name_translation`
- 一筆 order 可同時包含多個 categories
- 若要切 dashboard 母體，必須先決定 cohort membership rule，例如：
  - 任一 item 屬於該 category，order 即納入 cohort
  - 或只以 primary category / top-gmv category 代表 order

P06 預設採第一種方向起草：`membership-based cohort`，但必須在 FXX 明確寫出副作用：

- categories 之間不可加總回總 order population
- Payment Mix / Review / KPI 都會變成「包含該 category 的 orders」
- panel 文案與 disclosure 不能把它說成互斥切片

### 4.3 自身維度面板的特殊行為

若 global filter 與 panel 主維度相同，會出現自我收斂問題：

- `Customer State = SP` 時，Brazil Map 可能接近單州 spotlight，而不再是完整排名比較。
- `Product Category = bed_bath_table` 時，Category Share panel 可能退化成單一 category focus。

因此 P06 要求後續 FXX 必須對這類 panel 明確定義：

1. 是否維持完整分佈但只保留 filtered cohort。
2. 是否切成 spotlight/focus mode。
3. 是否需要 panel-level disclosure，說明這是 filtered cohort 的局部視角，而非全市場比較。

## 5. Scope & Impact

| 檔案 / 區塊 | 預期影響 | 原因 |
|-------------|----------|------|
| `scripts/generate-phase2-dashboard-artifact.mjs` | 大 | 需要擴充 `byState` / `byCategory` cohort slices，且 category 需明確 membership semantics。 |
| `scripts/verify-phase2-dashboard-artifact.mjs` | 大 | 現有驗證只檢查 options 與 range-scoped panels，未驗證 filtered cohorts。 |
| `src/data/phase2DashboardTypes.ts` | 大 | 需定義 global filter coverage、filtered slices、possibly panel mode metadata。 |
| `src/data/phase2DashboardData.ts` | 大 | 需新增 state/category-aware selectors，不再只有 `byRange` 與 `byPaymentType`。 |
| `src/data/dashboardData.ts` | 大 | app-facing facade 需改成接受 `filters` 或明確的 cohort key。 |
| `src/components/DashboardPage.tsx` | 大 | 需決定 active filter 如何驅動 panels，以及 unsupported panel disclosure。 |
| `src/components/FilterBar.tsx` | 中 | 需加入可用性、coverage、maybe staged activation 提示。 |
| `BrazilMapPanel.tsx` / `CategorySharePanel.tsx` | 中 | 需處理 same-dimension filter 後的視覺與文案。 |
| `TimeTrendPanel.tsx` / `DelayReviewPanel.tsx` / payment-aware panels | 中到大 | 若納入 coverage，需要消費新 filtered slice；若暫不納入，必須明確揭露未支援狀態。 |
| README / current-state docs | 中 | 必須更新作品敘事，避免把 staged coverage 講成 fully global-ready。 |

## 6. Phase Plan

### Phase Summary

| Phase | 狀態 | 主題 | 目標 | 交付類型 | 主要輸出 |
|------|------|------|------|----------|----------|
| P1 | [ ] 未開始 | Global filter semantics contract | 凍結 state/category 的 cohort 定義、coverage tiers、panel exceptions、paymentType precedence | FXX | `FXX-p06-global-filter-semantics-contract.md` |
| P2 | [ ] 未開始 | Customer State end-to-end productization | 先把 single-value 維度打通為第一個可啟用 global filter | FXX + RXX | state artifact/selector contract + facade cleanup |
| P3 | [ ] 未開始 | Product Category artifact coverage productization | 以 membership-based cohort 擴充 category slices，逐步讓 panels 進入 supported coverage | FXX + RXX | category cohort contract + artifact extension |
| P4 | [ ] 未開始 | UI activation / disclosure / acceptance baseline | 讓 active filters 與 panel coverage 在 UI 與文件上完全對齊 | FXX | rollout / disclosure / verification baseline |

---

### Phase 1 - Global filter semantics contract

**目標**

先解決語意問題，再開始接線。這個 phase 要明確回答：

1. `Customer State` 的 global cohort 定義是什麼。
2. `Product Category` 的 membership rule 是什麼。
3. `Payment Type` 與 global filters 的 precedence 是什麼。
4. 哪些 panels 屬於 phase-ready、哪些仍 out of coverage。

**範圍**

- 定義 global cohort key。
- 定義 supported / unsupported / same-dimension-special-case 三種 coverage tier。
- 定義 panel-level disclosure contract。
- 凍結「不可 silent ignore filter」原則。

**Acceptance Criteria**

- [ ] 文件明確寫出 `Customer State` 採 order-level single-value cohort。
- [ ] 文件明確寫出 `Product Category` 的 cohort membership rule 與非互斥副作用。
- [ ] 文件明確寫出 `Payment Type` 是 global cohort 之後的 secondary slice。
- [ ] 每個 panel 被標註為 `supported now`、`supported later`、或 `special handling required`。
- [ ] 明確禁止在 UI 啟用後讓未支援 panel 靜默維持全母體。

**交付**

`FXX` - P06 global filter semantics contract

---

### Phase 2 - Customer State end-to-end productization

**目標**

先 productize `Customer State`，因為它是 single-value 維度，最適合作為第一條真正的 global filter vertical slice。這一階段不必同時解完 `Product Category` 的多對多語意。

**建議支援順序**

1. KPI cards
2. Time Trend
3. payment-aware panels
4. Delay vs Review
5. Category Share
6. Brazil Map special-state mode

**範圍**

- artifact 產出 `byState` cohort slices
- facade selectors 接受 `customerState`
- UI 啟用 `Customer State`
- same-dimension 的 Brazil Map 需定義 filtered mode

**Acceptance Criteria**

- [ ] 在任一 `customerState` 非 `all-states` 時，所有標記為 supported 的 panels 都反映同一 filtered cohort。
- [ ] KPI、Time Trend、payment-aware、review panels 不再只吃全 range 母體。
- [ ] Brazil Map 對 state filter 的行為已被明確定義並可驗證，不呈現 confusing 空殼比較。
- [ ] `Payment Type` 仍只影響 payment-aware panels，但其 order population 已先被 state cohort 切過。
- [ ] 若仍有未支援 panel，UI 會明確揭露「未套用 Customer State」。

**交付**

- `FXX` - customer-state artifact + selector contract
- `RXX` - dashboard facade / panel mode cleanup

---

### Phase 3 - Product Category artifact coverage productization

**目標**

在不假裝 category 是 single-value 維度的前提下，建立可解釋、可驗證的 category cohort。這一階段的困難不是 selector wiring，而是 cohort semantics 與 disclosure。

**範圍**

- artifact 產出 `byCategory` cohort slices
- 明確標註 membership-based behavior
- 定義 Category Share same-dimension mode
- 決定 review / payment-aware / trend 是否全部進 coverage，或仍保留 staged rollout

**Acceptance Criteria**

- [ ] 文件與 UI 都清楚說明 category filter 採 membership-based cohort，而非互斥分桶。
- [ ] 支援中的 panels 對同一 category selection 使用一致 cohort。
- [ ] Category Share 在 category filter 啟用後不會假裝仍是全市場 top ranking；必須有 focus mode 或明確 disclosure。
- [ ] 驗證腳本可抽查至少一個 category cohort，對出 KPI / trend / panel totals 的一致性。
- [ ] 若仍有 panel 未支援 category filter，UI 明確揭露 coverage gap。

**交付**

- `FXX` - product-category cohort contract
- `RXX` - artifact schema / selector extension cleanup

---

### Phase 4 - UI activation / disclosure / acceptance baseline

**目標**

把 staged productization 變成誠實可用的產品表現。這一階段不是新增更多 slices，而是確保 active filters、panel coverage、portfolio 敘事、驗證方式全部一致。

**範圍**

- filter-level disclosure
- panel-level unsupported badges / notes
- current-state narrative
- verification baseline

**Acceptance Criteria**

- [ ] 任一 active global filter 出現時，頁面上可看出它目前涵蓋哪些 panel、哪些尚未涵蓋。
- [ ] 不存在「filter 可選，但沒有任何說明、部分 panel 又默默忽略」的狀況。
- [ ] current-state notes、README、walkthrough 語句與實際 coverage 相符。
- [ ] 測試 / verification 可驗證至少一組 state cohort 與一組 category cohort。

**交付**

`FXX` - UI disclosure + verification baseline

## 7. UI Disclosure Strategy

### 7.1 Filter-Level Disclosure

當 `Customer State` 或 `Product Category` 啟用時，FilterBar 或其下方必須顯示 coverage 說明，例如：

- `Global cohort applied to KPI, Trend, Payment, Review. Map/Category panel use focused mode.`
- `Product Category is in staged rollout; some panels still show all-category baseline.`

### 7.2 Panel-Level Disclosure

每個 panel 必須落在以下三種之一：

1. `Applied`
   文案或 badge 明確表示已套用目前 global cohort。
2. `Focused mode`
   適用於與 filter 同維度的 panel，例如 map/category panel。
3. `Not yet applied`
   明確說明目前仍顯示全母體或較上層 cohort。

### 7.3 禁止事項

- 不允許 active global filter 存在時，panel 無變化且無 disclosure。
- 不允許把 unsupported 狀態包裝成「只是視覺上沒差」。
- 不允許把 membership-based category cohort 說成 mutually exclusive category slice。

## 8. 與 P05 Hybrid Boundary 的關係

P05 與 P06 的關係不是取代，而是上下游：

1. P05 負責把作品可信度最差的 summary/trend boundary 先收斂，並誠實保留 disabled filters。
2. P06 以 P05 的 current-state disclosure 為基線，正式把 `Customer State` / `Product Category` 從「disabled placeholder」提升為新的 productization track。
3. P05 的 UI guardrail 仍然有效：
   - 先換資料來源，再談結構變更
   - unfinished coverage 寧可 disclosure，也不要假裝 fully supported
4. 若 P06 尚未完成，P05 的 hybrid note 仍應保留或演進，而不是提前移除。

可把關係理解為：

- P05 解的是 `summary/trend credibility boundary`
- P06 解的是 `global filter semantics and coverage boundary`

## 9. Out of Scope

本規劃暫不直接承諾以下事項：

- 把 dashboard 宣告為 fully real-backed global BI system
- 引入 backend / API / database / ETL
- 一次重做全部 panel layout
- 新增與現有 dashboard 無關的 drill-down navigation
- 把 `Payment Type` 提升為真正 global filter
- 在沒有 semantics contract 前直接啟用 `Product Category`

## 10. 後續建議

建議下一步先用 `ddd-doc` 從 P06 拆出第一份 FXX：

`FXX-p06-global-filter-semantics-contract.md`

優先把以下問題寫死：

1. `Customer State` 是否作為第一個先啟用的 global filter。
2. `Product Category` 是否採 membership-based cohort。
3. 每個 panel 的 coverage tier 與 same-dimension mode。
4. `Payment Type` 與 global cohort 的 precedence 文句。

在這份 FXX 穩定之前，不建議直接開做 selector wiring 或把 filters 改成 enabled。
