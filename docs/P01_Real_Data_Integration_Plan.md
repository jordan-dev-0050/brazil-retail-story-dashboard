# P01 真實資料整合第一階段規劃

## 1. 文件定位

- 文件類型：PXX Planning Document
- 文件代號：`P01`
- 主題：Brazil Retail Story Dashboard 從 mock data 接到 real data 的第一階段
- 狀態：Draft
- 目的：在不一次性重構整個 dashboard 的前提下，定義一條可驗證、可分階段推進的最小真實資料接入路徑，作為後續 DDD 工作的總規劃依據

## 2. 背景與現況

目前 dashboard 主要使用 [src/data/dashboardMock.ts](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/dashboardMock.ts) 提供展示資料，畫面上的 KPI、Time Trend、篩選器選項與其他圖表資料皆為假資料。專案中已具備 Olist 真實資料 CSV，位於 `data/` 目錄，可用資料包含 `orders`、`order_items`、`payments`、`customers`、`products`、`sellers`、`reviews`、`geolocation` 與 category translation。

參考既有文件後，可以確認目前專案方向已明確指向「以 Olist 資料講述 Brazil retail story」，但尚未定義一條從 mock 過渡到 real data 的最小成功切面。這份規劃聚焦在第一階段，只處理足以驗證資料鏈路與前端接線方式的最小範圍。

## 3. 本次規劃要解的核心問題

1. 如何讓 dashboard 在不直接讀原始 CSV 的前提下，開始使用真實資料。
2. 如何用最小切面驗證資料模型、前端接線與日期篩選鏈路。
3. 如何避免一次拔掉 mock，保留安全回退與視覺比對能力。
4. 如何把第一階段的產出整理成後續 DDD 工作可持續推進的基礎。

## 4. 已知決策與規劃假設

### 4.1 已知決策

- 第一階段目標是從 mock data 邁向 real data，但不追求全量完成。
- 前端不直接讀原始 CSV。
- 先把 Olist CSV 整理成一份給 dashboard 使用的中間結果檔。
- mock 與 real data 先並存。
- 第一波只處理 `KPI + Time Trend`。
- 主時間軸使用「下單時間」`order_purchase_timestamp`。
- 第一波指標只做：
  - 訂單數
  - GMV
- 第一版只有「日期篩選」會真的影響資料。
- 其他篩選器先保留 UI，不接真邏輯。
- Time Trend 第一版只看月。
- KPI 第一版不做成長率與前期比較值。
- 日期篩選先使用固定選項，不做自由起訖日。
- 真資料第一版先包成一份檔案。
- mock / real 切換先用程式內簡單開關。
- 驗證方式先做人眼核對，不急著做自動化測試。

### 4.2 規劃假設

- 第一版 GMV 採 `order_items.price` 加總，不含 `freight_value`，以降低定義爭議並對齊一般商品交易額理解。
- 第一版訂單數以 `orders.order_id` 去重後計算，分析母體固定為 `order_status = delivered`、`order_purchase_timestamp` 非空，且時間窗限定於 `2017-01-01` 至 `2018-08-31`。
- 第一版時間範圍選項固定為 `All Period (2017-01 to 2018-08)`、`2017 Full Year`、`2018 YTD (Jan-Aug)` 三個可直接映射到資料區間的選項。
- 第一版中間結果檔為單一檔案，格式可為 `json` 或 `ts` 可匯入常數；實際格式於後續 DDD 實作前再依前端讀取便利性決定。
- 第一版只處理 dashboard 首屏所需資料，不先為後續頁面預留過度抽象的通用 schema。

## 5. 為什麼第一階段先做 KPI + Time Trend

第一階段先做 `KPI + Time Trend`，是因為這是最小但完整的真資料驗證切面。它同時覆蓋了：

- 聚合指標：驗證訂單數與 GMV 的計算規則是否正確。
- 時間維度：驗證主時間軸使用 `order_purchase_timestamp` 是否能穩定產出月序列。
- 篩選鏈路：驗證日期篩選是否能實際影響 KPI 與趨勢圖。
- 前端接線：驗證真資料進入 UI 後，至少有兩種不同型態元件能正確渲染。
- 人眼驗證：KPI 與月趨勢最容易用 Excel、SQL 或手工聚合結果交叉比對。

