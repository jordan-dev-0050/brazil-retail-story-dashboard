# Brazil Retail Story Dashboard Plan

## 1. 目前方向

這個專案已正式轉向 `Olist Brazilian E-Commerce` 敘事型儀表板。

核心問題：

- 巴西各州與城市的訂單分布如何
- 哪些地區有物流延遲與履約摩擦
- 哪些品類與付款方式驅動不同區域的電商表現
- 評價、運費與交付時間之間的關係是什麼

## 2. 目前可用資料

### Active data

| File | Rows | 用途 |
| --- | ---: | --- |
| `olist_customers_dataset.csv` | 99,441 | 客戶城市 / 州別 |
| `olist_geolocation_dataset.csv` | 1,000,163 | zip prefix 經緯度 |
| `olist_orders_dataset.csv` | 99,441 | 訂單生命週期 |
| `olist_order_items_dataset.csv` | 112,650 | 商品價格與運費 |
| `olist_order_payments_dataset.csv` | 103,886 | 付款方式與金額 |
| `olist_order_reviews_dataset.csv` | 99,224 | 評價分數與評論時間 |
| `olist_products_dataset.csv` | 32,951 | 商品品類與體積資訊 |
| `olist_sellers_dataset.csv` | 3,095 | 賣家空間分布 |
| `product_category_name_translation.csv` | 71 | 品類翻譯 |

### Backup only

舊 mock 資料已不放在 `data/`，只保留在 `backup/` 供追溯。

## 3. 資料健檢摘要

這批資料目前可用，適合直接進入 MVP 製作。

### 關聯完整度

- `orders -> customers`：正常
- `order_items -> orders`：正常
- `order_items -> products`：正常
- `order_items -> sellers`：正常
- `payments -> orders`：只有 1 張訂單缺付款紀錄
- `reviews -> orders`：正常

### 已知瑕疵

- `610` 筆 product 缺少 `product_category_name`
- `2` 個品類沒有英譯
- `157` 個 customer zip prefix 在 geolocation 中找不到
- `8` 筆 `delivered` 訂單缺少 `order_delivered_customer_date`

結論：這些問題都屬於清理規則可處理的範圍，不影響 dashboard 主題成立。

## 4. MVP 要回答的問題

1. 訂單與營收集中在哪些州與城市？
2. 哪些地區延遲交付最嚴重？
3. 運費壓力是否和低評價一起出現？
4. 哪些州的主力品類最不同？
5. 2016-2018 間是否存在明顯時間波動？

## 5. MVP 畫面模組

### Page 1: National Story View

- Hero title
- Brazil map
- KPI row
- Time trend
- Region story panel
- Editorial insight cards

### Page 2: Logistics and Delivery

- Delivery delay map
- On-time vs delayed comparison
- Freight distribution
- Delay vs review relationship

### Page 3: Category and Commerce Mix

- Category share by state
- Top categories over time
- Seller state vs customer state
- Payment type distribution

### Page 4: Review Layer

- Review score distribution
- Low-score clusters
- Comment density over time
- Optional segmentation appendix

## 6. 建議資料模型

### Staging

- `stg_orders`
- `stg_order_items`
- `stg_payments`
- `stg_reviews`
- `stg_customers`
- `stg_products`
- `stg_sellers`
- `stg_geolocation`

### Mart

- `fct_order_line`
- `mart_state_month_metrics`
- `mart_delivery_performance`
- `mart_category_state_metrics`
- `mart_review_geo_metrics`
- `mart_payment_mix`

### 關鍵衍生欄位

- `delivery_days`
- `is_late_delivery`
- `order_gmv`
- `freight_ratio`
- `review_bucket`
- `purchase_month`
- `customer_state`
- `seller_state`

## 7. 接下來的實作順序

1. 清理 Olist 原始資料
2. 建立 `orders_enriched`
3. 產出州別 / 月別 / 品類 mart
4. 開始 dashboard 規劃與實作
