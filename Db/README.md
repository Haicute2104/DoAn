# 📚 Database & System Design Documentation

## 📋 Mục Lục

1. [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - ⭐ **Kiến trúc Database (Database per Service)** - ĐỌC TRƯỚC
2. [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) - Thiết kế database chi tiết (Schemas cho từng collection)
3. [FEATURES_IMPLEMENTATION.md](./FEATURES_IMPLEMENTATION.md) - Chức năng chi tiết và API endpoints
4. [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Hướng dẫn Authentication với Bcrypt & JWT
5. [MONGODB_SCHEMAS.ts](./MONGODB_SCHEMAS.ts) - MongoDB Schemas với TypeScript (ready to use)

---

## 🎯 Tổng Quan

Thư mục này chứa tất cả tài liệu thiết kế database và hệ thống cho **Hệ Thống Bán Đồ Dùng Thể Thao** với trọng tâm là **Cầu Lông**.

### Công Nghệ Sử Dụng
- **Database**: MongoDB (NoSQL)
- **Backend**: Express.js, Next.js, React
- **Architecture**: Microservices
- **Authentication**: Bcrypt + JWT

---

## 📖 Tài Liệu Chi Tiết

### 1. DATABASE_DESIGN.md

Tài liệu này mô tả chi tiết:
- ✅ 13 Collections trong MongoDB
- ✅ Schema chi tiết cho từng collection
- ✅ Relationships giữa các collections
- ✅ Indexes và tối ưu performance
- ✅ Authentication & Security với Bcrypt
- ✅ Chức năng tổng quan

**Collections bao gồm:**
- `users` - Người dùng
- `products` - Sản phẩm (với đặc thù cầu lông)
- `categories` - Danh mục sản phẩm
- `orders` - Đơn hàng
- `cart` - Giỏ hàng
- `reviews` - Đánh giá sản phẩm
- `wishlist` - Danh sách yêu thích
- `addresses` - Địa chỉ giao hàng
- `payments` - Thanh toán
- `coupons` - Mã giảm giá
- `notifications` - Thông báo
- `sessions` - Phiên đăng nhập

---

### 2. FEATURES_IMPLEMENTATION.md

Tài liệu này mô tả chi tiết:
- ✅ Tất cả API endpoints
- ✅ Request/Response formats
- ✅ Business logic cho từng chức năng
- ✅ Validation rules
- ✅ Error handling
- ✅ Rate limiting

**Các chức năng chính:**
1. Authentication & Authorization
2. Product Management
3. Shopping Cart
4. Order Management
5. Payment Processing
6. Review & Rating
7. Wishlist
8. Coupon Management
9. User Profile
10. Address Management
11. Admin Functions

---

### 3. AUTHENTICATION_GUIDE.md

Tài liệu này mô tả chi tiết:
- ✅ Bcrypt implementation
- ✅ JWT implementation
- ✅ Code examples đầy đủ
- ✅ Security best practices
- ✅ Middleware examples

**Nội dung bao gồm:**
- Hash password với Bcrypt
- Verify password
- Generate Access Token & Refresh Token
- Verify tokens
- Complete authentication service
- Express middleware
- Security best practices

---

## 🚀 Quick Start

### 1. Đọc Kiến Trúc Database (QUAN TRỌNG)

**Bắt đầu với [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** để hiểu:
- ✅ Database per Service pattern
- ✅ Cách tổ chức databases trong Microservices
- ✅ Mỗi service có database riêng (KHÔNG phải tất cả trong một database)
- ✅ Connection strings và configuration

### 2. Đọc Thiết Kế Database Chi Tiết

Sau đó đọc [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) để hiểu:
- Cấu trúc chi tiết từng collection
- Schemas và relationships
- Indexes và performance optimization

### 2. Xem Chức Năng Chi Tiết

Đọc [FEATURES_IMPLEMENTATION.md](./FEATURES_IMPLEMENTATION.md) để biết:
- Các API endpoints cần implement
- Business logic cho từng chức năng
- Validation và error handling

### 3. Implement Authentication

Tham khảo [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) để:
- Implement Bcrypt cho password hashing
- Implement JWT cho authentication
- Setup security best practices

### 4. Sử Dụng MongoDB Schemas

Sử dụng [MONGODB_SCHEMAS.ts](./MONGODB_SCHEMAS.ts) để:
- Import các schemas đã được định nghĩa sẵn
- Sử dụng trực tiếp trong dự án với TypeScript
- Bao gồm: User, Category, Product, Order, Cart, Review

---

## 📊 Database Schema Overview

### Core Collections

```
users (1) ──┬── orders (N)
            ├── cart (1)
            ├── reviews (N)
            ├── wishlist (N)
            ├── addresses (N)
            └── payments (N)

products (1) ──┬── orders.items (N)
               ├── cart.items (N)
               ├── reviews (N)
               └── wishlist (N)

categories (1) ─── products (N)

orders (1) ──┬── payments (1)
             └── reviews (N)
```

---

## 🔐 Authentication Flow

```
1. Register → Hash password (bcrypt) → Create user → Send verification email
2. Login → Verify password (bcrypt) → Generate JWT tokens → Return tokens
3. Access API → Verify JWT token → Allow/Deny request
4. Refresh Token → Verify refresh token → Generate new access token
5. Logout → Invalidate refresh token
```

---

## 🎯 Đặc Thù Cầu Lông

Hệ thống được thiết kế đặc biệt cho sản phẩm cầu lông với các thuộc tính:

### Vợt Cầu Lông (Rackets)
- Weight (3U, 4U, 5U)
- Balance (head-heavy, even, head-light)
- String Tension
- Frame Material
- Shaft Flexibility
- Grip Size

### Cầu Lông (Shuttlecocks)
- Type (feather, plastic, nylon)
- Speed (76, 77, 78, 79)
- Quantity per box
- Feather Grade

### Giày Cầu Lông (Shoes)
- Size variants
- Gender (male, female, unisex)
- Sole Material
- Upper Material
- Cushioning

---

## 📝 Notes

- Tất cả timestamps sử dụng **UTC**
- Currency mặc định: **VND** (Vietnamese Dong)
- Language: **Vietnamese**
- Timezone: **Asia/Ho_Chi_Minh** (UTC+7)

---

## 🔄 Updates

Tài liệu này sẽ được cập nhật khi có thay đổi trong hệ thống.

**Last Updated**: 2024

---

## 📞 Support

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.

