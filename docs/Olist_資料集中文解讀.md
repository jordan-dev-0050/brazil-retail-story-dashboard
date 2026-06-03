# Olist 資料集中文解讀

## 1. 這份文件在幹嘛

這份文件用來幫你重新認識目前專案使用的 `data/` 原始資料。重點不是先做技術串接，而是先回答三件事：

1. 每一份資料集在業務上代表什麼
2. 每一份資料集應該怎麼和別張表一起看
3. 解讀時有哪些限制、陷阱、容易誤判的地方

目前專案使用的是 `Olist Brazilian E-Commerce` 公開資料集，適合拿來講巴西電商的訂單、物流、品類、付款與評論故事。

## 2. 先建立整體概念

如果把這批資料想成一個電商流程，可以用下面這條線理解：

`customers` 下單 -> `orders` 形成訂單 -> `order_items` 展開成商品明細 -> `products` 補商品資訊 -> `sellers` 補賣家資訊 -> `order_payments` 看怎麼付款 -> `order_reviews` 看收貨後評價

地理資訊則分兩層：

- `customers` / `sellers` 提供 zip code prefix、城市、州
- `geolocation` 提供 zip code prefix 對應的經緯度

品類翻譯則由：

- `products.product_category_name`
- 對照 `product_category_name_translation`

## 3. 資料集總覽

| 檔案 | 代表意義 | 主要粒度 | 常見用途 |
| --- | --- | --- | --- |
| `olist_customers_dataset.csv` | 客戶基本資料 | 1 筆 = 1 個 customer_id | 看客戶城市、州、郵遞區號前綴 |
| `olist_orders_dataset.csv` | 訂單主表 | 1 筆 = 1 張訂單 | 看訂單狀態、下單時間、配送時間 |
| `olist_order_items_dataset.csv` | 訂單商品明細 | 1 筆 = 1 張訂單中的 1 個商品項目 | 算 GMV、運費、品類組合 |
| `olist_products_dataset.csv` | 商品屬性表 | 1 筆 = 1 個 product_id | 看品類、重量、尺寸、照片數 |
| `olist_sellers_dataset.csv` | 賣家資料 | 1 筆 = 1 個 seller_id | 看賣家地區分布 |
| `olist_order_payments_dataset.csv` | 付款紀錄 | 1 筆 = 1 次付款分段 | 看付款方式、分期數、付款金額 |
| `olist_order_reviews_dataset.csv` | 訂單評論 | 1 筆 = 1 則評論 | 看滿意度、文字評論、評分分布 |
| `olist_geolocation_dataset.csv` | 郵遞區號對應經緯度 | 1 筆 = 1 組 zip prefix 與座標觀測 | 畫地圖、做地理聚合 |
| `product_category_name_translation.csv` | 品類翻譯表 | 1 筆 = 1 個葡文品類 | 把品類名稱轉成英文或後續中文標籤 |

## 4. 每一份資料怎麼看

### 4.1 `olist_customers_dataset.csv`

這張表是客戶定位表，不是會員完整主檔。它主要告訴你某筆訂單所屬客戶的大致地理位置。

重要欄位：

- `customer_id`：訂單表會用這個欄位連過來
- `customer_unique_id`：同一個真實客戶的跨訂單識別碼
- `customer_zip_code_prefix`：郵遞區號前綴，常拿來接地理資料
- `customer_city`
- `customer_state`

解讀重點：

- `customer_id` 比較像「訂單客戶實例」，`customer_unique_id` 才比較像「同一個人」
- 如果你要算回購、客戶數、留存，應優先用 `customer_unique_id`
- 如果你只是把訂單對到地區，通常用 `customer_id` 接 `orders` 就夠了

常見誤區：

- 直接把 `customer_id` 當成不重複客戶數，會高估客戶量
- 城市名稱是原始文字，拼法可能不完全一致，不適合直接做高精度城市層級分析

### 4.2 `olist_orders_dataset.csv`

這張表是整個分析的核心。它記錄每張訂單從下單到交付的時間軸，以及訂單最終狀態。

重要欄位：

