# 📁 Cấu Trúc Thư Mục & Tổ Chức Database - Hệ Thống Bán Đồ Dùng Thể Thao

## 📋 Mục Lục
- [Tổng Quan](#tổng-quan)
- [Cấu Trúc Thư Mục Theo Microservices](#cấu-trúc-thư-mục-theo-microservices)
- [Chi Tiết Từng Service](#chi-tiết-từng-service)
- [Use Cases & Chức Năng](#use-cases--chức-năng)
- [Database Organization](#database-organization)
- [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Hệ thống được tổ chức theo kiến trúc **Microservices** với pattern **Database per Service**. Mỗi service có:
- Database riêng
- API endpoints riêng
- Business logic riêng
- Use cases riêng

---

## 📂 Cấu Trúc Thư Mục Theo Microservices

```
sports-ecommerce/
│
├── services/                          # Tất cả các microservices
│   │
│   ├── auth-service/                  # 🔐 Auth Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # Kết nối auth_db
│   │   │   │   └── env.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts            # User model
│   │   │   │   └── Session.ts         # Session model
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts     # Validation schemas
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── user.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── email.service.ts
│   │   │   ├── usecases/              # Use cases
│   │   │   │   ├── register.usecase.ts
│   │   │   │   ├── login.usecase.ts
│   │   │   │   ├── logout.usecase.ts
│   │   │   │   ├── refresh-token.usecase.ts
│   │   │   │   ├── forgot-password.usecase.ts
│   │   │   │   ├── reset-password.usecase.ts
│   │   │   │   └── verify-email.usecase.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── validation.middleware.ts
│   │   │   ├── utils/
│   │   │   │   ├── jwt.util.ts
│   │   │   │   └── bcrypt.util.ts
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── product-service/               # 📦 Product Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # Kết nối product_db
│   │   │   │   └── env.ts
│   │   │   ├── models/
│   │   │   │   ├── Product.ts         # Product model
│   │   │   │   └── Category.ts        # Category model
│   │   │   ├── schemas/
│   │   │   │   ├── product.schema.ts
│   │   │   │   └── category.schema.ts
│   │   │   ├── controllers/
│   │   │   │   ├── product.controller.ts
│   │   │   │   └── category.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── product.service.ts
│   │   │   │   └── category.service.ts
│   │   │   ├── usecases/
│   │   │   │   ├── create-product.usecase.ts
│   │   │   │   ├── update-product.usecase.ts
│   │   │   │   ├── delete-product.usecase.ts
│   │   │   │   ├── get-product.usecase.ts
│   │   │   │   ├── search-products.usecase.ts
│   │   │   │   ├── filter-products.usecase.ts
│   │   │   │   ├── create-category.usecase.ts
│   │   │   │   └── update-category.usecase.ts
│   │   │   ├── repositories/
│   │   │   │   ├── product.repository.ts
│   │   │   │   └── category.repository.ts
│   │   │   ├── routes/
│   │   │   │   └── product.routes.ts
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── order-service/                 # 🛒 Order Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # Kết nối order_db
│   │   │   │   └── env.ts
│   │   │   ├── models/
│   │   │   │   ├── Order.ts           # Order model
│   │   │   │   ├── Cart.ts            # Cart model
│   │   │   │   └── Address.ts         # Address model
│   │   │   ├── schemas/
│   │   │   │   ├── order.schema.ts
│   │   │   │   └── cart.schema.ts
│   │   │   ├── controllers/
│   │   │   │   ├── order.controller.ts
│   │   │   │   ├── cart.controller.ts
│   │   │   │   └── address.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── order.service.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   └── address.service.ts
│   │   │   ├── usecases/
│   │   │   │   ├── create-order.usecase.ts
│   │   │   │   ├── update-order-status.usecase.ts
│   │   │   │   ├── cancel-order.usecase.ts
│   │   │   │   ├── get-orders.usecase.ts
│   │   │   │   ├── add-to-cart.usecase.ts
│   │   │   │   ├── update-cart.usecase.ts
│   │   │   │   ├── remove-from-cart.usecase.ts
│   │   │   │   ├── clear-cart.usecase.ts
│   │   │   │   ├── add-address.usecase.ts
│   │   │   │   └── update-address.usecase.ts
│   │   │   ├── routes/
│   │   │   │   └── order.routes.ts
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── payment-service/               # 💳 Payment Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # Kết nối payment_db
│   │   │   │   └── env.ts
│   │   │   ├── models/
│   │   │   │   ├── Payment.ts         # Payment model
│   │   │   │   └── Coupon.ts          # Coupon model
│   │   │   ├── schemas/
│   │   │   │   ├── payment.schema.ts
│   │   │   │   └── coupon.schema.ts
│   │   │   ├── controllers/
│   │   │   │   ├── payment.controller.ts
│   │   │   │   └── coupon.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── coupon.service.ts
│   │   │   │   └── gateway.service.ts # VNPay, MoMo, etc.
│   │   │   ├── usecases/
│   │   │   │   ├── process-payment.usecase.ts
│   │   │   │   ├── refund-payment.usecase.ts
│   │   │   │   ├── apply-coupon.usecase.ts
│   │   │   │   ├── validate-coupon.usecase.ts
│   │   │   │   └── create-coupon.usecase.ts
│   │   │   ├── routes/
│   │   │   │   └── payment.routes.ts
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── review-service/                # ⭐ Review Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts        # Kết nối review_db
│   │   │   │   └── env.ts
│   │   │   ├── models/
│   │   │   │   ├── Review.ts          # Review model
│   │   │   │   └── Wishlist.ts        # Wishlist model
│   │   │   ├── schemas/
│   │   │   │   ├── review.schema.ts
│   │   │   │   └── wishlist.schema.ts
│   │   │   ├── controllers/
│   │   │   │   ├── review.controller.ts
│   │   │   │   └── wishlist.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── review.service.ts
│   │   │   │   └── wishlist.service.ts
│   │   │   ├── usecases/
│   │   │   │   ├── create-review.usecase.ts
│   │   │   │   ├── update-review.usecase.ts
│   │   │   │   ├── approve-review.usecase.ts
│   │   │   │   ├── get-reviews.usecase.ts
│   │   │   │   ├── mark-helpful.usecase.ts
│   │   │   │   ├── add-to-wishlist.usecase.ts
│   │   │   │   └── remove-from-wishlist.usecase.ts
│   │   │   ├── routes/
│   │   │   │   └── review.routes.ts
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── .env
│   │   └── package.json
│   │
│   └── notification-service/          # 🔔 Notification Service
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts        # Kết nối notification_db
│       │   │   └── env.ts
│       │   ├── models/
│       │   │   └── Notification.ts    # Notification model
│       │   ├── schemas/
│       │   │   └── notification.schema.ts
│       │   ├── controllers/
│       │   │   └── notification.controller.ts
│       │   ├── services/
│       │   │   ├── notification.service.ts
│       │   │   └── email.service.ts
│       │   ├── usecases/
│       │   │   ├── send-notification.usecase.ts
│       │   │   ├── mark-read.usecase.ts
│       │   │   ├── get-notifications.usecase.ts
│       │   │   └── send-email.usecase.ts
│       │   ├── routes/
│       │   │   └── notification.routes.ts
│       │   └── app.ts
│       ├── tests/
│       ├── .env
│       └── package.json
│
├── shared/                            # Code dùng chung
│   ├── types/                         # TypeScript types
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── common.types.ts
│   ├── utils/                         # Utilities
│   │   ├── logger.util.ts
│   │   ├── error-handler.util.ts
│   │   └── validator.util.ts
│   ├── constants/                     # Constants
│   │   ├── status-codes.ts
│   │   └── error-messages.ts
│   └── middleware/                    # Shared middleware
│       ├── error.middleware.ts
│       └── rate-limit.middleware.ts
│
├── api-gateway/                       # 🌐 API Gateway
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── app.ts
│   └── package.json
│
├── docker-compose.yml                 # Docker compose cho tất cả services
├── .env.example                       # Environment variables template
└── README.md
```

---

## 🔍 Chi Tiết Từng Service

### 1. 🔐 Auth Service (`auth-service/`)

**Database:** `auth_db`

**Collections:**
- `users` - Thông tin người dùng
- `sessions` - Phiên đăng nhập (optional)

**Chức năng chính:**
- Đăng ký tài khoản
- Đăng nhập/Đăng xuất
- Quản lý JWT tokens
- Xác thực email
- Reset mật khẩu
- Quản lý user profile

**Use Cases:**
```
usecases/
├── register.usecase.ts          # Đăng ký tài khoản mới
├── login.usecase.ts             # Đăng nhập
├── logout.usecase.ts            # Đăng xuất
├── refresh-token.usecase.ts     # Làm mới access token
├── forgot-password.usecase.ts   # Yêu cầu reset mật khẩu
├── reset-password.usecase.ts    # Đặt lại mật khẩu
└── verify-email.usecase.ts      # Xác thực email
```

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/verify-email/:token`

---

### 2. 📦 Product Service (`product-service/`)

**Database:** `product_db`

**Collections:**
- `products` - Sản phẩm
- `categories` - Danh mục sản phẩm

**Chức năng chính:**
- CRUD sản phẩm
- Quản lý danh mục
- Tìm kiếm và lọc sản phẩm
- Quản lý tồn kho
- Quản lý hình ảnh sản phẩm

**Use Cases:**
```
usecases/
├── create-product.usecase.ts    # Tạo sản phẩm mới (Admin)
├── update-product.usecase.ts    # Cập nhật sản phẩm (Admin)
├── delete-product.usecase.ts    # Xóa sản phẩm (Admin)
├── get-product.usecase.ts       # Lấy chi tiết sản phẩm
├── search-products.usecase.ts   # Tìm kiếm sản phẩm
├── filter-products.usecase.ts   # Lọc sản phẩm
├── create-category.usecase.ts   # Tạo danh mục (Admin)
└── update-category.usecase.ts   # Cập nhật danh mục (Admin)
```

**API Endpoints:**
- `GET /api/products` - Danh sách sản phẩm (có filter, pagination)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)
- `GET /api/categories` - Danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Admin)

---

### 3. 🛒 Order Service (`order-service/`)

**Database:** `order_db`

**Collections:**
- `orders` - Đơn hàng
- `cart` - Giỏ hàng
- `addresses` - Địa chỉ giao hàng

**Chức năng chính:**
- Quản lý giỏ hàng
- Tạo và quản lý đơn hàng
- Theo dõi trạng thái đơn hàng
- Quản lý địa chỉ giao hàng
- Hủy đơn hàng

**Use Cases:**
```
usecases/
├── create-order.usecase.ts          # Tạo đơn hàng từ giỏ hàng
├── update-order-status.usecase.ts   # Cập nhật trạng thái đơn hàng
├── cancel-order.usecase.ts          # Hủy đơn hàng
├── get-orders.usecase.ts            # Lấy danh sách đơn hàng
├── add-to-cart.usecase.ts           # Thêm sản phẩm vào giỏ hàng
├── update-cart.usecase.ts           # Cập nhật giỏ hàng
├── remove-from-cart.usecase.ts      # Xóa sản phẩm khỏi giỏ hàng
├── clear-cart.usecase.ts            # Xóa toàn bộ giỏ hàng
├── add-address.usecase.ts           # Thêm địa chỉ
└── update-address.usecase.ts        # Cập nhật địa chỉ
```

**API Endpoints:**
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `PUT /api/cart/update/:itemId` - Cập nhật giỏ hàng
- `DELETE /api/cart/remove/:itemId` - Xóa khỏi giỏ hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng
- `GET /api/addresses` - Danh sách địa chỉ
- `POST /api/addresses` - Thêm địa chỉ

---

### 4. 💳 Payment Service (`payment-service/`)

**Database:** `payment_db`

**Collections:**
- `payments` - Thanh toán
- `coupons` - Mã giảm giá

**Chức năng chính:**
- Xử lý thanh toán
- Quản lý mã giảm giá
- Hoàn tiền
- Tích hợp payment gateway (VNPay, MoMo, etc.)

**Use Cases:**
```
usecases/
├── process-payment.usecase.ts    # Xử lý thanh toán
├── refund-payment.usecase.ts     # Hoàn tiền
├── apply-coupon.usecase.ts       # Áp dụng mã giảm giá
├── validate-coupon.usecase.ts    # Kiểm tra mã giảm giá
└── create-coupon.usecase.ts      # Tạo mã giảm giá (Admin)
```

**API Endpoints:**
- `POST /api/payments` - Tạo thanh toán
- `POST /api/payments/:id/refund` - Hoàn tiền
- `POST /api/coupons/apply` - Áp dụng mã giảm giá
- `GET /api/coupons/:code` - Kiểm tra mã giảm giá
- `POST /api/coupons` - Tạo mã giảm giá (Admin)

---

### 5. ⭐ Review Service (`review-service/`)

**Database:** `review_db`

**Collections:**
- `reviews` - Đánh giá sản phẩm
- `wishlist` - Danh sách yêu thích

**Chức năng chính:**
- Tạo và quản lý đánh giá
- Quản lý wishlist
- Phê duyệt đánh giá (Admin)
- Đánh dấu đánh giá hữu ích

**Use Cases:**
```
usecases/
├── create-review.usecase.ts          # Tạo đánh giá
├── update-review.usecase.ts          # Cập nhật đánh giá
├── approve-review.usecase.ts         # Phê duyệt đánh giá (Admin)
├── get-reviews.usecase.ts            # Lấy danh sách đánh giá
├── mark-helpful.usecase.ts           # Đánh dấu hữu ích
├── add-to-wishlist.usecase.ts        # Thêm vào wishlist
└── remove-from-wishlist.usecase.ts   # Xóa khỏi wishlist
```

**API Endpoints:**
- `POST /api/reviews` - Tạo đánh giá
- `GET /api/products/:productId/reviews` - Lấy đánh giá sản phẩm
- `POST /api/reviews/:id/helpful` - Đánh dấu hữu ích
- `GET /api/wishlist` - Lấy wishlist
- `POST /api/wishlist/add` - Thêm vào wishlist
- `DELETE /api/wishlist/remove/:productId` - Xóa khỏi wishlist

---

### 6. 🔔 Notification Service (`notification-service/`)

**Database:** `notification_db`

**Collections:**
- `notifications` - Thông báo

**Chức năng chính:**
- Gửi thông báo
- Quản lý thông báo người dùng
- Gửi email thông báo
- Push notifications (future)

**Use Cases:**
```
usecases/
├── send-notification.usecase.ts  # Gửi thông báo
├── mark-read.usecase.ts          # Đánh dấu đã đọc
├── get-notifications.usecase.ts  # Lấy danh sách thông báo
└── send-email.usecase.ts         # Gửi email
```

**API Endpoints:**
- `GET /api/notifications` - Lấy danh sách thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `PUT /api/notifications/read-all` - Đánh dấu tất cả đã đọc

---

## 🎯 Use Cases & Chức Năng

### Use Case Pattern

Mỗi use case là một file riêng biệt, tuân theo pattern:

```typescript
// Example: create-order.usecase.ts
export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productService: ProductServiceClient,
    private paymentService: PaymentServiceClient,
    private notificationService: NotificationServiceClient
  ) {}

  async execute(userId: string, orderData: CreateOrderDTO): Promise<Order> {
    // 1. Validate cart items
    // 2. Check stock availability
    // 3. Calculate totals
    // 4. Apply coupon
    // 5. Create order
    // 6. Reduce stock
    // 7. Clear cart
    // 8. Create payment
    // 9. Send notification
    // 10. Return order
  }
}
```

### Use Cases theo Service

#### Auth Service Use Cases
1. **Register Use Case**: Đăng ký tài khoản mới
2. **Login Use Case**: Đăng nhập và tạo tokens
3. **Logout Use Case**: Đăng xuất và invalidate tokens
4. **Refresh Token Use Case**: Làm mới access token
5. **Forgot Password Use Case**: Yêu cầu reset mật khẩu
6. **Reset Password Use Case**: Đặt lại mật khẩu
7. **Verify Email Use Case**: Xác thực email

#### Product Service Use Cases
1. **Create Product Use Case**: Tạo sản phẩm mới (Admin)
2. **Update Product Use Case**: Cập nhật sản phẩm (Admin)
3. **Delete Product Use Case**: Xóa sản phẩm (Admin)
4. **Get Product Use Case**: Lấy chi tiết sản phẩm
5. **Search Products Use Case**: Tìm kiếm sản phẩm
6. **Filter Products Use Case**: Lọc sản phẩm theo điều kiện
7. **Create Category Use Case**: Tạo danh mục (Admin)
8. **Update Category Use Case**: Cập nhật danh mục (Admin)

#### Order Service Use Cases
1. **Create Order Use Case**: Tạo đơn hàng từ giỏ hàng
2. **Update Order Status Use Case**: Cập nhật trạng thái đơn hàng
3. **Cancel Order Use Case**: Hủy đơn hàng
4. **Get Orders Use Case**: Lấy danh sách đơn hàng
5. **Add to Cart Use Case**: Thêm sản phẩm vào giỏ hàng
6. **Update Cart Use Case**: Cập nhật số lượng trong giỏ hàng
7. **Remove from Cart Use Case**: Xóa sản phẩm khỏi giỏ hàng
8. **Clear Cart Use Case**: Xóa toàn bộ giỏ hàng
9. **Add Address Use Case**: Thêm địa chỉ giao hàng
10. **Update Address Use Case**: Cập nhật địa chỉ

#### Payment Service Use Cases
1. **Process Payment Use Case**: Xử lý thanh toán
2. **Refund Payment Use Case**: Hoàn tiền
3. **Apply Coupon Use Case**: Áp dụng mã giảm giá
4. **Validate Coupon Use Case**: Kiểm tra mã giảm giá hợp lệ
5. **Create Coupon Use Case**: Tạo mã giảm giá (Admin)

#### Review Service Use Cases
1. **Create Review Use Case**: Tạo đánh giá sản phẩm
2. **Update Review Use Case**: Cập nhật đánh giá
3. **Approve Review Use Case**: Phê duyệt đánh giá (Admin)
4. **Get Reviews Use Case**: Lấy danh sách đánh giá
5. **Mark Helpful Use Case**: Đánh dấu đánh giá hữu ích
6. **Add to Wishlist Use Case**: Thêm vào danh sách yêu thích
7. **Remove from Wishlist Use Case**: Xóa khỏi danh sách yêu thích

#### Notification Service Use Cases
1. **Send Notification Use Case**: Gửi thông báo
2. **Mark Read Use Case**: Đánh dấu đã đọc
3. **Get Notifications Use Case**: Lấy danh sách thông báo
4. **Send Email Use Case**: Gửi email thông báo

---

## 🗄️ Database Organization

### Database per Service Pattern

```
MongoDB Instance (localhost:27017)
│
├── auth_db/                    # Auth Service
│   ├── users
│   └── sessions
│
├── product_db/                 # Product Service
│   ├── products
│   └── categories
│
├── order_db/                   # Order Service
│   ├── orders
│   ├── cart
│   └── addresses
│
├── payment_db/                 # Payment Service
│   ├── payments
│   └── coupons
│
├── review_db/                  # Review Service
│   ├── reviews
│   └── wishlist
│
└── notification_db/            # Notification Service
    └── notifications
```

### Connection Strings

Mỗi service có connection string riêng:

```env
# Auth Service
AUTH_DB_CONNECTION_STRING=mongodb://localhost:27017/auth_db

# Product Service
PRODUCT_DB_CONNECTION_STRING=mongodb://localhost:27017/product_db

# Order Service
ORDER_DB_CONNECTION_STRING=mongodb://localhost:27017/order_db

# Payment Service
PAYMENT_DB_CONNECTION_STRING=mongodb://localhost:27017/payment_db

# Review Service
REVIEW_DB_CONNECTION_STRING=mongodb://localhost:27017/review_db

# Notification Service
NOTIFICATION_DB_CONNECTION_STRING=mongodb://localhost:27017/notification_db
```

### Database Connection Example

```typescript
// services/auth-service/src/config/database.ts
import mongoose from 'mongoose';

const AUTH_DB_URI = process.env.AUTH_DB_CONNECTION_STRING || 
  'mongodb://localhost:27017/auth_db';

export async function connectAuthDatabase() {
  try {
    await mongoose.connect(AUTH_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Auth Database');
  } catch (error) {
    console.error('❌ Auth Database connection error:', error);
    process.exit(1);
  }
}
```

---

## 📝 Best Practices

### 1. Folder Structure
- ✅ Mỗi service có cấu trúc thư mục riêng
- ✅ Tách biệt rõ ràng: models, controllers, services, usecases
- ✅ Code dùng chung đặt trong `shared/`

### 2. Use Cases
- ✅ Mỗi use case là một file riêng
- ✅ Use case chứa business logic
- ✅ Service layer chỉ gọi use cases

### 3. Database
- ✅ Mỗi service có database riêng
- ✅ Không chia sẻ database giữa các services
- ✅ Sử dụng denormalization khi cần

### 4. API Communication
- ✅ Services giao tiếp qua API Gateway
- ✅ Sử dụng HTTP/REST hoặc gRPC
- ✅ Event-driven cho async operations

### 5. Error Handling
- ✅ Standard error response format
- ✅ Proper HTTP status codes
- ✅ Error logging

### 6. Testing
- ✅ Unit tests cho use cases
- ✅ Integration tests cho APIs
- ✅ Test database riêng

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Update connection strings in .env
```

### 2. Start Services

```bash
# Start all services with Docker
docker-compose up -d

# Or start individually
cd services/auth-service && npm run dev
cd services/product-service && npm run dev
# ... etc
```

### 3. Run Migrations

```bash
# Each service has its own migration scripts
cd services/auth-service && npm run migrate
cd services/product-service && npm run migrate
# ... etc
```

---

## 📚 Tài Liệu Liên Quan

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) - Chi tiết database design
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Kiến trúc database
- [FEATURES_IMPLEMENTATION.md](./FEATURES_IMPLEMENTATION.md) - Chi tiết implementation

---

**Tài liệu này sẽ được cập nhật khi có thay đổi.**