若第一階段直接涵蓋 map、category、payment、delivery 或 review，不只 schema 會快速膨脹，也會把 join 規則、地理映射、狀態定義與額外篩選邏輯一起拉進來，導致我們無法明確知道失敗點到底在資料處理、資料模型還是前端顯示。

## 6. 為什麼先做中間結果檔，而不是前端直讀 CSV

前端不直接讀原始 CSV，原因如下：

- 原始 CSV 粒度過細，欄位多且表間關聯複雜，會把資料清理與 join 邏輯推進前端。
- CSV 並不等於 dashboard 所需模型；前端真正需要的是已聚合、可直接渲染的 view model。
- 若由前端直接讀 CSV，後續每加一個圖表都可能重複實作資料轉換，增加維護成本。
- 中間結果檔可以把資料清理規則固定化，降低 mock 與 real 切換時的行為不一致。
- 單一中間結果檔有利於版本控管、人眼驗證與未來擴充成批次產物生成流程。

本規劃將第一版中間結果檔視為「dashboard-ready artifact」，責任是承接原始 Olist CSV 與前端呈現之間的轉譯層，而不是把 CSV 搬進前端。

## 7. mock / real 並存的過渡策略

第一階段不直接移除 [src/data/dashboardMock.ts](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/dashboardMock.ts)，而採雙資料源並存：

- 保留既有 mock 資料作為畫面穩定基準。
- 新增一份真資料 artifact，僅覆蓋 `KPI + Time Trend` 所需資料。
- 以程式內簡單開關決定當前畫面讀 mock 或 real。
- 若 real data 僅部分模組完成，未完成區塊仍回退到 mock。

這個策略的價值是：

- 降低一次切換全站的風險。
- 讓設計與前端可以繼續使用 mock 調整未接線區塊。
- 讓 PM / 開發者可以在同一畫面上比較 mock 與 real 的結構差異。
- 讓後續 phase 可以逐步替換，不需要等待完整資料模型一次定案。

## 8. 第一版資料 schema 應涵蓋的資訊

第一版 schema 只需要覆蓋 `KPI + Time Trend + Date Filter`，不應提前承擔地圖、物流、評論、品類與支付分布。

### 8.1 建議 artifact 結構

```ts
type DashboardDataSource = {
  metadata: {
    source: 'olist';
    version: string;
    generatedAt: string;
    currency: 'BRL';
    timeAxis: 'order_purchase_timestamp';
    grain: 'month';
  };
  dateRanges: Array<{
    id: string;
    label: string;
    start: string;
    end: string;
  }>;
  kpisByRange: Record<
    string,
    {
      totalOrders: number;
      totalGmv: number;
    }
  >;
  monthlySeriesByRange: Record<
    string,
    Array<{
      month: string;
      label: string;
      orders: number;
      gmv: number;
    }>
  >;
};
```

### 8.2 第一版 schema 必要欄位說明

- `metadata`
  - 標記資料來源、生成時間、幣別、時間軸與粒度，便於人工核對與後續追查。
- `dateRanges`
  - 提供前端固定日期選項，不在前端自行推算區間。
- `kpisByRange`
  - 每個日期選項對應一組 KPI，第一版僅包含 `totalOrders` 與 `totalGmv`。
- `monthlySeriesByRange`
  - 每個日期選項對應一組月趨勢資料，避免前端再做二次聚合。

### 8.3 第一版 schema 明確不包含

- 成長率、MoM、QoQ、YoY
- comparison label 與 previous period 值
- customer state / product category / payment type 的真實過濾結果
- 地圖資料
- delivery 與 review 資料
- 多粒度時間序列，例如 daily / weekly

## 9. Phase 規劃

### P1：規格收斂與資料定義

- 狀態：In Progress

#### 目標

把第一階段的成功條件、指標定義、資料範圍與輸出格式鎖定，避免後續實作時一邊接資料一邊重談規則。

#### 範圍

- 定義第一版「訂單數」與「GMV」的業務規則。
- 定義日期篩選固定選項。
- 定義 artifact schema 與檔案責任邊界。
- 定義 mock / real 切換策略。

#### 不做什麼

