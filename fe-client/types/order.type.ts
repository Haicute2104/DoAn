// =====================================================
// Trang checkout
// =====================================================
interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  shipping: number;
}
export interface IOrder {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
  items: IOrderItem[];
  totalAmount: number;
  totalQuantity: number;
  totalPrice: number;
  totalDiscount: number;
  totalTax: number;
  totalShipping: number;
}

// =====================================================
// Trang order history
// =====================================================

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  tax: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerNote: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}



export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface StatusHistory {
  status?: string;
  note?: string;
  createdAt?: string;
}