- `order_id`：訂單主鍵
- `customer_id`：連到客戶表
- `order_status`：訂單狀態
- `order_purchase_timestamp`：下單時間
- `order_approved_at`：付款核准時間
- `order_delivered_carrier_date`：交給物流時間
- `order_delivered_customer_date`：客戶收到貨時間
- `order_estimated_delivery_date`：系統預估送達時間

解讀重點：

- 做時間趨勢時，多數情境用 `order_purchase_timestamp`
- 做物流表現時，要比較 `order_delivered_customer_date` 和 `order_estimated_delivery_date`
- 做訂單漏斗或完成率時，要先明確定義是否只看 `delivered`

常見分析指標：

- 訂單量
- 已完成訂單率
- 平均配送天數
- 延遲送達率

常見誤區：

- 並不是所有訂單都有完整配送時間
- `order_status != delivered` 的訂單不適合直接拿去算配送天數
- 預估到貨日是日期，實際到貨是時間戳，計算延誤時要先統一規則

### 4.3 `olist_order_items_dataset.csv`

這張表把一張訂單拆成多個商品項目，是營收、品類、運費分析最重要的明細層。

重要欄位：

- `order_id`：連到訂單
- `order_item_id`：同一張訂單中的第幾個商品項
- `product_id`：連到商品表
- `seller_id`：連到賣家表
- `shipping_limit_date`：賣家出貨期限
- `price`：商品售價
- `freight_value`：該商品項目的運費

解讀重點：

- 一張訂單可能有多個 item，所以用它算金額時會比 `orders` 更細
- `price + freight_value` 常可視為該商品項目的總支付貢獻
- 若要算 GMV，通常先以 `order_items` 聚合到訂單或月份層級

常見分析指標：

- GMV
- 平均客單商品數
- 平均運費
- 各品類營收占比

常見誤區：

- 直接用 `orders` 算金額會缺少商品級明細
- `order_id` 在這張表不是唯一值
- `payment_value` 和 `order_items` 加總金額不一定完全相等，因為兩張表的商業意義不同，還可能有分期、拆單或其他記錄差異

### 4.4 `olist_products_dataset.csv`

這張表提供商品的靜態屬性，特別適合做品類、包裹體積、重量對物流與評論的影響分析。

重要欄位：

- `product_id`
- `product_category_name`
- `product_name_lenght`
- `product_description_lenght`
- `product_photos_qty`
- `product_weight_g`
- `product_length_cm`
- `product_height_cm`
- `product_width_cm`

解讀重點：

- 最常用的是 `product_category_name`
- 重量和尺寸可以幫助解釋高運費、配送慢、低評論等現象
- 文字長度與照片數量可作為商品資訊豐富度的弱訊號

常見誤區：

- 欄位名裡的 `lenght` 是原始資料拼字，不是你的程式打錯
- 有些商品缺少品類或尺寸資料，做視覺化前要先決定如何處理缺值

### 4.5 `olist_sellers_dataset.csv`

這張表是賣家定位表，幫你回答「貨從哪裡出來」。

重要欄位：

- `seller_id`
- `seller_zip_code_prefix`
- `seller_city`
- `seller_state`

解讀重點：

- 接上 `order_items` 之後，可以看賣家州別分布
- 很適合拿來做「賣家在哪裡、客戶在哪裡」的對照故事
- 如果賣家集中在少數州，通常會影響配送時效與物流成本

常見誤區：

- 這不是商家經營績效表，本身沒有營收欄位，要和 `order_items` 連接後才有商業指標

### 4.6 `olist_order_payments_dataset.csv`

這張表是付款紀錄表，用來看消費者怎麼付錢，以及是否使用分期。

重要欄位：

- `order_id`
- `payment_sequential`：同一筆訂單中的第幾段付款
- `payment_type`：例如 `credit_card`、`boleto`、`voucher`
- `payment_installments`：分期期數
- `payment_value`

解讀重點：

- 同一張訂單可能不只一筆付款紀錄
- 分析付款方式占比時，要先決定你是用「付款筆數」還是「付款金額」
- 分析信用卡分期行為時，這張表很關鍵

常見誤區：

