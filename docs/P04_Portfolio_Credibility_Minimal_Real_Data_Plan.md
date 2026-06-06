---
author: Codex
date: 2026-06-06
title: Brazil Olist Dashboard 最小必要補強規劃
uuid: 6e6d4b4c8d4a4d38b6c6f07cc2d6d90a
version: 0.1
status: draft
---

# 規劃文件 P04 - Brazil Olist Dashboard 最小必要補強

## 1. 背景與目的

目前專案已完成前幾階段的 real-data integration，並建立 `artifact / script / facade / types` 的資料流與 hybrid boundary。現況下，dashboard 已有部分面板與 filter 採 real-backed，但 `KPI cards` 仍存在 mock-backed 指標，`Time Trend` 中的 `Late Delivery Rate` 也尚未 fully real-backed。

本次需求不是擴大產品範圍，也不是把 dashboard 重做成完整 BI 系統，而是針對面試作品集用途做最小必要補強。目標是提升作品在 demo、履歷敘述、面試 walkthrough 時的可信度，讓使用者可以誠實地說明：

- 這份 dashboard 主要 UI 已接上真實 Olist artifact
- KPI 與 Time Trend 的核心敘事指標不再停留在 mock
- 專案仍維持既有結構與 phase-based 演進方式，沒有為了補資料而破壞原本設計

## 2. 範圍

本次納入範圍限定如下：

1. 將 `KPI cards` 中目前仍為 mock-backed 的指標，優先改為 real-backed。
2. 將 `Time Trend` 中的 `Late Delivery Rate` 改為 real-backed。
3. 保持現有 UI 結構、版面、元件名稱不變。
4. 沿用既有 `artifact / script / facade / types` 設計，不另起新資料流。
5. 補齊對應規劃與後續實作切入點，讓下一步可銜接 `FXX / RXX / BXX`。

本次 scope 的核心不是「做更多功能」，而是「把目前面試最容易被質疑的 mock-backed 核心指標補強成可解釋的 real-backed 指標」。

## 3. 不在範圍內

以下明確不納入本次規劃：

- `Customer State` filter 啟用
- `Product Category` filter 啟用
- API / 後端
- 部署
- 效能優化
- 大幅 UI 重構
- 重新命名既有 panel / component / facade
- 擴充新的 dashboard 版面、頁面或互動流程
- 為了追求 fully real-backed 而把目前仍合理存在的 hybrid 結構全部拆掉

## 4. Phase / Checklist

### Phase Plan

| Phase | 標題 | 預期產出類型 | 主要輸出 | 狀態 |
|------|------|------------|--------|------|
| P1 | KPI / Time Trend real-backed 定義收斂 | FXX | 明確列出哪些 KPI 仍為 mock、哪些可直接以現有 artifact 推導、哪些需要 artifact schema 小幅補欄位 | [ ] 未開始 |
| P2 | artifact / types / facade 最小補強設計 | FXX | 以既有 generator、artifact schema、facade selectors 為主，補足 KPI 與 `Late Delivery Rate` 所需 real-backed 欄位與取用方式 | [ ] 未開始 |
| P3 | UI 接線與 hybrid boundary 校正 | FXX | 在不改元件名稱、不改版面的前提下，把 KPI cards 與 `Time Trend` 的 `Late Delivery Rate` 切換為 real-backed | [ ] 未開始 |
| P4 | 驗證、誠實揭露與面試說法整理 | FXX | 補齊驗證基準、保留 remaining mock/restriction 清單、整理面試可誠實描述的邊界 | [ ] 未開始 |

---

### Phase 1 - KPI / Time Trend real-backed 定義收斂

**目的**

先把本次補強目標縮到最小且可驗證的集合，避免需求在實作中擴散成「整個 dashboard 全面重接」。此 phase 只處理定義與邊界，不進行 UI 或資料流改寫。

**Checklist**

- [ ] 盤點目前 `KPI cards` 中哪些指標仍為 mock-backed，並逐一標示現況來源。
- [ ] 明確定義本次要 real-back 的 KPI 指標集合，避免把非必要 KPI 一起拉進 scope。
- [ ] 明確定義 `Time Trend` 中 `Late Delivery Rate` 的計算口徑。
- [ ] 對齊口徑是否維持既有 `Date Range` 驅動與月粒度呈現。
- [ ] 確認上述指標可在既有 Olist raw data 與現有 artifact generator 流程中推導，不引入 API / backend。

**對應實作文件**

`FXX` - KPI 與 Late Delivery Rate real-backed contract

**狀態**

`[ ] 未開始`

---

### Phase 2 - artifact / types / facade 最小補強設計

**目的**

在不破壞既有架構的前提下，把缺的資料補在既有資料流裡。這個 phase 的關鍵不是增加新層，而是讓 `script -> artifact -> types -> facade` 能穩定支援 KPI 與 `Late Delivery Rate`。

**Checklist**

- [ ] 確認現有 artifact 是否已具備 KPI 與 `Late Delivery Rate` 所需原始欄位。
- [ ] 若不足，僅在既有 artifact schema 內做最小必要擴充，不新增平行資料來源。
- [ ] 更新對應 `types`，讓 KPI 與 trend 使用的 real-backed 欄位具備明確型別。
- [ ] 更新 facade selectors / formatters，讓 UI 仍透過既有 app-facing API 取值。
- [ ] 確認資料命名與既有 domain language 一致，不引入模糊的新術語。

