---
author: Codex
date: 2026-06-06
title: Brazil Olist Dashboard 作品完善優先的最小必要補強規劃
uuid: 6e6d4b4c8d4a4d38b6c6f07cc2d6d90a
version: 0.2
status: synced
---

# 規劃文件 P04 - Brazil Olist Dashboard 作品完善優先的最小必要補強

## 1. 背景與定位

目前專案已完成前幾階段的 real-data integration，並建立 `artifact / script / facade / types` 的資料流與 hybrid boundary。現況下，dashboard 已有部分面板與 filter 採 real-backed，但 `KPI cards` 仍存在 mock-backed 指標，`Time Trend` 中的 `Late Delivery Rate` 也尚未 fully real-backed。

P04 的定位不再是單純為面試準備一套「怎麼解釋現在還沒做完」的說法，而是替作品後續持續完善建立一個乾淨的起點。這一輪的任務是把最容易削弱作品真實感與完成度的核心指標補強成 real-backed，讓 dashboard 更像一個正在收斂中的分析產品，而不是一個只能靠敘事撐起來的展示頁。

因此，P04 的主軸是：

- 先補強最影響作品觀感的核心資料層缺口
- 在不擴大產品範圍的前提下，提升 dashboard 的真實感與一致性
- 保留誠實揭露，但將其降級為附屬材料，而不是後續方向的主導原則

## 2. 本次範圍

本次納入範圍限定如下：

1. 將 `KPI cards` 中目前仍為 mock-backed 的指標，優先改為 real-backed。
2. 將 `Time Trend` 中的 `Late Delivery Rate` 改為 real-backed。
3. 保持現有 UI 結構、版面、元件名稱不變。
4. 沿用既有 `artifact / script / facade / types` 設計，不另起新資料流。
5. 補齊對應規劃與後續實作切入點，讓下一步可銜接 `FXX / RXX / BXX`。

本次 scope 的核心不是「做更多功能」，而是「把目前最影響作品完成度與資料可信度的核心指標補強成 real-backed」，為後續更完整的 productization 留出乾淨的延伸面。

## 3. 目前不在範圍內

以下明確不納入本次規劃：

- `Customer State` filter 啟用
- `Product Category` filter 啟用
- API / 後端
- 部署
- 效能優化
- 大幅 UI 重構
- 重新命名既有 panel / component / facade
- 擴充新的 dashboard 版面、頁面或互動流程
- 為了追求 fully real-backed 而把目前仍合理存在的 hybrid 結構一次性全部拆掉

以上項目不納入，不代表它們不重要；只代表它們不屬於這一輪「最小必要補強」的優先順序。若後續以作品吸引力與產品感為主軸推進，這些項目仍可能在下一階段被正式納入。

## 4. Phase / Checklist

### Phase Plan

| Phase | 標題 | 預期產出類型 | 主要輸出 | 狀態 |
|------|------|------------|--------|------|
| P1 | KPI / Time Trend real-backed 定義收斂 | FXX | 明確列出哪些 KPI 仍為 mock、哪些可直接以現有 artifact 推導、哪些需要 artifact schema 小幅補欄位 | [x] 已完成 |
| P2 | artifact / types / facade 最小補強設計 | FXX | 以既有 generator、artifact schema、facade selectors 為主，補足 KPI 與 `Late Delivery Rate` 所需 real-backed 欄位與取用方式 | [x] 已完成 |
| P3 | UI 接線與 hybrid boundary 校正 | FXX | 在不改元件名稱、不改版面的前提下，把 KPI cards 與 `Time Trend` 的 `Late Delivery Rate` 切換為 real-backed | [x] 已完成 |
| P4 | 驗證、現況說明與後續演進銜接 | FXX | 補齊驗證基準、保留 remaining mock/restriction 清單，並把現況說明整理成支援後續作品演進的基線 | [x] 已完成 |

---

### Phase 1 - KPI / Time Trend real-backed 定義收斂

**目的**

先把本次補強目標縮到最小且可驗證的集合，避免需求在實作中擴散成「整個 dashboard 全面重接」。此 phase 只處理定義與邊界，不進行 UI 或資料流改寫。

**Checklist**

- [x] 盤點目前 `KPI cards` 中哪些指標仍為 mock-backed，並逐一標示現況來源。
- [x] 明確定義本次要 real-back 的 KPI 指標集合，避免把非必要 KPI 一起拉進 scope。
- [x] 明確定義 `Time Trend` 中 `Late Delivery Rate` 的計算口徑。
- [x] 對齊口徑是否維持既有 `Date Range` 驅動與月粒度呈現。
- [x] 確認上述指標可在既有 Olist raw data 與現有 artifact generator 流程中推導，不引入 API / backend。

**對應實作文件**

`FXX` - KPI 與 Late Delivery Rate real-backed contract

**狀態**

`[x] 已完成`

---

### Phase 2 - artifact / types / facade 最小補強設計

**目的**

在不破壞既有架構的前提下，把缺的資料補在既有資料流裡。這個 phase 的關鍵不是增加新層，而是讓 `script -> artifact -> types -> facade` 能穩定支援 KPI 與 `Late Delivery Rate`。

**Checklist**

