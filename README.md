# MongoDB Exercise 1 — n_layer JSON → MongoDB

Chuyển tầng lưu trữ của bài **n-layer CRUD Products** từ file JSON sang **MongoDB**, dùng official `mongodb` driver. API contract, validate và mã trạng thái giữ nguyên như bài n-layer.

## Yêu cầu môi trường

- Node.js >= 18
- MongoDB Server đang chạy (mặc định `mongodb://127.0.0.1:27017`)

## Cài đặt

```bash
npm install
cp .env.example .env
```

Sửa `.env` nếu MongoDB chạy ở địa chỉ khác:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=crud_products_db
```

## Chuyển dữ liệu và chạy server

```bash
# Chuyển products từ database.json sang MongoDB
npm run migrate

# Chạy server
npm start
```

`migrate` sẽ xoá dữ liệu cũ trong collection `products` và `counters` của database đã cấu hình, sau đó nạp lại 2 sản phẩm mẫu từ `database.json`. Không chạy migrate trên database đang có dữ liệu thật.

## API

Tất cả route dưới `/products`. Các route ghi cần header:

```text
Authorization: Bearer demo-token
```

| Method | Path | Mô tả | Mã thành công |
|---|---|---|---|
| GET | `/products` | Danh sách sản phẩm; hỗ trợ `?limit=` | 200 |
| GET | `/products/:id` | Lấy một sản phẩm | 200 / 404 |
| POST | `/products` | Tạo sản phẩm | 201 / 400 / 401 |
| PUT | `/products/:id` | Thay toàn bộ sản phẩm | 200 / 400 / 401 / 404 |
| PATCH | `/products/:id` | Cập nhật một phần | 200 / 400 / 401 / 404 |
| DELETE | `/products/:id` | Xoá sản phẩm | 204 / 401 / 404 |

`limit` phải là số nguyên không âm; `limit=0` trả mảng rỗng; `limit` không hợp lệ trả `400`.

## Cấu trúc

```text
server.js             # khởi động, connect MongoDB trước khi listen
router.js             # route + method
controller.js         # đọc body, validate, trả response
middleware.js         # JSON body, token, response helpers
repository.js         # CRUD trên collection products
mongo-data-source.js  # MongoClient: connect / getDb / close
migrate.js            # database.json → MongoDB
database.json         # dữ liệu seed
```

## Ghi chú

- `_id` của MongoDB được ẩn khỏi response; API vẫn dùng `id` số.
- ID mới lấy từ collection `counters` (`productId`), không cấp lại sau khi xoá.
- Không commit file `.env`.