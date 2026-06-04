---
author: Codex
date: 2026-06-04
title: 真實資料整合第二階段總規劃
uuid: 7b968c39e5ff4d86a7da50a6ac76a73f
version: 0.1
status: draft
---

# 規劃書 – 真實資料整合第二階段

## 1. 背景與動機 (Background & Motivation)

參照 [P01 真實資料整合第一階段規劃](./P01_Real_Data_Integration_Plan.md) 與既有實作文件，可以確認第一階段的主路徑已建立：`KPI + Time Trend + Date Range` 已接上真實資料、repo 中已存在可匯入的 dashboard artifact 與生成流程，而 dashboard 也刻意維持在 hybrid 狀態，讓部分區塊 real-backed、其餘區塊仍為 mock-backed。

第二階段不重談第一階段已完成的主軸，而是要處理下一個資料依賴最小、但驗證價值夠高的擴充切面：讓 `Payment Type` filter 與 `Freight Distribution`、`Payment Mix`、`On-time vs Delayed` 三個面板接上真實資料。

這份規劃的核心動機有三個：

1. 延續單一 dashboard artifact 與 hybrid dashboard 策略，而不是為 payment / delivery 另開第二份資料契約。
2. 以最小新增資料依賴擴大 real-backed 覆蓋率，避免過早引入 geography、category、review 等額外複雜度。
3. 先把 `Date Range + Payment Type` 的切片語意定清楚，避免 UI 先跑、資料定義後補，造成第二階段數字互相對不起來。

## 2. 總體目標 (Overall Goal)

當第二階段各階段完成後，使用者將能在既有 hybrid dashboard 中，實際操作 `Payment Type` 作為全域 filter，並看到 `Freight Distribution`、`Payment Mix`、`On-time vs Delayed` 三個面板隨 `Date Range` 與 `Payment Type` 一起變化；同時團隊仍維持單一 dashboard artifact 與清楚的 mock-backed / real-backed 邊界，不把尚未完成的地圖、品類或評論面板誤包裝成已完成真實化。

## 3. 影響範圍 (Scope & Impact)

| 受影響模組 / 功能 | 預計改動類型 | 備註 |
|----------------|-------------|------|
| dashboard artifact schema | 新增功能 | 擴充 `Date Range -> Payment Type` 切片 |
| artifact 生成腳本 | 新增功能 | 產出 payment-aware slices |
| artifact 驗證腳本 | 新增功能 | 驗證新欄位與切片一致性 |
| `Payment Type` filter | 新增功能 | 從 placeholder 轉為真實可用 filter |
| `Freight Distribution` 面板 | 新增功能 | 接上 real-backed freight 分箱 |
| `Payment Mix` 面板 | 新增功能 | 接上 payment-level 聚合 |
| `On-time vs Delayed` 面板 | 新增功能 | 接上 delivery classification |
| hybrid dashboard 邊界說明 | 修正 | 保持 mock-backed 區塊不被誤解為已同步更新 |

## 4. 各階段計劃 (Phase Plan)

### 總覽

| 階段 | 名稱 | 建議文檔類型 | 關聯文檔 | 狀態 |
|------|------|------------|--------|------|
| P1 | Payment-aware 基底切片與共享契約 | FXX | [F04-phase2-payment-aware-slice-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F04-phase2-payment-aware-slice-contract.md) | [~] 進行中 |
| P2 | 單一 dashboard artifact 擴充 | FXX | — | [ ] 未開始 |
| P3 | Hybrid dashboard 接線 | FXX | — | [ ] 未開始 |
| P4 | 測試、對帳與範圍封板 | FXX | — | [ ] 未開始 |

---

### 階段 1 — Payment-aware 基底切片與共享契約

**描述**
先把第二階段的共用切片邏輯鎖定，讓後續 artifact 與 UI 都建立在一致的 order-level / payment-level 定義上。

這一階段需要明確確認：

- 第二階段沿用第一階段的 `Date Range` 定義與 delivered order 母體。
- 切片順序為 `Date Range -> Payment Type`。
- `On-time` 定義為 `order_delivered_customer_date <= order_estimated_delivery_date`，`Delayed` 定義為大於。
- `Freight Distribution` 的 order-level freight 採 `sum(order_items.freight_value)` by `order_id`。
- `Payment Mix` 以 `payment_value` 加總，保留同一訂單的多筆付款。
- `Payment Type` 命中規則為訂單 membership，只要某訂單出現所選 `payment_type` 即命中，不定義主付款方式。
- `payment_type = all` 時，訂單型面板與付款型面板的母體差異必須可被解釋與對帳。

**使用者確認方式**
- [ ] 團隊可以不依賴 UI 位置，而是用資料依賴順序說清楚 `Date Range`、`Payment Type`、訂單型聚合與付款型聚合之間的關係。
- [ ] 團隊可以清楚說明多筆付款訂單、缺付款紀錄訂單、缺交付日期訂單在各面板中的處理方式。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：[F04-phase2-payment-aware-slice-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F04-phase2-payment-aware-slice-contract.md)

**狀態**：`[~] 進行中`

---

### 階段 2 — 單一 dashboard artifact 擴充

**描述**
在不拆新 artifact 的前提下，把第二階段所需的 `paymentTypeOptions` 與三個面板切片資料加進既有 dashboard artifact。

第二階段必須保留第一階段既有欄位責任：

- `metadata`
- `dateRanges`
- `kpisByRange`
- `monthlySeriesByRange`

並以加法擴充 `paymentPanelsByRange` 類型的新資料區塊，使同一份 artifact 可提供：

- `paymentTypeOptions`
- `Payment Mix`
- `Freight Distribution`
- `On-time vs Delayed`

