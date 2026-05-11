# 🎯 Chức Năng Chi Tiết - Hệ Thống Bán Đồ Dùng Thể Thao

## 📋 Mục Lục
- [Tổng Quan](#tổng-quan)
- [API Endpoints Chi Tiết](#api-endpoints-chi-tiết)
- [Business Logic](#business-logic)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)

---

## 🎯 Tổng Quan

Tài liệu này mô tả chi tiết các chức năng và cách implement cho hệ thống bán đồ dùng thể thao với kiến trúc microservices.

---

## 🔌 API Endpoints Chi Tiết

### 1. **Authentication Service**

#### POST `/api/auth/register`
**Mô tả**: Đăng ký tài khoản mới

**Request Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)",
  "fullName": "string (required)",
  "phone": "string (optional, Vietnamese format)",
  "dateOfBirth": "date (optional)",
  "gender": "enum: ['male', 'female', 'other']"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "data": {
    "userId": "string",
    "email": "string",
    "emailVerified": false
  }
}
```

**Business Logic:**
1. Validate input data
2. Check email/username uniqueness
3. Hash password với bcrypt (salt rounds: 10)
4. Generate email verification token
5. Create user với status: 'inactive'
6. Send verification email (async)
7. Return success response

**Error Cases:**
- `400`: Email/username đã tồn tại
- `400`: Password không đủ mạnh
- `400`: Email format không hợp lệ
- `500`: Lỗi server

---

#### POST `/api/auth/login`
**Mô tả**: Đăng nhập

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "avatar": "string"
    },
    "accessToken": "string (JWT, expires in 1h)",
    "refreshToken": "string (JWT, expires in 7d)"
  }
}
```

**Business Logic:**
1. Find user by email
2. Check if user exists
3. Check account status (active/inactive/banned)
4. Verify password với bcrypt.compare()
5. Generate JWT access token (expires: 1h)
6. Generate JWT refresh token (expires: 7d)
7. Store refresh token in database
8. Update lastLogin timestamp
9. Return user info + tokens

**Error Cases:**
- `401`: Email hoặc mật khẩu không đúng
- `403`: Tài khoản chưa được kích hoạt
- `403`: Tài khoản đã bị khóa
- `429`: Quá nhiều lần thử đăng nhập

---

#### POST `/api/auth/refresh`
**Mô tả**: Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Headers:**
```
Authorization: Bearer <refreshToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string (new JWT)",
    "refreshToken": "string (new refresh token, optional rotation)"
  }
}
```

**Business Logic:**
1. Verify refresh token signature
2. Check if token exists in database
3. Check if token is expired
4. Generate new access token
5. Optionally rotate refresh token
6. Return new tokens

---

#### POST `/api/auth/logout`
**Mô tả**: Đăng xuất

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Business Logic:**
1. Verify access token
2. Invalidate refresh token in database
3. Optional: Add access token to blacklist (Redis)
4. Return success

---

#### POST `/api/auth/forgot-password`
**Mô tả**: Yêu cầu reset mật khẩu

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email reset mật khẩu đã được gửi"
}
```

**Business Logic:**
1. Find user by email
2. Generate reset token (random string)
3. Set resetPasswordToken và resetPasswordExpires (1 hour)
4. Send reset email (async)
5. Return success (don't reveal if email exists)

**Rate Limiting:** 3 requests per hour per IP

---

#### POST `/api/auth/reset-password`
**Mô tả**: Đặt lại mật khẩu

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string (min 8 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Business Logic:**
1. Find user by resetPasswordToken
2. Check if token is expired
3. Validate new password strength
4. Hash new password với bcrypt
5. Clear resetPasswordToken và resetPasswordExpires
6. Optional: Invalidate all sessions
7. Send confirmation email

---

#### GET `/api/auth/verify-email/:token`
**Mô tả**: Xác thực email

**Response:**
```json
{
  "success": true,
  "message": "Email đã được xác thực thành công"
}
```

**Business Logic:**
1. Find user by emailVerificationToken
2. Set emailVerified = true
3. Set status = 'active'
4. Clear emailVerificationToken
5. Return success

---

### 2. **Product Service**

#### GET `/api/products`
**Mô tả**: Lấy danh sách sản phẩm (có phân trang và filter)

**Query Parameters:**
```
?page=1
&limit=20
&category=badminton-rackets
&brand=yonex
&minPrice=100000
&maxPrice=5000000
&rating=4
&search=vợt cầu lông
&sort=price_asc|price_desc|newest|rating|bestseller
&inStock=true
&onSale=true
&productType=racket
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "description": "string",
        "price": 1000000,
        "salePrice": 800000,
        "discountPercent": 20,
        "stock": 50,
        "images": ["url1", "url2"],
        "thumbnail": "url1",
        "category": {
          "id": "string",
          "name": "string"
        },
        "brand": "string",
        "averageRating": 4.5,
        "totalReviews": 120,
        "totalSold": 500,
        "isNew": true,
        "isBestSeller": true,
        "isOnSale": true,
        "racketSpecs": {
          "weight": "3U",
          "balance": "head-heavy",
          "stringTension": "20-24 lbs"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "filters": {
      "categories": ["category1", "category2"],
      "brands": ["brand1", "brand2"],
      "priceRange": {
        "min": 100000,
        "max": 5000000
      }
    }
  }
}
```

**Business Logic:**
1. Build MongoDB query từ filters
2. Apply text search nếu có
3. Apply category/brand/price filters
4. Apply sorting
5. Apply pagination
6. Execute query
7. Return results với pagination info

---

#### GET `/api/products/:id`
**Mô tả**: Lấy chi tiết sản phẩm

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": 1000000,
    "salePrice": 800000,
    "stock": 50,
    "images": ["url1", "url2"],
    "specifications": {
      "weight": "3U",
      "balance": "head-heavy"
    },
    "racketSpecs": { ... },
    "category": { ... },
    "brand": "string",
    "averageRating": 4.5,
    "totalReviews": 120,
    "reviews": [
      {
        "id": "string",
        "user": {
          "name": "string",
          "avatar": "string"
        },
        "rating": 5,
        "comment": "string",
        "isVerifiedPurchase": true,
        "createdAt": "date"
      }
    ],
    "relatedProducts": [ ... ],
    "frequentlyBoughtTogether": [ ... ]
  }
}
```

