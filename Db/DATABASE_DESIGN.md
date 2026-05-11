# 🏸 Database Design - Hệ Thống Bán Đồ Dùng Thể Thao (Tập Trung Cầu Lông)

## 📋 Mục Lục
- [Tổng Quan](#tổng-quan)
- [Kiến Trúc Database](#kiến-trúc-database)
- [Collections Chi Tiết](#collections-chi-tiết)
- [Relationships](#relationships)
- [Indexes & Performance](#indexes--performance)
- [Authentication & Security](#authentication--security)
- [Chức Năng Chi Tiết](#chức-năng-chi-tiết)

> ⚠️ **QUAN TRỌNG**: Xem [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) để hiểu rõ về cách tổ chức database trong kiến trúc Microservices (Database per Service pattern).

---

## 🎯 Tổng Quan

Hệ thống database được thiết kế cho **MongoDB** với kiến trúc **Microservices**, tập trung vào việc bán đồ dùng thể thao, đặc biệt là **cầu lông** và các đồ dùng thể thao khác.

### Công Nghệ Sử Dụng
- **Database**: MongoDB (NoSQL)
- **Backend**: Express.js, Next.js, React
- **Architecture**: Microservices
- **Authentication**: Bcrypt + JWT

---

## 🏗️ Kiến Trúc Database

### ⚠️ QUAN TRỌNG: Database per Service Pattern

Trong kiến trúc **Microservices**, mỗi service có **một database riêng**. Xem chi tiết tại [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)

### Databases theo Service:

#### 1. **auth_db** (Auth Service)
- **users** - Người dùng
- **sessions** - Phiên đăng nhập

#### 2. **product_db** (Product Service)
- **products** - Sản phẩm
- **categories** - Danh mục sản phẩm

#### 3. **order_db** (Order Service)
- **orders** - Đơn hàng (bao gồm order_items)
- **cart** - Giỏ hàng
- **addresses** - Địa chỉ giao hàng

#### 4. **payment_db** (Payment Service)
- **payments** - Thanh toán
- **coupons** - Mã giảm giá

#### 5. **review_db** (Review Service)
- **reviews** - Đánh giá sản phẩm
- **wishlist** - Danh sách yêu thích

#### 6. **notification_db** (Notification Service)
- **notifications** - Thông báo

### 📝 Lưu ý:
- Mỗi database độc lập, không chia sẻ collections
- Services giao tiếp qua API hoặc Event-driven
- Xem [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) để biết chi tiết về cách tổ chức

---

## 📦 Collections Chi Tiết

### 1. **users** Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required, indexed),
  email: String (unique, required, indexed),
  password: String (hashed with bcrypt, required),
  fullName: String (required),
  phone: String,
  avatar: String (URL),
  role: String (enum: ['admin', 'user', 'staff'], default: 'user', indexed),
  status: String (enum: ['active', 'inactive', 'banned'], default: 'active'),
  
  // Authentication
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: Boolean (default: false),
  emailVerificationToken: String,
  
  // Profile
  dateOfBirth: Date,
  gender: String (enum: ['male', 'female', 'other']),
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
    country: String (default: 'Vietnam'),
    postalCode: String
  },
  
  // Badminton specific preferences
  playingLevel: String (enum: ['beginner', 'intermediate', 'advanced', 'professional']),
  preferredRacketBrand: [String],
  preferredRacketWeight: String,
  
  // Statistics
  totalOrders: Number (default: 0),
  totalSpent: Number (default: 0),
  loyaltyPoints: Number (default: 0),
  
  createdAt: Date (indexed),
  updatedAt: Date,
  lastLogin: Date
}
```

**Indexes:**
- `{ email: 1 }` - Unique
- `{ username: 1 }` - Unique
- `{ role: 1 }`
- `{ status: 1 }`
- `{ createdAt: -1 }`

---

### 2. **products** Collection

```javascript
{
  _id: ObjectId,
  name: String (required, indexed, text search),
  slug: String (unique, indexed),
  description: String (required, text search),
  shortDescription: String,
  
  // Category & Brand
  categoryId: ObjectId (ref: 'categories', required, indexed),
  categoryName: String (required, indexed), // Denormalized for performance
  brand: String (required, indexed),
  brandSlug: String (indexed),
  
  // Pricing
  price: Number (required, min: 0, indexed),
  salePrice: Number (min: 0),
  costPrice: Number, // For admin
  discountPercent: Number (calculated),
  
  // Inventory
  stock: Number (required, default: 0, indexed),
  sku: String (unique, indexed), // Stock Keeping Unit
  barcode: String,
  lowStockThreshold: Number (default: 10),
  
  // Images
  images: [{
    url: String (required),
    alt: String,
    isPrimary: Boolean (default: false)
  }],
  thumbnail: String, // Primary image URL
  
  // Badminton Specific Attributes
  productType: String (enum: ['racket', 'shuttlecock', 'shoes', 'clothing', 'accessories', 'string', 'grip', 'bag', 'other']),
  
  // Racket specific
  racketSpecs: {
    weight: String, // e.g., "3U", "4U", "5U"
    balance: String, // "head-heavy", "even", "head-light"
    stringTension: String, // "20-24 lbs"
    frameMaterial: String, // "carbon fiber", "aluminum", etc.
    shaftFlexibility: String, // "stiff", "medium", "flexible"
    gripSize: String, // "G3", "G4", "G5"
    length: Number, // cm
  },
  
  // Shuttlecock specific
  shuttlecockSpecs: {
    type: String, // "feather", "plastic", "nylon"
    speed: String, // "76", "77", "78", "79"
    quantity: Number, // số quả trong hộp
    featherGrade: String, // "A", "B", "C"
  },
  
  // Shoes specific
  shoeSpecs: {
    size: [String], // Available sizes
    gender: String, // "male", "female", "unisex"
    soleMaterial: String,
    upperMaterial: String,
    cushioning: String,
  },
  
  // General specifications (Map for flexibility)
  specifications: Map<String, String>, // Key-value pairs
  
  // SEO & Marketing
  tags: [String] (indexed, text search),
  keywords: [String],
  metaTitle: String,
  metaDescription: String,
  
  // Reviews & Ratings
  averageRating: Number (default: 0, min: 0, max: 5),
  totalReviews: Number (default: 0),
  ratingDistribution: {
    5: Number (default: 0),
    4: Number (default: 0),
    3: Number (default: 0),
    2: Number (default: 0),
    1: Number (default: 0)
  },
  
  // Sales & Performance
  totalSold: Number (default: 0, indexed),
  views: Number (default: 0),
  isFeatured: Boolean (default: false, indexed),
  isNew: Boolean (default: false, indexed),
  isBestSeller: Boolean (default: false, indexed),
  isOnSale: Boolean (default: false, indexed),
  
  // Status
  status: String (enum: ['active', 'inactive', 'out_of_stock', 'discontinued'], default: 'active', indexed),
  isActive: Boolean (default: true, indexed),
  
  // Related Products
  relatedProducts: [ObjectId], // ref: 'products'
  frequentlyBoughtTogether: [ObjectId], // ref: 'products'
  
  createdAt: Date (indexed),
  updatedAt: Date,
  publishedAt: Date
}
```

**Indexes:**
- `{ name: 'text', description: 'text', tags: 'text' }` - Text search
- `{ categoryId: 1 }`
- `{ categoryName: 1 }`
- `{ brand: 1 }`
- `{ price: 1 }`
- `{ stock: 1 }`
- `{ status: 1, isActive: 1 }`
- `{ isFeatured: 1, isNew: 1, isBestSeller: 1 }`
- `{ totalSold: -1 }`
- `{ averageRating: -1 }`
- `{ createdAt: -1 }`
- `{ slug: 1 }` - Unique
- `{ sku: 1 }` - Unique

---

### 3. **categories** Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique, indexed),
  slug: String (unique, indexed),
  description: String,
  image: String (URL),
  icon: String, // Icon class or URL
  
  // Hierarchy
  parentId: ObjectId (ref: 'categories', nullable), // For subcategories
  level: Number (default: 1), // 1 = main category, 2 = subcategory
  path: String, // e.g., "badminton/rackets"
  
  // Badminton Categories
  // Main: "Cầu Lông" (Badminton)
  // Subcategories:
  //   - "Vợt Cầu Lông" (Rackets)
  //   - "Cầu Lông" (Shuttlecocks)
  //   - "Giày Cầu Lông" (Shoes)
  //   - "Quần Áo Cầu Lông" (Clothing)
  //   - "Dây Vợt" (Strings)
  //   - "Tay Cầm" (Grips)
  //   - "Túi Đựng Vợt" (Bags)
  //   - "Phụ Kiện" (Accessories)
  
  // Display
  displayOrder: Number (default: 0),
  isActive: Boolean (default: true, indexed),
  showInMenu: Boolean (default: true),
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Statistics
  productCount: Number (default: 0),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ name: 1 }` - Unique
- `{ slug: 1 }` - Unique
- `{ parentId: 1 }`
- `{ level: 1 }`
- `{ isActive: 1 }`
- `{ displayOrder: 1 }`

---

### 4. **orders** Collection

```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, indexed), // e.g., "ORD-2024-001234"
  userId: ObjectId (ref: 'users', required, indexed),
  
  // Order Items
  items: [{
    productId: ObjectId (ref: 'products', required),
    productName: String (required), // Denormalized
    productImage: String, // Denormalized
    sku: String,
    quantity: Number (required, min: 1),
    price: Number (required), // Price at time of order
    salePrice: Number, // Sale price at time of order
    totalPrice: Number (required), // quantity * (salePrice || price)
    specifications: Map<String, String> // For variants (size, color, etc.)
  }],
  
  // Pricing
  subtotal: Number (required, min: 0),
  shippingFee: Number (default: 0),
  discountAmount: Number (default: 0),
  couponCode: String,
  couponId: ObjectId (ref: 'coupons'),
  tax: Number (default: 0),
  totalAmount: Number (required, min: 0, indexed),
  
  // Shipping
  shippingAddress: {
    fullName: String (required),
    phone: String (required),
    street: String (required),
    ward: String (required),
    district: String (required),
    city: String (required),
    country: String (default: 'Vietnam'),
    postalCode: String,
    addressId: ObjectId (ref: 'addresses')
  },
  
  // Status
  status: String (enum: [
    'pending',           // Chờ xử lý
    'confirmed',         // Đã xác nhận
    'processing',        // Đang xử lý
    'packed',            // Đã đóng gói
    'shipping',          // Đang giao hàng
    'delivered',         // Đã giao hàng
    'cancelled',         // Đã hủy
    'refunded'           // Đã hoàn tiền
  ], default: 'pending', indexed),
  
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: String, // 'system' or userId
    updatedAt: Date
  }],
  
  // Payment
  paymentMethod: String (enum: [
    'cod',              // Cash on Delivery
    'bank_transfer',    // Chuyển khoản ngân hàng
    'credit_card',      // Thẻ tín dụng
    'debit_card',       // Thẻ ghi nợ
    'e_wallet',         // Ví điện tử (MoMo, ZaloPay, etc.)
    'vnpay',            // VNPay
    'paypal'            // PayPal
  ], required, indexed),
  
  paymentStatus: String (enum: [
    'pending',          // Chờ thanh toán
    'paid',             // Đã thanh toán
    'failed',           // Thanh toán thất bại
    'refunded',         // Đã hoàn tiền
    'partially_refunded' // Hoàn tiền một phần
  ], default: 'pending', indexed),
  
  paymentId: ObjectId (ref: 'payments'),
  paidAt: Date,
  
  // Shipping
  shippingMethod: String (enum: [
    'standard',         // Giao hàng tiêu chuẩn
    'express',          // Giao hàng nhanh
    'same_day'          // Giao trong ngày
  ], default: 'standard'),
  
  shippingProvider: String, // e.g., "Viettel Post", "Giao Hàng Nhanh"
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  
  // Notes
  customerNote: String (maxlength: 500),
  adminNote: String,
  
  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: ObjectId (ref: 'users'),
  
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes:**
- `{ orderNumber: 1 }` - Unique
- `{ userId: 1 }`
- `{ status: 1 }`
- `{ paymentStatus: 1 }`
- `{ createdAt: -1 }`
- `{ userId: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`

---

### 5. **cart** Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, unique, indexed),
  
  items: [{
    productId: ObjectId (ref: 'products', required),
    productName: String, // Denormalized
    productImage: String, // Denormalized
    price: Number, // Current price
    salePrice: Number, // Current sale price
    quantity: Number (required, min: 1),
    specifications: Map<String, String>, // Size, color, etc.
    addedAt: Date
  }],
  
  // Calculated totals
  subtotal: Number (default: 0),
  totalItems: Number (default: 0),
  
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }` - Unique

---

### 6. **reviews** Collection

```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: 'products', required, indexed),
  userId: ObjectId (ref: 'users', required, indexed),
  orderId: ObjectId (ref: 'orders'), // Verify purchase
  
  // Rating
  rating: Number (required, min: 1, max: 5, indexed),
  
  // Review Content
  title: String,
  comment: String (maxlength: 1000),
  images: [String], // Review images
  
  // Helpful votes
  helpfulCount: Number (default: 0),
  helpfulUsers: [ObjectId], // Users who found it helpful
  
  // Status
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending', indexed),
  isVerifiedPurchase: Boolean (default: false),
  
  // Admin
  adminResponse: {
    message: String,
    respondedBy: ObjectId (ref: 'users'),
    respondedAt: Date
  },
  
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes:**
- `{ productId: 1, createdAt: -1 }`
- `{ userId: 1 }`
- `{ rating: 1 }`
- `{ status: 1 }`
- `{ productId: 1, userId: 1 }` - Unique (one review per user per product)

---

### 7. **wishlist** Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, indexed),
  productId: ObjectId (ref: 'products', required, indexed),
  
  createdAt: Date (indexed)
}
```

**Indexes:**
- `{ userId: 1, productId: 1 }` - Unique
- `{ userId: 1, createdAt: -1 }`

---

### 8. **addresses** Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, indexed),
  
  // Address Info
  fullName: String (required),
  phone: String (required),
  street: String (required),
  ward: String (required),
  district: String (required),
  city: String (required),
  country: String (default: 'Vietnam'),
  postalCode: String,
  
  // Settings
  isDefault: Boolean (default: false, indexed),
  label: String, // e.g., "Nhà", "Công ty"
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, isDefault: 1 }`

---

### 9. **payments** Collection

```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: 'orders', required, indexed),
  userId: ObjectId (ref: 'users', required, indexed),
  
  // Payment Info
  amount: Number (required, min: 0),
  currency: String (default: 'VND'),
  paymentMethod: String (required),
  
  // Transaction
  transactionId: String, // From payment gateway
  transactionCode: String, // Unique transaction code
  gatewayResponse: Object, // Raw response from gateway
  
  // Status
  status: String (enum: [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
  ], default: 'pending', indexed),
  
  // Timestamps
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String,
  
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes:**
- `{ orderId: 1 }`
- `{ userId: 1 }`
- `{ transactionId: 1 }`
- `{ status: 1 }`
- `{ createdAt: -1 }`

---

### 10. **coupons** Collection

```javascript
{
  _id: ObjectId,
  code: String (unique, required, indexed, uppercase),
  name: String (required),
  description: String,
  
  // Discount Type
  discountType: String (enum: ['percentage', 'fixed_amount'], required),
  discountValue: Number (required, min: 0),
  maxDiscountAmount: Number, // For percentage discounts
  
  // Conditions
  minPurchaseAmount: Number (default: 0),
  maxUsagePerUser: Number (default: 1),
  maxUsageTotal: Number, // Total usage limit
  usageCount: Number (default: 0),
  
  // Applicability
  applicableCategories: [ObjectId], // ref: 'categories'
  applicableProducts: [ObjectId], // ref: 'products'
  excludedProducts: [ObjectId],
  
  // Validity
  validFrom: Date (required, indexed),
  validUntil: Date (required, indexed),
  isActive: Boolean (default: true, indexed),
  
  // User restrictions
  applicableUserRoles: [String], // ['user', 'vip']
  applicableUserIds: [ObjectId], // Specific users
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ code: 1 }` - Unique
- `{ isActive: 1, validFrom: 1, validUntil: 1 }`
- `{ validUntil: 1 }` - For cleanup expired coupons

---

### 11. **notifications** Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, indexed),
  
  // Notification Content
  type: String (enum: [
    'order_status',
    'payment_success',
    'payment_failed',
    'product_restocked',
    'price_drop',
    'new_product',
    'promotion',
    'review_response',
    'system'
  ], required, indexed),
  
  title: String (required),
  message: String (required),
  data: Object, // Additional data (orderId, productId, etc.)
  
  // Status
  isRead: Boolean (default: false, indexed),
  readAt: Date,
  
  // Link
  link: String, // URL to related page
  
  createdAt: Date (indexed)
}
```

**Indexes:**
- `{ userId: 1, isRead: 1, createdAt: -1 }`
- `{ type: 1 }`
- `{ createdAt: -1 }`

---

### 12. **sessions** Collection (Optional - for session management)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, indexed),
  token: String (required, unique, indexed),
  refreshToken: String (indexed),
  
  // Device Info
  userAgent: String,
  ipAddress: String,
  deviceType: String, // 'mobile', 'desktop', 'tablet'
  
  // Expiry
  expiresAt: Date (required, indexed),
  lastActivity: Date,
  
  createdAt: Date
}
```

**Indexes:**
- `{ token: 1 }` - Unique
- `{ userId: 1 }`
- `{ expiresAt: 1 }` - TTL index for auto-deletion

---

## 🔗 Relationships

### User Relationships
- `users` → `orders` (1:N)
- `users` → `cart` (1:1)
- `users` → `reviews` (1:N)
- `users` → `wishlist` (1:N)
- `users` → `addresses` (1:N)
- `users` → `payments` (1:N)
- `users` → `notifications` (1:N)

### Product Relationships
- `products` → `categories` (N:1)
- `products` → `reviews` (1:N)
- `products` → `order_items` (1:N)
- `products` → `wishlist` (1:N)
- `products` → `cart.items` (1:N)

### Order Relationships
- `orders` → `users` (N:1)
- `orders` → `order_items` (1:N)
- `orders` → `payments` (1:1)
- `orders` → `addresses` (N:1)
- `orders` → `coupons` (N:1)

---

## ⚡ Indexes & Performance

### Compound Indexes for Common Queries

```javascript
// Products
db.products.createIndex({ categoryId: 1, status: 1, isActive: 1, price: 1 })
db.products.createIndex({ brand: 1, status: 1, createdAt: -1 })
db.products.createIndex({ isFeatured: 1, isActive: 1, createdAt: -1 })
db.products.createIndex({ totalSold: -1, isActive: 1 })

// Orders
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 })
db.orders.createIndex({ status: 1, paymentStatus: 1, createdAt: -1 })

// Reviews
db.reviews.createIndex({ productId: 1, status: 1, rating: -1, createdAt: -1 })

// Notifications
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
```

### TTL Indexes

```javascript
// Auto-delete expired sessions
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Auto-delete old notifications (optional, keep last 90 days)
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })
```

---

## 🔐 Authentication & Security

### Password Hashing với Bcrypt

**Công nghệ đề xuất:**
- **bcrypt** với **salt rounds: 10-12**

**Implementation:**

```javascript
// Hash password khi đăng ký
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

// Verify password khi đăng nhập
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

### JWT Token Strategy

**Access Token:**
- Expiry: **15 minutes - 1 hour**
- Stored in: **Memory/HttpOnly Cookie** (client-side)
- Payload: `{ userId, email, role }`

**Refresh Token:**
- Expiry: **7-30 days**
- Stored in: **Database** (`users.refreshToken`) hoặc **Redis**
- Used to generate new access tokens

### Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - Special characters recommended

2. **Rate Limiting:**
   - Login attempts: 5 per 15 minutes
   - Registration: 3 per hour per IP

3. **Email Verification:**
   - Send verification email on registration
   - Token expiry: 24 hours

4. **Password Reset:**
   - Token expiry: 1 hour
   - One-time use token
   - Rate limit: 3 requests per hour

5. **Session Management:**
   - Store refresh tokens securely
   - Implement token rotation
   - Logout invalidates all sessions

---

## 🎯 Chức Năng Chi Tiết

### 1. **Authentication & Authorization**

#### Đăng Ký (Register)
- Validate email format
- Check email/username uniqueness
- Hash password với bcrypt
- Generate email verification token
- Send verification email
- Create user với status: 'inactive' (until verified)

#### Đăng Nhập (Login)
- Verify email/password
- Check account status (active/inactive/banned)
- Generate JWT access token & refresh token
- Store refresh token in database
- Update lastLogin timestamp
- Return user info + tokens

#### Đăng Xuất (Logout)
- Invalidate refresh token
- Clear session data
- Optional: Blacklist access token (if using Redis)

#### Refresh Token
- Verify refresh token
- Generate new access token
- Optionally rotate refresh token

#### Quên Mật Khẩu (Forgot Password)
- Generate reset token
- Send reset email
- Token expiry: 1 hour

#### Đổi Mật Khẩu (Reset Password)
- Verify reset token
- Validate new password strength
- Hash new password
- Invalidate reset token
- Logout all sessions (optional)

#### Email Verification
- Verify token
- Activate account
- Invalidate token

---

### 2. **Product Management**

#### CRUD Operations
- **Create**: Admin only, validate all fields
- **Read**: Public (active products), Admin (all)
- **Update**: Admin only, track changes
- **Delete**: Soft delete (set status: 'inactive')

#### Product Search & Filter
- **Text Search**: Name, description, tags
- **Filters**:
  - Category
  - Brand
  - Price range (min-max)
  - Rating (min stars)
  - Availability (in stock)
  - On sale
  - Badminton specific: productType, racket specs, etc.
- **Sort**: Price, rating, newest, bestseller, name
- **Pagination**: Page + limit

#### Product Details
- Full product info
- Related products
- Frequently bought together
- Reviews & ratings
- Stock availability
- Price history (optional)

#### Product Variants (Future)
- Size variants (shoes, clothing)
- Color variants
- Weight variants (rackets)

---

### 3. **Shopping Cart**

#### Add to Cart
- Check product availability
- Check stock quantity
- Update quantity if exists
- Calculate totals

#### Update Cart
- Update item quantity
- Remove items
- Clear cart

#### Cart Calculation
- Subtotal
- Shipping fee (based on address)
- Discount (coupon)
- Tax
- Total

---

### 4. **Order Management**

#### Create Order
- Validate cart items
- Check stock availability
- Calculate totals
- Apply coupon (if valid)
- Create order với status: 'pending'
- Reduce product stock
- Clear cart
- Send confirmation email

#### Order Status Updates
- **pending** → **confirmed**: Admin confirms
- **confirmed** → **processing**: Start processing
- **processing** → **packed**: Items packed
- **packed** → **shipping**: Shipped
- **shipping** → **delivered**: Delivered
- Any → **cancelled**: Cancelled

#### Order Cancellation
- User can cancel if status: 'pending' or 'confirmed'
- Admin can cancel any order
- Restore product stock
- Refund payment (if paid)

#### Order History
- User: View own orders
- Filter by status, date range
- Order details with tracking

---

### 5. **Payment Processing**

#### Payment Methods
- **COD**: No upfront payment
- **Bank Transfer**: Manual verification
- **Credit/Debit Card**: Payment gateway integration
- **E-Wallet**: MoMo, ZaloPay, etc.
- **VNPay**: Vietnamese payment gateway

#### Payment Flow
1. Create payment record
2. Process payment (gateway)
3. Update payment status
4. Update order payment status
5. Send confirmation

#### Refund Processing
- Admin initiates refund
- Process refund via gateway
- Update payment & order status
- Send notification

---

### 6. **Review & Rating**

#### Create Review
- Verify purchase (orderId)
- One review per product per user
- Validate rating (1-5 stars)
- Status: 'pending' (awaiting approval)

#### Review Approval
- Admin approves/rejects
- Auto-approve for verified purchases (optional)
- Update product rating statistics

#### Review Display
- Sort by: Most helpful, Newest, Highest rating, Lowest rating
- Filter by rating
- Show verified purchase badge

#### Helpful Votes
- Users can mark reviews as helpful
- Track helpful count

---

### 7. **Wishlist**

#### Add to Wishlist
- Check if already exists
- Add product

#### Remove from Wishlist
- Remove product

#### View Wishlist
- List all wishlist items
- Show product details
- Quick add to cart

---

### 8. **Coupon Management**

#### Apply Coupon
- Validate coupon code
- Check validity dates
- Check usage limits
- Check applicable products/categories
- Check minimum purchase amount
- Calculate discount

#### Coupon Validation
- Code exists & active
- Not expired
- Usage limits not exceeded
- User eligible
- Products eligible

---

### 9. **User Profile**

#### View Profile
- Personal info
- Order history summary
- Wishlist count
- Loyalty points

#### Update Profile
- Update personal info
- Change password
- Update address

#### Address Management
- Add address
- Update address
- Delete address
- Set default address

---

### 10. **Notifications**

#### Notification Types
- Order status updates
- Payment confirmations
- Product restocked
- Price drops (wishlist items)
- New products (subscribed categories)
- Promotions & coupons
- Review responses

#### Notification Delivery
- In-app notifications
- Email notifications (optional)
- Push notifications (future)

---

### 11. **Admin Functions**

#### Dashboard
- Sales statistics
- Order statistics
- Product statistics
- User statistics
- Revenue charts

#### Product Management
- CRUD products
- Bulk operations
- Import/Export (CSV)

#### Order Management
- View all orders
- Update order status
- Process refunds
- Print invoices

#### User Management
- View users
- Update user status
- View user orders
- Manage roles

#### Coupon Management
- Create coupons
- View usage statistics
- Deactivate coupons

#### Review Management
- Approve/reject reviews
- Respond to reviews
- Delete inappropriate reviews

---

### 12. **Search & Discovery**

#### Advanced Search
- Full-text search
- Category filters
- Brand filters
- Price filters
- Rating filters
- Badminton-specific filters

#### Product Recommendations
- Based on purchase history
- Based on viewed products
- Based on category
- Frequently bought together

#### Trending Products
- Based on sales (last 7/30 days)
- Based on views
- Based on reviews

---

## 📊 Database Statistics & Analytics

### Collections for Analytics (Optional)

```javascript
// product_views - Track product views
{
  productId: ObjectId,
  userId: ObjectId (nullable), // null for anonymous
  ipAddress: String,
  userAgent: String,
  viewedAt: Date
}

// search_queries - Track search queries
{
  query: String,
  userId: ObjectId (nullable),
  resultsCount: Number,
  clickedProducts: [ObjectId],
  searchedAt: Date
}
```

---

## 🚀 Implementation Notes

### Microservices Distribution

1. **Auth Service**: `users`, `sessions`
2. **Product Service**: `products`, `categories`
3. **Order Service**: `orders`, `order_items`, `cart`
4. **Payment Service**: `payments`
5. **Review Service**: `reviews`
6. **Notification Service**: `notifications`
7. **User Service**: `addresses`, `wishlist`

### Data Consistency

- Use **Event Sourcing** hoặc **Saga Pattern** cho distributed transactions
- Use **Message Queue** (RabbitMQ/Redis) cho async operations
- Denormalize frequently accessed data (product name in orders)

### Performance Optimization

- Use **Redis** for caching:
  - Product listings
  - User sessions
  - Cart data
  - Popular searches

- Use **CDN** for product images

- Implement **Database Replication** for read scalability

---

## 📝 Notes

- Tất cả timestamps sử dụng **UTC**
- Currency mặc định: **VND** (Vietnamese Dong)
- Language: **Vietnamese** (có thể mở rộng đa ngôn ngữ)
- Timezone: **Asia/Ho_Chi_Minh** (UTC+7)

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong hệ thống.**

