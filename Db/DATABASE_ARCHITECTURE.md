# 🏗️ Database Architecture - Microservices Pattern

## 📋 Mục Lục
- [Tổng Quan](#tổng-quan)
- [Kiến Trúc Database](#kiến-trúc-database)
- [Database per Service Pattern](#database-per-service-pattern)
- [Collections Distribution](#collections-distribution)
- [Connection Strings](#connection-strings)
- [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Trong kiến trúc **Microservices**, cách tổ chức database tốt nhất là **"Database per Service"** - mỗi microservice có một database riêng.

### ❌ KHÔNG NÊN: Tất cả collections trong một database

```
sports_ecommerce_db/
├── users
├── products
├── orders
├── cart
├── reviews
└── ...
```

**Vấn đề:**
- Các services phụ thuộc vào nhau
- Khó scale độc lập
- Khó deploy riêng biệt
- Vi phạm nguyên tắc microservices

### ✅ NÊN: Database per Service (Mỗi service một database)

```
MongoDB Instance/
├── auth_db/          (Auth Service)
│   ├── users
│   └── sessions
│
├── product_db/       (Product Service)
│   ├── products
│   └── categories
│
├── order_db/         (Order Service)
│   ├── orders
│   └── cart
│
├── payment_db/       (Payment Service)
│   └── payments
│
├── review_db/        (Review Service)
│   └── reviews
│
└── notification_db/  (Notification Service)
    └── notifications
```

**Ưu điểm:**
- ✅ Mỗi service độc lập hoàn toàn
- ✅ Có thể scale từng database riêng biệt
- ✅ Deploy độc lập
- ✅ Dễ bảo trì và phát triển
- ✅ Tuân thủ nguyên tắc microservices

---

## 🏗️ Kiến Trúc Database

### Pattern: Database per Service

Mỗi microservice có **một database riêng** với các collections liên quan đến domain của nó.

```
┌─────────────────────────────────────────────────┐
│           MongoDB Instance (Single)              │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  auth_db      │  │ product_db   │           │
│  │  (Port 27017) │  │ (Port 27017) │           │
│  │              │  │              │           │
│  │ - users      │  │ - products   │           │
│  │ - sessions   │  │ - categories │           │
│  └──────────────┘  └──────────────┘           │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  order_db    │  │ payment_db   │           │
│  │              │  │              │           │
│  │ - orders     │  │ - payments   │           │
│  │ - cart       │  └──────────────┘           │
│  └──────────────┘                              │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  review_db   │  │ notification_db│         │
│  │              │  │              │           │
│  │ - reviews    │  │ - notifications│         │
│  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────┘
```

---

## 📦 Collections Distribution

### 1. **auth_db** - Auth Service Database

**Collections:**
- `users` - Thông tin người dùng
- `sessions` - Phiên đăng nhập (optional, có thể dùng Redis)

**Connection String:**
```env
AUTH_DB_CONNECTION_STRING=mongodb://localhost:27017/auth_db
```

**Responsibility:**
- Authentication (login, register)
- Authorization (roles, permissions)
- User management
- Password reset
- Email verification

---

### 2. **product_db** - Product Service Database

**Collections:**
- `products` - Sản phẩm
- `categories` - Danh mục sản phẩm

**Connection String:**
```env
PRODUCT_DB_CONNECTION_STRING=mongodb://localhost:27017/product_db
```

**Responsibility:**
- Product CRUD
- Category management
- Product search & filter
- Inventory management

---

### 3. **order_db** - Order Service Database

**Collections:**
- `orders` - Đơn hàng
- `cart` - Giỏ hàng
- `addresses` - Địa chỉ giao hàng (hoặc có thể ở user service)

**Connection String:**
```env
ORDER_DB_CONNECTION_STRING=mongodb://localhost:27017/order_db
```

**Responsibility:**
- Order management
- Cart management
- Order status tracking
- Shipping management

---

### 4. **payment_db** - Payment Service Database

**Collections:**
- `payments` - Thanh toán
- `coupons` - Mã giảm giá (có thể tách riêng)

**Connection String:**
```env
PAYMENT_DB_CONNECTION_STRING=mongodb://localhost:27017/payment_db
```

**Responsibility:**
- Payment processing
- Payment history
- Refund management
- Coupon management

---

### 5. **review_db** - Review Service Database

**Collections:**
- `reviews` - Đánh giá sản phẩm
- `wishlist` - Danh sách yêu thích (có thể tách riêng)

**Connection String:**
```env
REVIEW_DB_CONNECTION_STRING=mongodb://localhost:27017/review_db
```

**Responsibility:**
- Product reviews
- Ratings management
- Review moderation
- Wishlist management

---

### 6. **notification_db** - Notification Service Database

**Collections:**
- `notifications` - Thông báo

**Connection String:**
```env
NOTIFICATION_DB_CONNECTION_STRING=mongodb://localhost:27017/notification_db
```

**Responsibility:**
- User notifications
- Email notifications
- Push notifications
- Notification preferences

---

## 🔗 Cross-Service Communication

### Vấn đề: Services cần dữ liệu từ services khác

**Giải pháp:**

#### 1. **API Calls** (Synchronous)
```typescript
// Order Service cần thông tin user từ Auth Service
const user = await authServiceClient.getUser(userId);

// Order Service cần thông tin product từ Product Service
const product = await productServiceClient.getProduct(productId);
```

#### 2. **Event-Driven** (Asynchronous) - Recommended
```typescript
// Product Service publishes event khi product được tạo
eventBus.publish('product.created', { productId, name, price });

// Order Service subscribes event
eventBus.subscribe('product.created', async (data) => {
  // Cache product info locally hoặc update denormalized data
});
```

#### 3. **Data Denormalization** (Copy data)
```typescript
// Order Service lưu copy của product info trong order
{
  orderId: "...",
  items: [{
    productId: "...",
    productName: "Vợt cầu lông Yonex", // Denormalized
    productImage: "...", // Denormalized
    price: 1000000 // Denormalized (price at time of order)
  }]
}
```

---

## 📝 Connection Strings Configuration

### Environment Variables (.env)

```env
# MongoDB Connection
MONGODB_HOST=localhost
MONGODB_PORT=27017

# Auth Service Database
AUTH_DB_NAME=auth_db
AUTH_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${AUTH_DB_NAME}

# Product Service Database
PRODUCT_DB_NAME=product_db
PRODUCT_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${PRODUCT_DB_NAME}

# Order Service Database
ORDER_DB_NAME=order_db
ORDER_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${ORDER_DB_NAME}

# Payment Service Database
PAYMENT_DB_NAME=payment_db
PAYMENT_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${PAYMENT_DB_NAME}

# Review Service Database
REVIEW_DB_NAME=review_db
REVIEW_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${REVIEW_DB_NAME}

# Notification Service Database
NOTIFICATION_DB_NAME=notification_db
NOTIFICATION_DB_CONNECTION_STRING=mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${NOTIFICATION_DB_NAME}
```

### Code Example - Mongoose Connection

```typescript
// auth-service/src/config/database.ts
import mongoose from 'mongoose';

const AUTH_DB_URI = process.env.AUTH_DB_CONNECTION_STRING || 'mongodb://localhost:27017/auth_db';

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

```typescript
// product-service/src/config/database.ts
import mongoose from 'mongoose';

const PRODUCT_DB_URI = process.env.PRODUCT_DB_CONNECTION_STRING || 'mongodb://localhost:27017/product_db';

export async function connectProductDatabase() {
  try {
    await mongoose.connect(PRODUCT_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Product Database');
  } catch (error) {
    console.error('❌ Product Database connection error:', error);
    process.exit(1);
  }
}
```

---

## 🎯 Best Practices

### 1. **Database Naming Convention**

```
{service_name}_db

Examples:
- auth_db
- product_db
- order_db
- payment_db
```

### 2. **Collection Naming**

- Use plural nouns: `users`, `products`, `orders`
- Use lowercase: `cart`, `reviews`
- Use snake_case for multi-word: `order_items` (nếu tách riêng)

### 3. **Data Consistency**

- **Denormalize** data khi cần thiết (ví dụ: product name trong order)
- **Event-driven** architecture để sync data giữa services
- **Saga Pattern** cho distributed transactions

### 4. **Scaling**

- Scale từng database độc lập
- Use **Replica Sets** cho high availability
- Use **Sharding** nếu database quá lớn

### 5. **Backup Strategy**

- Backup từng database riêng biệt
- Schedule backups khác nhau cho từng service
- Test restore procedures thường xuyên

---

## 📊 Summary Table

| Service | Database Name | Collections | Purpose |
|---------|--------------|-------------|---------|
| Auth Service | `auth_db` | users, sessions | Authentication & User Management |
| Product Service | `product_db` | products, categories | Product & Category Management |
| Order Service | `order_db` | orders, cart, addresses | Order & Cart Management |
| Payment Service | `payment_db` | payments, coupons | Payment & Coupon Processing |
| Review Service | `review_db` | reviews, wishlist | Reviews & Wishlist |
| Notification Service | `notification_db` | notifications | Notification Management |

---

## 🔄 Migration từ Single Database

Nếu bạn đang có single database và muốn migrate sang database per service:

### Step 1: Tạo các databases mới
```javascript
use auth_db
use product_db
use order_db
use payment_db
use review_db
use notification_db
```

### Step 2: Migrate Collections
```javascript
// Migrate users collection
db.users.find().forEach(function(doc) {
  db.getSiblingDB('auth_db').users.insertOne(doc);
});

// Migrate products collection
db.products.find().forEach(function(doc) {
  db.getSiblingDB('product_db').products.insertOne(doc);
});

// ... và tiếp tục cho các collections khác
```

### Step 3: Update Connection Strings
- Update environment variables
- Update code trong từng service
- Test kỹ lưỡng

---

## ✅ Kết Luận

**Trong kiến trúc Microservices:**
- ✅ **Mỗi service có một database riêng** (Database per Service)
- ✅ **Mỗi database chứa các collections liên quan đến domain của service đó**
- ✅ **KHÔNG phải mỗi collection một database** (không hiệu quả)
- ✅ **KHÔNG phải tất cả collections trong một database** (vi phạm nguyên tắc microservices)

**Pattern được khuyến nghị:**
```
MongoDB Instance/
├── auth_db/          → Auth Service
├── product_db/        → Product Service
├── order_db/          → Order Service
├── payment_db/       → Payment Service
├── review_db/        → Review Service
└── notification_db/  → Notification Service
```

---

**Tài liệu này sẽ được cập nhật khi có thay đổi.**