不允許新增第二份 payment / delivery artifact，也不應讓 UI 直接繞過既有 facade 去耦合底層 schema。

**使用者確認方式**
- [ ] UI 仍只需要讀取同一份 dashboard artifact，就能取得第一階段與第二階段所需資料。
- [ ] 每個 `Date Range` 都能找到對應的 `paymentTypeOptions` 與三個面板切片資料，且不需要回頭直接讀 CSV 才能 render。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：—

**狀態**：`[ ] 未開始`

---

### 階段 3 — Hybrid dashboard 接線

**描述**
在維持 hybrid UI 的前提下，讓 `Payment Type` 與三個指定面板正式走 real-backed 路徑，同時維持其他面板的 mock-backed 邊界清楚可見。

這一階段應：

- 將 `Payment Type` 從 disabled placeholder 改為真實互動。
- 讓 `Freight Distribution`、`Payment Mix`、`On-time vs Delayed` 讀取 artifact-backed 資料。
- 保留 `Brazil Map`、`Category Share`、`Delay vs Review` 等 mock-backed 狀態。
- 確保 `Payment Type` 雖是全域 filter，但只影響第二階段已 real-backed 的面板。

**使用者確認方式**
- [ ] 切換 `Date Range` 與 `Payment Type` 後，只有第二階段範圍內的三個面板跟著更新。
- [ ] 其他仍為 mock-backed 的面板保持穩定，不出現看似同步變動、實際仍是假資料的誤導性互動。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：—

**狀態**：`[ ] 未開始`

---

### 階段 4 — 測試、對帳與範圍封板

**描述**
確認第二階段的 payment-aware slices、面板數值與 hybrid 邊界都可被解釋、驗證與維持，並把第三階段不該提前吸收的範圍封住。

此階段聚焦：

- artifact 結構驗證
- panel-level 數值對帳
- UI screenshot / 行為驗證
- 已知資料品質例外與 phase 邊界記錄

建議至少抽查以下組合：

- `Date Range = all`，`Payment Type = all`
- `Date Range = 2017`，`Payment Type = credit_card`
- `Date Range = 2018_ytd`，`Payment Type = boleto`

**使用者確認方式**
- [ ] `Payment Mix`、`Freight Distribution`、`On-time vs Delayed` 的切片結果可被 artifact 與原始資料交叉驗證。
- [ ] 第二階段完成後，團隊仍能清楚指出哪些區塊是 real-backed、哪些區塊故意維持 mock-backed，且這個邊界有被記錄。

**建議文檔類型**：`FXX`（功能規格）

**關聯文檔**：—

**狀態**：`[ ] 未開始`

---

## 5. 接棒說明（AI 指引）

> 本節為接棒 AI 的執行指引。

接棒 AI 在開始工作前，請依序執行：

1. 先閱讀 [P01 真實資料整合第一階段規劃](./P01_Real_Data_Integration_Plan.md)，確認第二階段是在既有單一 artifact 與 hybrid dashboard 之上擴充，而不是重建第一階段。
2. 先承接 `P1` 的共享資料契約，明確鎖定 `Date Range -> Payment Type` 切片、order-level / payment-level 聚合口徑與邊界條件，再起草對應 `FXX`。
3. 起草與實作時，嚴格維持第二階段 in-scope 只包含 `orders`、`order_items`、`payments`，不要把 `customers`、`products`、`reviews`、`geolocation` 提前納入。
4. 擴充 artifact 時只能延伸同一份 dashboard artifact；若需要升級 schema，可以升級版本，但不能另起第二份 payment / delivery artifact。
5. UI 接線時，必須同步維持 hybrid dashboard 的說明與 guardrails，避免 `Payment Type` 製造「整頁皆已真實化」的錯覺。
6. 完成每個階段後，回寫本文件的總覽表、階段狀態與關聯文檔；若某階段發現需求已進入 geography / category / review 範圍，應停止擴 scope，視為第三階段候選。
7. 若遇到多筆付款、缺付款紀錄、缺交付日期等資料例外，需先在規格與對帳紀錄中定義處理方式，再進行 UI 接線。

> 若共享契約仍有模糊處，先透過 `ddd-start` 或 `grill-me` 收斂，再進入實作。

## 6. 補充說明 (Additional Notes)

第二階段 In Scope：

- 真實化 `Payment Type`
- 真實化 `Freight Distribution`
- 真實化 `Payment Mix`
- 真實化 `On-time vs Delayed`
- 延伸既有單一 dashboard artifact
- 延伸既有 artifact 生成與驗證腳本

第二階段 Out of Scope：

- `Brazil Map`
- `Category Share`
- `Delay vs Review`
- `Customer State`
- `Product Category`
- `customers`、`products`、`reviews`、`sellers`、`geolocation`
- 第二份 payment / delivery artifact
- 新 API、資料庫或後端服務
- 自由起訖日

UI guardrails：

- 先換資料來源，不先刪面板、刪 filter、縮 layout。
- `Payment Type` 即使是全域 filter，也不得暗示整頁所有面板都已同步更新。
- 若某區塊仍是 mock-backed，文件與驗證紀錄必須明確標示其狀態。
- 第二階段不應順手把 `Customer State`、`Product Category` 一起假裝啟用。

第三階段建議方向：

- 先補需要新資料表的維度，例如 `Customer State`、`Product Category`。
- 再擴展到 geography / category / review 相關面板，例如 `Brazil Map`、`Category Share`、`Delay vs Review`。
- 視第三階段實作壓力，再決定是否把單一 artifact 進一步抽成更明確的 domain sections；但在第二階段之前，不建議為了未來可能需求先拆檔。