**對應實作文件**

`FXX` - artifact / types / facade minimal extension

**狀態**

`[ ] 未開始`

---

### Phase 3 - UI 接線與 hybrid boundary 校正

**目的**

把資料真正接到畫面上，但只做最小接線，不動既有 layout、panel 結構與元件命名。這個 phase 應維持現有 dashboard 外觀與操作感受。

**Checklist**

- [ ] `KPI cards` 改為從 real-backed facade 取值，不改卡片名稱與版面結構。
- [ ] `Time Trend` 中 `Late Delivery Rate` 改為 real-backed 序列。
- [ ] 保持現有 `DashboardPage` 與相關 components 的 UI 組織方式不變。
- [ ] 不啟用 `Customer State` / `Product Category` filters。
- [ ] 不順手擴改其他 panels、filters 或互動流程。
- [ ] 若仍保留 hybrid 行為，需在程式與文件上可清楚指出 boundary。

**對應實作文件**

`FXX` - KPI / Time Trend hybrid-boundary switch

**狀態**

`[ ] 未開始`

---

### Phase 4 - 驗證、誠實揭露與面試說法整理

**目的**

面試作品集的可信度不只來自 real-backed，也來自可以清楚交代哪些是真的、哪些尚未做、為什麼先停在這裡。此 phase 需要把驗證與誠實揭露一起完成。

**Checklist**

- [ ] 驗證 KPI cards 顯示值與 artifact / source calculation 一致。
- [ ] 驗證 `Time Trend` 中 `Late Delivery Rate` 序列與定義口徑一致。
- [ ] 整理本次完成後仍保留的 disabled filters / hybrid areas。
- [ ] 補一份面試可直接使用的誠實說法，說明本次補強範圍與刻意未做項目。
- [ ] 確認文件中沒有把目前仍未完成之處描述成 fully complete。

**對應實作文件**

`FXX` - verification and portfolio disclosure notes

**狀態**

`[ ] 未開始`

## 5. 驗收標準

本次規劃完成後，後續實作的驗收標準應至少包含：

1. `KPI cards` 內原本屬於本次 scope 的 mock-backed 指標，已改為 real-backed。
2. `Time Trend` 內的 `Late Delivery Rate` 已由 real-backed artifact / facade 提供。
3. 畫面結構、版面配置、元件名稱與主要互動方式維持不變。
4. 資料流仍經由既有 `artifact / script / facade / types`，沒有插入新的臨時資料來源。
5. `Customer State` 與 `Product Category` filters 仍維持 disabled 或未啟用狀態，沒有被誤導成可用功能。
6. 文件與實作能清楚指出本次完成的是「最小必要補強」，不是全面完成所有 real-data integration。

## 6. 面試用途下的成功定義

若本次工作完成，面試情境下應能成立以下說法：

- 可以打開 dashboard，示範 KPI 與 `Late Delivery Rate` 已由真實 Olist artifact 驅動。
- 可以清楚說明本專案採取 phased delivery，優先把最影響可信度的核心指標補到 real-backed。
- 可以指出哪些功能刻意沒有做，例如 `Customer State` / `Product Category` filter 尚未啟用，原因是資料語意與 scope 控制，而不是遺漏。
- 可以說明 UI 基本維持原設計，這次重點是提升資料可信度與敘事一致性，而不是做一次華麗改版。
- 可以誠實承認這仍是一個 hybrid dashboard，但核心面試敘事指標已不再依賴 mock。

## 7. 風險與誠實揭露原則

### 主要風險

- 現有 artifact 可能缺少某些 KPI 或 `Late Delivery Rate` 所需欄位，導致必須小幅擴 schema。
- 某些 KPI 若原本設計口徑模糊，強行改成 real-backed 可能暴露定義不一致問題。
- 若 scope 控制失守，容易從「補 KPI」擴散成重做更多 panels、filters 或 chart 邏輯。
- 若只追求畫面數值替換，卻沒有補齊文件與揭露，面試時仍會被追問破口。

### 誠實揭露原則

- 不把 hybrid dashboard 說成 fully real-time 或 fully productionized dashboard。
- 不把 disabled filters 說成「已支援，只是先隱藏」，除非資料流真的完成。
- 不把尚未 real-backed 的指標包裝成真實資料結果。
- 不為了面試敘事而隱藏本次刻意未納入的項目，應明說是 scope tradeoff。
- 文件、命名與驗收描述都應與實際完成範圍一致。

### 本次完成後可接受的誠實狀態

本次需求完成後，可接受的專案描述應接近：

> 這是一個以真實 Olist CSV 為基礎、透過 artifact generator 與 facade 餵給前端的 hybrid dashboard。
> 我這一輪優先把 KPI cards 與 Time Trend 的 Late Delivery Rate 補成 real-backed，提升作品集 demo 的可信度；
> 但 Customer State / Product Category filters、部署、後端與更完整的 productization 不在這一輪 scope 內。

