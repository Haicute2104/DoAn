'use client';

import { getCart, updateCartItem, removeCartItem } from "@/components/services/cart.services";
import { useEffect, useState, useCallback } from "react";
import { ICartItem } from "@/types/cart.type";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { Card } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Separator } from "@/components/UI/separator";
import { Input } from "@/components/UI/input";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import Link from "next/link";

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + ' VNĐ';
}

export default function CartPage() {
  const { user, loading, openLoginModal } = useAuth();
  const { showAlert } = useAlert();
  const [dataCart, setDataCart] = useState<ICartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [promoCode, setPromoCode] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart();
      setDataCart(res.cart?.items ?? []);
    } catch {
      setDataCart([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCartLoading(false);
      openLoginModal();
      return;
    }

    fetchCart();
  }, [user, loading, openLoginModal, fetchCart]);

  const itemKey = (item: ICartItem) => `${item.productId}-${item.size}`;

  const handleUpdateQuantity = async (item: ICartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    const key = itemKey(item);
    setUpdatingItems(prev => new Set(prev).add(key));

    setDataCart(prev =>
      prev.map(i =>
        i.productId === item.productId && i.size === item.size
          ? { ...i, quantity: newQty }
          : i
      )
    );

    try {
      await updateCartItem(item.productId, item.size, newQty);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật thất bại';
      showAlert('error', message);
      await fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleRemoveItem = async (item: ICartItem) => {
    const key = itemKey(item);
    setUpdatingItems(prev => new Set(prev).add(key));

    setDataCart(prev =>
      prev.filter(i => !(i.productId === item.productId && i.size === item.size))
    );

    try {
      await removeCartItem(item.productId, item.size);
      showAlert('success', 'Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa thất bại';
      showAlert('error', message);
      await fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const subtotal = dataCart.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const shippingFee = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shippingFee;

  if (loading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Đang tải giỏ hàng..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">Vui lòng đăng nhập để xem giỏ hàng</p>
        <Button onClick={openLoginModal}>Đăng nhập</Button>
      </div>
    );
  }

  if (dataCart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">Giỏ hàng trống</p>
        <p className="text-sm text-gray-400">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Button asChild>
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Giỏ hàng của bạn
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <div className="p-0 sm:p-2">
                {dataCart.map((item, index) => {
                  const key = itemKey(item);
                  const isUpdating = updatingItems.has(key);

                  return (
                    <div key={key}>
                      <div className={`flex flex-col sm:flex-row p-4 gap-4 sm:gap-6 items-start sm:items-center transition-opacity ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* Ảnh */}
                        <Link
                          href={`/products/${item.product?._id ?? item.productId}`}
                          className="shrink-0 rounded-md bg-gray-100 border border-gray-200 overflow-hidden w-24 h-24 sm:w-28 sm:h-28"
                        >
                          {item.product?.thumbnail?.url ? (
                            <img
                              src={item.product.thumbnail.url}
                              alt={item.product.name}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </Link>

                        {/* Thông tin */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex justify-between items-start mb-1">
                            <div className="w-[70%]">
                              <h3 className="text-base font-medium text-gray-800 truncate ">
                                {item.product?.name ?? 'Sản phẩm'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                            </div>
                            {item.product?.price != null && (
                              <p className="text-base font-medium text-gray-800 hidden sm:block">
                                {formatCurrency(item.product.price * item.quantity)}
                              </p>
                            )}
                          </div>

                          {item.product?.price != null && (
                            <p className="text-base font-medium text-gray-900 sm:hidden mt-2 mb-4">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button
                                onClick={() => handleUpdateQuantity(item, -1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-l-md disabled:opacity-50"
                                disabled={item.quantity <= 1 || isUpdating}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <div className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleUpdateQuantity(item, 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-r-md disabled:opacity-50"
                                disabled={isUpdating}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                              onClick={() => handleRemoveItem(item)}
                              disabled={isUpdating}
                            >
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Xóa</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < dataCart.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Tổng kết đơn hàng */}
          <div className="lg:col-span-4 sticky top-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan đơn hàng</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({dataCart.length} sản phẩm)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Mã giảm giá"
                        className="pl-9"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                    </div>
                    <Button variant="secondary">Áp dụng</Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center text-base font-semibold text-gray-900 mb-6">
                  <span>Tổng cộng</span>
                  <span className="text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button className="w-full text-base h-12" asChild>
                <Link href="/checkout">
                  Tiến hành thanh toán
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Thuế và phí vận chuyển thực tế sẽ được tính tại bước thanh toán.
              </p>
            </Card>

            <div className="mt-6 text-sm text-gray-500 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p>Miễn phí đổi trả trong vòng 30 ngày.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p>Thanh toán bảo mật và an toàn 100%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