- [x] 確認現有 artifact 是否已具備 KPI 與 `Late Delivery Rate` 所需原始欄位。
- [x] 若不足，僅在既有 artifact schema 內做最小必要擴充，不新增平行資料來源。
- [x] 更新對應 `types`，讓 KPI 與 trend 使用的 real-backed 欄位具備明確型別。
- [x] 更新 facade selectors / formatters，讓 UI 仍透過既有 app-facing API 取值。
- [x] 確認資料命名與既有 domain language 一致，不引入模糊的新術語。

**對應實作文件**

`FXX` - artifact / types / facade minimal extension

**狀態**

`[x] 已完成`

---

### Phase 3 - UI 接線與 hybrid boundary 校正

**目的**

把資料真正接到畫面上，但只做最小接線，不動既有 layout、panel 結構與元件命名。這個 phase 應維持現有 dashboard 外觀與操作感受。

**Checklist**

- [x] `KPI cards` 改為從 real-backed facade 取值，不改卡片名稱與版面結構。
- [x] `Time Trend` 中 `Late Delivery Rate` 改為 real-backed 序列。
- [x] 保持現有 `DashboardPage` 與相關 components 的 UI 組織方式不變。
- [x] 不啟用 `Customer State` / `Product Category` filters。
- [x] 不順手擴改其他 panels、filters 或互動流程。
- [x] 若仍保留 hybrid 行為，需在程式與文件上可清楚指出 boundary。

**對應實作文件**

`FXX` - KPI / Time Trend hybrid-boundary switch

**狀態**

`[x] 已完成`

---

### Phase 4 - 驗證、現況說明與後續演進銜接

**目的**

作品的可信度不只來自 real-backed，也來自可以清楚交代哪些已完成、哪些暫未處理、以及下一步準備往哪裡推進。此 phase 的重點不是替專案畫下句點，而是建立一份可持續沿用的現況基線，讓後續優化可以自然接續，而不是每次都重新解釋為什麼還停在 hybrid。

**Checklist**

- [x] 驗證 KPI cards 顯示值與 artifact / source calculation 一致。
- [x] 驗證 `Time Trend` 中 `Late Delivery Rate` 序列與定義口徑一致。
- [x] 整理本次完成後仍保留的 disabled filters / hybrid areas。
- [x] 補一份可對外使用的現況說法，說明本次補強範圍、當前限制與下一階段延伸方向。
- [x] 確認文件中沒有把目前仍未完成之處描述成 fully complete。

**對應實作文件**

`FXX` - verification and current-state notes

**狀態**

`[x] 已完成`

## 5. 驗收標準

本次規劃完成後，後續實作的驗收標準應至少包含：

1. `KPI cards` 內原本屬於本次 scope 的 mock-backed 指標，已改為 real-backed。
2. `Time Trend` 內的 `Late Delivery Rate` 已由 real-backed artifact / facade 提供。
3. 畫面結構、版面配置、元件名稱與主要互動方式維持不變。
4. 資料流仍經由既有 `artifact / script / facade / types`，沒有插入新的臨時資料來源。
5. `Customer State` 與 `Product Category` filters 仍維持 disabled 或未啟用狀態，沒有被誤導成可用功能。
6. 文件與實作能清楚指出本次完成的是「最小必要補強」，不是全面完成所有 real-data integration。

## 6. 作品完善優先下的成功定義

若本次工作完成，專案在作品集展示與後續演進上應能成立以下說法：

- 可以打開 dashboard，示範 KPI 與 `Late Delivery Rate` 已由真實 Olist artifact 驅動。
- 可以讓觀者一眼感受到首頁 summary layer 已具備更高真實感，而不是明顯混著展示用假資料。
- 可以清楚說明本專案採取 phased delivery，這一輪優先收斂最影響作品完成度的核心指標。
- 可以指出哪些功能暫未啟用，例如 `Customer State` / `Product Category` filter，並把它們定位成下一階段 productization 候選，而不是永久放棄。
- 可以保留誠實揭露，但整體語氣已從「解釋限制」轉為「展示正在成熟中的作品」。

## 7. 風險與現況說明原則

### 主要風險

- 現有 artifact 可能缺少某些 KPI 或 `Late Delivery Rate` 所需欄位，導致必須小幅擴 schema。
- 某些 KPI 若原本設計口徑模糊，強行改成 real-backed 可能暴露定義不一致問題。
- 若 scope 控制失守，容易從「補 KPI」擴散成重做更多 panels、filters 或 chart 邏輯。
- 若只追求畫面數值替換，卻沒有補齊文件與揭露，對外說明時仍會暴露敘事破口。

### 現況說明原則

- 不把 hybrid dashboard 說成 fully real-time 或 fully productionized dashboard。
- 不把 disabled filters 說成「已支援，只是先隱藏」，除非資料流真的完成。
- 不把尚未 real-backed 的指標包裝成真實資料結果。
- 不為了讓作品看起來更完整，就模糊這一輪刻意未納入的項目；應明說這是階段性 scope tradeoff。
- 文件、命名與驗收描述都應與實際完成範圍一致，同時保留對下一階段演進的延伸空間。

### 本次完成後可接受的專案描述

本次需求完成後，可接受的專案描述應接近：

> 這是一個以真實 Olist CSV 為基礎、透過 artifact generator 與 facade 餵給前端的 hybrid dashboard。
> 我這一輪優先把 KPI cards 與 Time Trend 的 Late Delivery Rate 補成 real-backed，先收斂最影響作品完成度的核心敘事層；
> 其餘像 Customer State / Product Category filters、更完整的 trend productization、部署與後端，則保留給後續作品完善階段處理。