- 不寫資料處理腳本。
- 不修改前端元件。
- 不新增自動化測試。
- 不處理其他圖表與其他篩選器真邏輯。

#### 產出物

- 本份 `P01` 規劃文件。
- [documents/implements/F01-real-data-phase1-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F01-real-data-phase1-contract.md)
- 第一版真資料接入邊界與規則定義。

#### 驗收方式

- 利害關係人可清楚回答第一版做什麼、不做什麼。
- 第一版 KPI、Time Trend、日期篩選與資料來源切換方式有明確定義。
- 後續可直接基於本文件進入下一步 DDD 收斂，而不需重談範圍。

#### 風險 / 依賴

- `GMV` 是否含運費若未先定義，後續所有核對都會失真。
- `order_status` 是否只取 `delivered` 若未先定義，KPI 會有解讀落差。
- 固定日期選項若選得太細，第一版人眼驗證成本會升高。

### P2：真資料 artifact 生成

- 狀態：Planned

#### 目標

從 Olist CSV 產出一份可供 dashboard 直接使用的中間結果檔，完成原始資料到 dashboard view model 的第一次穩定轉譯。

#### 範圍

- 讀取 `orders` 與 `order_items`，必要時輔以最小欄位清理。
- 以 `order_purchase_timestamp` 建立月序列。
- 計算每個固定日期區間的：
  - 訂單數
  - GMV
- 生成單一 artifact 檔案，供前端匯入。

#### 不做什麼

- 不把 `payments`、`reviews`、`products`、`customers`、`sellers`、`geolocation` 拉入第一版計算，除非後續實作驗證發現 KPI 定義必須依賴它們。
- 不做多檔拆分。
- 不做 API、資料庫或後端服務。
- 不做自動排程更新。

#### 產出物

- 一份真資料 artifact 檔案。
- 一份簡短的人眼核對說明，記錄 KPI 與月序列的對帳方式。

#### 驗收方式

- artifact 可被前端直接讀取。
- artifact 內容至少涵蓋一組全期間 KPI 與對應月序列。
- 抽查若干月份後，訂單數與 GMV 可與原始 CSV 聚合結果對上。

#### 風險 / 依賴

- CSV 欄位缺值、日期格式與時區處理方式需一致。
- `order_items` 與 `orders` 的 join 與去重規則若處理不當，GMV 或訂單數會失真。
- 真實資料年月分布若和 mock 設定差異太大，前端文案可能需要一起調整。

### P3：前端最小接線與雙資料源切換

- 狀態：Planned

#### 目標

在不破壞現有畫面的前提下，讓 dashboard 能切換使用真資料，且第一版只有 `KPI + Time Trend + Date Filter` 真正接上 real data。

#### 範圍

- 在程式內加入 mock / real 簡單開關。
- 讓 KPI 元件改讀真資料欄位。
- 讓 Time Trend 改讀真資料月序列。
- 讓日期篩選固定選項實際影響上述兩個區塊。
- 保留其他篩選器 UI，但仍使用 mock 邏輯或不產生真實資料效果。

#### 不做什麼

- 不重做 filter architecture。
- 不處理 map、物流、category、payment、review 區塊的真資料接線。
- 不移除 mock data。
- 不追求所有畫面文案都與真實資料語意完全對齊。

#### 產出物

- 可切換 mock / real 的 dashboard 首版接線。
- 只有日期篩選會影響真資料 KPI 與 Time Trend 的畫面版本。

#### 驗收方式

- 切到 real 模式後，KPI 與 Time Trend 顯示真實資料。
- 切換日期選項時，KPI 與 Time Trend 會同步變化。
- 其他篩選器存在但不會破壞畫面或造成誤導性錯誤。
- 切回 mock 模式後，畫面仍可正常展示。

#### 風險 / 依賴

- 現有元件可能預設依賴 mock 的 `delta`、`comparison` 或 `daily/weekly/monthly` 結構，接線時需有最小相容策略。
- 若 UI 文案過度暗示「所有篩選都有效」，需要補充提示或暫時保守處理互動行為。

### P4：人工驗證與範圍封板

- 狀態：Planned

#### 目標

在人眼可控成本內，確認第一階段資料鏈路與畫面行為可靠，並為下一輪 DDD 工作建立明確邊界。

#### 範圍