**Business Logic:**
1. Find product by ID
2. Check if product is active
3. Increment view count (async)
4. Get related products
5. Get frequently bought together
6. Get reviews (paginated)
7. Return full product details

---

#### POST `/api/products` (Admin only)
**Mô tả**: Tạo sản phẩm mới

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "brand": "string",
  "price": 1000000,
  "salePrice": 800000,
  "stock": 50,
  "sku": "string (unique)",
  "images": ["url1", "url2"],
  "productType": "racket",
  "racketSpecs": {
    "weight": "3U",
    "balance": "head-heavy"
  },
  "specifications": {
    "key": "value"
  },
  "tags": ["tag1", "tag2"]
}
```

**Business Logic:**
1. Validate all required fields
2. Check SKU uniqueness
3. Generate slug từ name
4. Calculate discountPercent
5. Set isNew = true
6. Create product
7. Update category productCount
8. Return created product

---

#### PUT `/api/products/:id` (Admin only)
**Mô tả**: Cập nhật sản phẩm

**Business Logic:**
1. Find product by ID
2. Validate update data
3. Update fields
4. Recalculate discountPercent nếu price thay đổi
5. Update timestamps
6. Return updated product

---

#### DELETE `/api/products/:id` (Admin only)
**Mô tả**: Xóa sản phẩm (soft delete)

**Business Logic:**
1. Find product by ID
2. Check if product có orders
3. Set status = 'inactive' (soft delete)
4. Set isActive = false
5. Return success

---

### 3. **Cart Service**

#### GET `/api/cart`
**Mô tả**: Lấy giỏ hàng của user

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "productImage": "string",
        "price": 1000000,
        "salePrice": 800000,
        "quantity": 2,
        "totalPrice": 1600000
      }
    ],
    "subtotal": 1600000,
    "totalItems": 2
  }
}
```

---

#### POST `/api/cart/add`
**Mô tả**: Thêm sản phẩm vào giỏ hàng

**Request Body:**
```json
{
  "productId": "string",
  "quantity": 2,
  "specifications": {
    "size": "M",
    "color": "red"
  }
}
```