- 直接把這張表的列數當成訂單數，會重複計算
- `payment_value` 適合做支付金額觀察，但不一定等於單純商品價格

### 4.7 `olist_order_reviews_dataset.csv`

這張表是訂單評價表，用來分析滿意度與口碑。

重要欄位：

- `review_id`
- `order_id`
- `review_score`：通常 1 到 5 分
- `review_comment_title`
- `review_comment_message`
- `review_creation_date`
- `review_answer_timestamp`

解讀重點：

- 最常用欄位是 `review_score`
- 可以把低分評論和延遲配送、運費高、特定州別或特定品類連起來看
- 有些評論沒有文字，只有分數

常見誤區：

- 評論時間不是下單時間，也不是送達時間，做時間分析時要先講清楚你看的時間軸
- 一張訂單的評論不一定能精準歸因到某個商品項，因為評論通常是訂單層級

### 4.8 `olist_geolocation_dataset.csv`

這張表是地理座標對照資料，讓你可以把 zip code prefix 轉成地圖上的點。

重要欄位：

- `geolocation_zip_code_prefix`
- `geolocation_lat`
- `geolocation_lng`
- `geolocation_city`
- `geolocation_state`

解讀重點：

- 這張表筆數很多，因為同一個 zip prefix 可能出現多筆觀測
- 如果是做 dashboard，通常要先聚合，例如每個 zip prefix 取平均座標或最常見州別
- 常用來補 `customers` 和 `sellers` 的經緯度

常見誤區：

- 不能假設 zip prefix 唯一對應單一座標
- 不先聚合就直接 join，資料筆數會被放大

### 4.9 `product_category_name_translation.csv`

這張表是品類翻譯對照表，把葡文品類翻成英文，方便後續做更容易理解的標籤。

重要欄位：

- `product_category_name`
- `product_category_name_english`

解讀重點：

- 要先接 `products` 才能影響到 `order_items` 的品類分析
- 如果你要做中文 dashboard，這張表可以再延伸一層做「英文 -> 中文」映射

常見誤區：

- 這張表不是完整商業分類體系，只是名稱翻譯對照

## 5. 建議的 join 順序

如果你要重新開始整理真實資料，建議先用這個順序組裝：

1. `orders` 接 `customers`
2. `order_items` 接 `orders`
3. `order_items` 接 `products`
4. `order_items` 接 `sellers`
5. `order_payments` 接 `orders`
6. `order_reviews` 接 `orders`
7. `customers` / `sellers` 再視需要接 `geolocation`
8. `products` 接 `product_category_name_translation`

最重要的觀念：

- `orders` 是訂單主表
- `order_items` 是金額與品類的明細表
- `payments` 和 `reviews` 都是訂單附屬表
- `geolocation` 是地圖輔助表，不要一開始就粗暴 join

## 6. 做 dashboard 時最值得先講的故事

這批資料很適合先做以下幾條敘事線：

1. 哪些州買得多，哪些州賣得多
2. 哪些品類最能帶動銷售額
3. 配送延遲和評論低分是否有關
4. 高運費是否集中在特定地區或特定品類
5. 付款方式是否反映消費行為差異

## 7. 重新開始時的資料處理提醒

如果你現在要把「接真實資料」重做一次，建議先不要急著把所有表一次串到底，而是分三層：

1. 原始層：保留 `data/` 原始 CSV，不改內容
2. 整理層：先做乾淨的 staging，例如時間格式、欄位命名、缺值處理
3. 分析層：再做給 dashboard 用的聚合表，例如州別月趨勢、配送表現、品類占比

這樣的好處是：

- 問題比較容易除錯
- 每張圖背後的來源比較清楚
- 之後改指標定義時，不用全部重做

## 8. 給你下一步的建議

如果你要重來，我建議先做這三件事：

1. 先把 `orders`、`customers`、`order_items` 三張表整理好
2. 先定義 5 到 8 個核心指標，例如訂單量、GMV、平均配送天數、延遲率、平均評分
3. 等主故事穩了，再補 `payments`、`reviews`、`geolocation`

這樣比較不會一開始就卡在資料 join 太複雜。