- 對帳全期間與數個指定日期區間的 KPI。
- 對帳數個月份的 orders / GMV 趨勢值。
- 驗證 mock / real 切換行為。
- 記錄第一階段已知限制與下一階段候選項。

#### 不做什麼

- 不補自動化測試。
- 不趁驗證時擴 scope 接上其他圖表。
- 不在同一輪解決所有資料品質疑問。

#### 產出物

- 第一階段驗證紀錄。
- 第一階段完成後的已知限制與下一階段輸入條件。

#### 驗收方式

- 人工核對結果可說明 KPI 與月趨勢可信。
- 團隊同意第一階段已達「最小可成功版本」。
- 已知問題被紀錄，而不是在同一輪被無限制吸收。

#### 風險 / 依賴

- 若沒有明確抽查樣本月份，人工驗證容易流於主觀。
- 若第一階段驗證時順手加入第二階段需求，容易造成 scope 爆炸。

## 10. 本階段明確不做的事

- 不做全 dashboard real data 化。
- 不做 map、delivery、category、payment、review 的真資料接線。
- 不做 customer state、product category、payment type 的真實過濾邏輯。
- 不做自由起訖日日期選擇器。
- 不做週 / 日 Time Trend。
- 不做 KPI 的成長率、前期比較值、環比或同比。
- 不做 API 層、後端服務或資料庫落地。
- 不做自動化測試與完整資料管線監控。
- 不做 mock data 移除或大規模重構。

## 11. 未來階段建議方向

以下屬於後續 phase 候選，不應在第一階段提前吸收：

### Future Phase A：擴充真實篩選維度

- 讓 customer state 真正影響 KPI 與 Time Trend。
- 決定 product category、payment type 的實際資料依賴與聚合口徑。

### Future Phase B：擴充其他故事模組

- 接地圖指標。
- 接物流與延遲分析。
- 接品類與支付分布。
- 接 review layer。

### Future Phase C：資料模型升級

- 把單一 artifact 拆成多個領域輸出。
- 補上資料生成腳本、版本策略與自動化驗證。
- 視需要引入 staging / mart 分層。

### Future Phase D：使用者體驗強化

- 補上成長率、comparison label、上一期比較邏輯。
- 支援自由日期區間。
- 重新整理 filter 狀態管理，避免 mock 與 real 混用造成語意模糊。

## 12. 各 Phase 驗收狀態定義

- `Planned`：Phase 已定義，但尚未開始執行。
- `In Progress`：Phase 已進入實作或驗證。
- `Done`：Phase 產出物完成，且已通過本文件定義的驗收方式。
- `Blocked`：Phase 因關鍵依賴、規則未定或資料品質問題暫停推進。

目前本文件中的 `P1` 已標記為 `In Progress`，`P2 / P3 / P4` 仍維持 `Planned`，待正式啟動時再逐一更新狀態。

## 13. 結論

這份規劃把「從 mock 走向 real data」收斂成一條最小但完整的鏈路：先定義規則，再生成單一 artifact，接著只讓 `KPI + Time Trend + Date Filter` 接上真資料，同時保留 mock / real 並存。這樣的切法能最快驗證資料定義、前端接線與使用者可見價值，又不會讓第一輪就背上全站資料重構的風險。

## 14. 這份 Plan 通過後，如何接續 `ddd-start`

這份 plan 通過後，下一步不是直接把整份 P01 一次做完，而是先以 `ddd-start` 針對 `P1` 進行收斂，確認第一版規則與邊界沒有歧義，再依序推進 `P2`、`P3`、`P4`。也就是說，`ddd-start` 在這裡的角色是把總規劃轉成可執行的當前階段，而不是在這份 P01 中提前指定具體工單編號。

實際操作上，可在每次進入新 phase 前，拿本文件對照以下四件事：

- 這一個 phase 的目標是否已經單獨清楚。
- 這一個 phase 的不做事項是否仍然成立。
- 這一個 phase 的驗收方式是否足夠判斷完成與否。
- 上一個 phase 的風險是否已被解除，或至少已被記錄並接受。

這樣接續的好處是，P01 會持續扮演總規劃與範圍控制文件，而 `ddd-start` 則作為每次正式啟動下一階段前的收斂入口。
