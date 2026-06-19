# Brazil Retail Story Dashboard

以 `Olist Brazilian E-Commerce` 公開資料集為核心的巴西電商敘事型分析專案。

## 專案方向

- 主軸：`地圖 + 時間 + 物流 + 評價 + 品類`
- 目標：做出一個 map-first 的 editorial dashboard
- `customer segmentation` 不再是主方向，只保留為可選附錄

## 目前資料

### 主資料夾

`data/` 目前只保留這次可用的 Olist 主資料：

- `olist_customers_dataset.csv`
- `olist_geolocation_dataset.csv`
- `olist_orders_dataset.csv`
- `olist_order_items_dataset.csv`
- `olist_order_payments_dataset.csv`
- `olist_order_reviews_dataset.csv`
- `olist_products_dataset.csv`
- `olist_sellers_dataset.csv`
- `product_category_name_translation.csv`

### 備份資料

- `backup/`：舊資料快照
- `backup.zip`：壓縮備份

## 這次資料健檢結論

目前這批資料可以直接進入 MVP 開發。

### 已確認可用

- `orders.customer_id` 全部可對到 `customers`
- `order_items.order_id` 全部可對到 `orders`
- `order_items.product_id` 全部可對到 `products`
- `order_items.seller_id` 全部可對到 `sellers`
- `payments.order_id` 與 `reviews.order_id` 幾乎完整可對到 `orders`
- 訂單時間範圍完整，涵蓋 `2016-09-04` 到 `2018-10-17`

### 目前存在但可接受的小問題

- `products` 有 `610` 筆沒有 `product_category_name`
- 品類翻譯表少了 `2` 個品類：`pc_gamer`、`portateis_cozinha_e_preparadores_de_alimentos`
- `geolocation` 少覆蓋 `157` 個 customer zip prefix
- `payments` 少 `1` 張訂單的付款紀錄
- `orders` 裡有 `8` 筆 `delivered` 訂單缺少 `order_delivered_customer_date`

這些都屬於可以在清理層處理的範圍，不會阻止第一版 dashboard 製作。

## 建議下一步

1. 建立 `data/processed/`
2. 先做 `orders_enriched` 清理表
3. 產出州別、月別、品類別的 mart
4. 再開始 dashboard 或 Figma 細化

## 文件

- 規劃文件：`docs/Brazil_Retail_Story_Dashboard_Plan.md`
## Current Dashboard Coverage

- `Date Range`, `Customer State`, and `Product Category` now define the active global cohort for KPI Cards, Time Trend, payment-aware panels, and Delay vs Review.
- `Payment Type` remains a secondary slice. It only changes `On-time vs Delayed`, `Freight Distribution`, and `Payment Mix` inside the selected global cohort.
- `Category Share` uses focused-mode disclosure when `Product Category` is selected. The full ranking stays visible and the chosen category is highlighted.
- `Brazil Map` keeps range-scoped state metrics. `Customer State` uses focused-state handling there, while `Product Category` is intentionally not applied on the map.
- Daily and weekly Time Trend views are still explicit projections derived from the real monthly artifact.