**Business Logic:**
1. Verify product exists và active
2. Check stock availability
3. Check if item already in cart
4. If exists: update quantity
5. If not: add new item
6. Recalculate totals
7. Return updated cart

**Error Cases:**
- `400`: Sản phẩm không tồn tại
- `400`: Hết hàng
- `400`: Số lượng vượt quá tồn kho

---

#### PUT `/api/cart/update/:itemId`
**Mô tả**: Cập nhật số lượng sản phẩm trong giỏ hàng

**Request Body:**
```json
{
  "quantity": 3
}
```

**Business Logic:**
1. Find cart item
2. Check stock availability
3. Update quantity
4. Recalculate totals
5. Return updated cart

---

#### DELETE `/api/cart/remove/:itemId`
**Mô tả**: Xóa sản phẩm khỏi giỏ hàng

**Business Logic:**
1. Remove item from cart
2. Recalculate totals
3. Return updated cart

---

#### DELETE `/api/cart/clear`
**Mô tả**: Xóa toàn bộ giỏ hàng

---

### 4. **Order Service**

#### POST `/api/orders`
**Mô tả**: Tạo đơn hàng mới

**Request Body:**
```json
{
  "items": [
    {
      "productId": "string",
      "quantity": 2
    }
  ],
  "shippingAddressId": "string",
  "paymentMethod": "cod",
  "couponCode": "string (optional)",
  "customerNote": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "string",
      "orderNumber": "ORD-2024-001234",
      "items": [ ... ],
      "totalAmount": 2000000,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "date"
    }
  }
}
```

**Business Logic:**
1. Validate cart items
2. Check stock availability cho từng item
3. Calculate subtotal
4. Apply shipping fee (based on address)
5. Apply coupon (if valid)
6. Calculate tax
7. Calculate totalAmount
8. Generate orderNumber (ORD-YYYY-XXXXXX)
9. Create order với status: 'pending'
10. Reduce product stock
11. Clear cart
12. Create payment record
13. Send confirmation email (async)
14. Return order details

**Error Cases:**
- `400`: Giỏ hàng trống
- `400`: Sản phẩm hết hàng
- `400`: Coupon không hợp lệ
- `400`: Địa chỉ giao hàng không hợp lệ

---

#### GET `/api/orders`
**Mô tả**: Lấy danh sách đơn hàng của user

**Query Parameters:**
```
?status=pending
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "string",
        "orderNumber": "string",
        "items": [ ... ],
        "totalAmount": 2000000,
        "status": "pending",
        "paymentStatus": "paid",
        "createdAt": "date"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### GET `/api/orders/:id`
**Mô tả**: Lấy chi tiết đơn hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "string",
      "orderNumber": "string",
      "items": [ ... ],
      "shippingAddress": { ... },
      "status": "shipping",
      "statusHistory": [
        {
          "status": "pending",
          "updatedAt": "date"
        }
      ],
      "payment": {
        "method": "cod",
        "status": "pending"
      },
      "trackingNumber": "string",
      "createdAt": "date"
    }
  }
}
```

---

#### PUT `/api/orders/:id/cancel`
**Mô tả**: Hủy đơn hàng

**Request Body:**
```json
{
  "reason": "string"
}
```

**Business Logic:**
1. Find order by ID
2. Check if user owns order
3. Check if order can be cancelled (status: pending/confirmed)
4. Set status = 'cancelled'
5. Restore product stock
6. Process refund nếu đã thanh toán
7. Send cancellation email
8. Return updated order

---

### 5. **Review Service**

#### POST `/api/reviews`
**Mô tả**: Tạo đánh giá sản phẩm

**Request Body:**
```json
{
  "productId": "string",
  "orderId": "string",
  "rating": 5,
  "title": "string (optional)",
  "comment": "string",
  "images": ["url1", "url2"]
}
```

**Business Logic:**
1. Verify order exists và belongs to user
2. Verify order contains product
3. Check if review already exists
4. Validate rating (1-5)
5. Create review với status: 'pending'
6. Auto-approve nếu verified purchase
7. Update product rating statistics (async)
8. Send notification to admin (async)
9. Return created review

---

#### GET `/api/products/:productId/reviews`
**Mô tả**: Lấy đánh giá của sản phẩm

**Query Parameters:**
```
?rating=5
&sort=helpful|newest|oldest|highest|lowest
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [ ... ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 120,
      "ratingDistribution": {
        "5": 60,
        "4": 40,
        "3": 15,
        "2": 3,
        "1": 2
      }
    },
    "pagination": { ... }
  }
}
```

---

#### POST `/api/reviews/:id/helpful`
**Mô tả**: Đánh dấu review là hữu ích

**Business Logic:**
1. Find review
2. Check if user already voted
3. Increment helpfulCount
4. Add userId to helpfulUsers
5. Return updated review

---

### 6. **Wishlist Service**

#### GET `/api/wishlist`
**Mô tả**: Lấy danh sách yêu thích

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "string",
        "product": { ... },
        "addedAt": "date"
      }
    ],
    "total": 10
  }
}
```

---

#### POST `/api/wishlist/add`
**Mô tả**: Thêm vào danh sách yêu thích

**Request Body:**
```json
{
  "productId": "string"
}
```

**Business Logic:**
1. Check if product exists
2. Check if already in wishlist
3. Add to wishlist
4. Return success

---

#### DELETE `/api/wishlist/remove/:productId`
**Mô tả**: Xóa khỏi danh sách yêu thích

---

### 7. **Coupon Service**

#### POST `/api/coupons/apply`
**Mô tả**: Áp dụng mã giảm giá

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "cartTotal": 2000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "SUMMER2024",
      "discountType": "percentage",
      "discountValue": 20,
      "discountAmount": 400000
    }
  }
}
```

**Business Logic:**
1. Find coupon by code
2. Check if coupon is active
3. Check validity dates
4. Check usage limits
5. Check minimum purchase amount
6. Check if user eligible
7. Calculate discount amount
8. Return coupon info

**Error Cases:**
- `400`: Mã giảm giá không tồn tại
- `400`: Mã giảm giá đã hết hạn
- `400`: Mã giảm giá đã hết lượt sử dụng
- `400`: Không đủ điều kiện áp dụng

---

### 8. **User Profile Service**

#### GET `/api/users/profile`
**Mô tả**: Lấy thông tin profile

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "phone": "string",
      "avatar": "string",
      "dateOfBirth": "date",
      "gender": "string",
      "address": { ... },
      "playingLevel": "intermediate",
      "totalOrders": 10,
      "totalSpent": 5000000,
      "loyaltyPoints": 500
    }
  }
}
```

---

#### PUT `/api/users/profile`
**Mô tả**: Cập nhật profile

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "date",
  "gender": "string",
  "playingLevel": "advanced"
}
```

---

#### PUT `/api/users/password`
**Mô tả**: Đổi mật khẩu

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Business Logic:**
1. Verify current password
2. Validate new password strength
3. Hash new password
4. Update password
5. Optional: Invalidate all sessions
6. Return success

---

### 9. **Address Service**

#### GET `/api/addresses`
**Mô tả**: Lấy danh sách địa chỉ

---

#### POST `/api/addresses`
**Mô tả**: Thêm địa chỉ mới

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "street": "string",
  "ward": "string",
  "district": "string",
  "city": "string",
  "isDefault": true,
  "label": "Nhà"
}
```

---

#### PUT `/api/addresses/:id`
**Mô tả**: Cập nhật địa chỉ

---

#### DELETE `/api/addresses/:id`
**Mô tả**: Xóa địa chỉ

---

## ✅ Validation Rules

### Email
- Format: Valid email regex
- Unique trong database

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Special characters recommended

### Phone (Vietnamese)
- Format: 10-11 digits
- Start with 0 or +84

### Price
- Must be positive number
- Minimum: 1000 VND
- Maximum: 100,000,000 VND

### Stock
- Must be non-negative integer
- Cannot exceed 999,999

### Rating
- Must be integer between 1 and 5

---

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional additional details
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `BAD_REQUEST`: Invalid request
- `INTERNAL_ERROR`: Server error
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## 📊 Rate Limiting

- **Login**: 5 attempts per 15 minutes per IP
- **Register**: 3 attempts per hour per IP
- **Forgot Password**: 3 attempts per hour per IP
- **API Calls**: 100 requests per minute per user
- **Search**: 30 requests per minute per IP

---

**Tài liệu này sẽ được cập nhật khi có thay đổi.**




