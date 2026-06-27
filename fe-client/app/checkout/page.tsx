"use client";

import { getCart } from "@/components/services/cart.services";
import { ICart } from "@/types/cart.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  BookUser,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { Separator } from "@/components/UI/separator";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import AddressPicker, {
  type AddressValue,
} from "@/components/UI/AddressPicker";
import {
  createOrder,
  createMomoPayment,
  reserveStock,
  releaseStockReservation,
} from "@/components/services/order.services";
import { getListAddress } from "@/components/services/user.services";
import { IOrder } from "@/types/order.type";
import { IAddress } from "@/types/user.type";
import {
  getFirstError,
  sanitizePhoneInput,
  validateAddressForm,
  validateEmail,
  validateNote,
} from "@/lib/validation";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " VNĐ";
}

type PaymentMethod = "cod" | "momo";

export default function CheckoutPage() {
  const { user, loading, openLoginModal } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [dataCart, setDataCart] = useState<ICart>({} as ICart);
  const [cartLoading, setCartLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formFullName, setFormFullName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNote, setFormNote] = useState("");

  const [address, setAddress] = useState<AddressValue>({
    province: "",
    ward: "",
    street: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showAddressList, setShowAddressList] = useState(false);
  const [addressDefault, setAddressDefault] = useState<
    AddressValue | undefined
  >(undefined);
  const [addressReady, setAddressReady] = useState(false);

  // ── Stock Reservation ──
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [reserving, setReserving] = useState(false);
  const reservationRef = useRef<string | null>(null);
  const reserveAttempted = useRef(false);
  const expiryRef = useRef<number>(0);

  useEffect(() => {
    if (user) {
      setFormFullName(user.fullName ?? "");
      setFormPhone(sanitizePhoneInput(user.phone ?? ""));
      setFormEmail(user.email ?? "");
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart();
      setDataCart(res.cart);
    } catch {
      setDataCart({} as ICart);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const applyAddress = useCallback((addr: IAddress) => {
    if (addr.fullName) setFormFullName(addr.fullName);
    if (addr.phone) setFormPhone(addr.phone);

    const newAddr: AddressValue = {
      province: addr.province ?? "",
      ward: addr.ward ?? "",
      street: addr.street ?? "",
    };
    setAddressDefault(newAddr);
    setAddress(newAddr);
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await getListAddress();
      const addresses: IAddress[] = res.address ?? [];
      setSavedAddresses(addresses);

      const defaultAddr = addresses.find((a: IAddress) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        applyAddress(defaultAddr);
      }
    } catch {
      setSavedAddresses([]);
    } finally {
      setAddressReady(true);
    }
  }, [applyAddress]);

  const handleSelectAddress = (addr: IAddress) => {
    setSelectedAddressId(addr._id);
    applyAddress(addr);
    setShowAddressList(false);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCartLoading(false);
      openLoginModal();
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses, loading, openLoginModal, user]);

  // ── Reserve stock khi cart đã load (chỉ gọi 1 lần) ──
  useEffect(() => {
    if (
      !dataCart?.items?.length ||
      reservationRef.current ||
      reserveAttempted.current
    )
      return;

    reserveAttempted.current = true;

    const doReserve = async () => {
      setReserving(true);
      try {
        const res = await reserveStock(
          dataCart.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        );
        setReservationId(res.reservationId);
        reservationRef.current = res.reservationId;
        expiryRef.current = Date.now() + res.expiresIn * 1000;
        setCountdown(res.expiresIn);
      } catch (err) {
        showAlert(
          "error",
          err instanceof Error
            ? err.message
            : "Sản phẩm đã hết hàng, vui lòng quay lại giỏ hàng",
        );
        router.push("/cart");
      } finally {
        setReserving(false);
      }
    };

    doReserve();
  }, [dataCart, showAlert, router]);

  // ── Countdown timer ──
  useEffect(() => {
    if (!expiryRef.current) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((expiryRef.current - Date.now()) / 1000),
      );
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        showAlert("error", "Phiên giữ chỗ đã hết hạn. Vui lòng thử lại.");
        reservationRef.current = null;
        router.push("/cart");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationId, showAlert, router]);

  // ── Cleanup: hủy reservation khi rời trang (SPA navigation) ──
  useEffect(() => {
    return () => {
      if (reservationRef.current) {
        releaseStockReservation(reservationRef.current);
        reservationRef.current = null;
      }
    };
  }, []);

  const subtotal = dataCart?.items?.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  );
  const shippingFee = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shippingFee;

  const countdownMin = Math.floor(countdown / 60);
  const countdownSec = countdown % 60;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataCart?.items || dataCart.items.length === 0) {
      showAlert("error", "Giỏ hàng trống");
      return;
    }

    const errors = validateAddressForm({
      fullName: formFullName,
      phone: formPhone,
      address,
    });

    const emailResult = validateEmail(formEmail, { required: false });
    if (!emailResult.valid) errors.email = emailResult.message;

    const noteResult = validateNote(formNote);
    if (!noteResult.valid) errors.note = noteResult.message;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showAlert("error", getFirstError(errors) ?? "Vui lòng kiểm tra lại thông tin");
      return;
    }

    setFieldErrors({});

    if (!reservationId) {
      showAlert("error", "Phiên giữ chỗ đã hết hạn. Vui lòng quay lại giỏ hàng.");
      router.push("/cart");
      return;
    }

    const formData = {
      fullName: formFullName.trim(),
      phone: sanitizePhoneInput(formPhone),
      email: formEmail.trim(),
      address: {
        province: address.province,
        ward: address.ward,
        street: address.street,
      },
      note: formNote,
      paymentMethod,
      reservationId,
      items: dataCart.items.map((item) => ({
        productId: item.productId,
        name: item.product?.name,
        size: item.size,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await createOrder(
        formData as unknown as IOrder,
        dataCart._id as string,
      );

      // Đã confirm thành công → không cần release nữa
      reservationRef.current = null;

      if (response.status === 201) {
        if (paymentMethod === "momo") {
          try {
            const momoRes = await createMomoPayment(
              total,
              response.order._id,
            );
            if (momoRes.payUrl) {
              window.location.href = momoRes.payUrl;
              return;
            }
            showAlert(
              "error",
              "Không thể tạo thanh toán MoMo, đơn hàng đã được tạo với trạng thái chưa thanh toán.",
            );
          } catch {
            showAlert(
              "error",
              "Thanh toán MoMo thất bại, đơn hàng đã được tạo. Vui lòng thanh toán lại trong lịch sử đơn hàng.",
            );
          }
          router.push("/profile/order-history");
        } else {
          showAlert("success", "Đặt hàng thành công!");
          router.push("/profile/order-history");
        }
      } else {
        showAlert("error", "Đặt hàng thất bại, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Create order error:", error);
      const message =
        error instanceof Error ? error.message : "Đặt hàng thất bại, vui lòng thử lại";
      showAlert("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || cartLoading || !addressReady || reserving) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Đang tải trang thanh toán..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">
          Vui lòng đăng nhập để thanh toán
        </p>
        <Button onClick={openLoginModal}>Đăng nhập</Button>
      </div>
    );
  }

  if (dataCart?.items?.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">Giỏ hàng trống</p>
        <Button asChild>
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8] pb-24 font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 text-stone-500 hover:text-stone-900"
            asChild
          >
            <Link href="/cart">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Quay lại giỏ hàng
            </Link>
          </Button>
          <div className="mx-auto font-serif text-xl tracking-wide text-stone-800 pr-20 sm:pr-24">
            Thanh Toán
          </div>
        </div>
      </header>

      {/* Countdown banner */}
      {countdown > 0 && (
        <div
          className={`border-b py-2.5 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 ${
            countdown <= 60
              ? "bg-red-50 border-red-100 text-red-700"
              : countdown <= 180
                ? "bg-amber-50 border-amber-100 text-amber-700"
                : "bg-stone-50 border-stone-100 text-stone-600"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>
            Sản phẩm được giữ trong{" "}
            <span className="font-bold tabular-nums">
              {countdownMin}:{countdownSec.toString().padStart(2, "0")}
            </span>
          </span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          {/* Cột Trái: Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Thông tin nhận hàng */}
            <section className="bg-white p-6 sm:p-8 rounded-xl border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-stone-400" />
                  <h2 className="text-xl font-serif text-stone-800">
                    Thông tin nhận hàng
                  </h2>
                </div>

                {savedAddresses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => setShowAddressList(!showAddressList)}
                  >
                    <BookUser className="h-3.5 w-3.5" />
                    Chọn địa chỉ đã lưu
                  </Button>
                )}
              </div>

              {/* Danh sách địa chỉ đã lưu */}
              {showAddressList && savedAddresses.length > 0 && (
                <div className="mb-6 space-y-2 p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-sm font-medium text-stone-600 mb-3">
                    Chọn địa chỉ:
                  </p>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAddressId === addr._id
                          ? "border-stone-800 bg-white"
                          : "border-stone-200 bg-white hover:border-stone-400"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-800">
                              {addr.fullName}
                            </span>
                            <span className="text-xs text-stone-500">|</span>
                            <span className="text-sm text-stone-600">
                              {addr.phone}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 text-white rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-1 font-light">
                            {[addr.street, addr.ward, addr.province]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                        {selectedAddressId === addr._id && (
                          <Check className="h-4 w-4 text-stone-800 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullname">Họ và tên</Label>
                  <Input
                    id="fullname"
                    placeholder="Nhập họ và tên đầy đủ..."
                    required
                    maxLength={50}
                    value={formFullName}
                    onChange={(e) => {
                      setFormFullName(e.target.value);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.fullName;
                        return next;
                      });
                    }}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-500">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0xxxxxxxxx"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(sanitizePhoneInput(e.target.value));
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.phone;
                        return next;
                      });
                    }}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Tuỳ chọn)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    maxLength={100}
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <AddressPicker
                    key={selectedAddressId ?? "default"}
                    onChange={(value) => {
                      setAddress(value);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.province;
                        delete next.ward;
                        delete next.street;
                        return next;
                      });
                    }}
                    defaultValue={addressDefault}
                  />
                  {(fieldErrors.province ||
                    fieldErrors.ward ||
                    fieldErrors.street) && (
                    <p className="mt-2 text-xs text-red-500">
                      {fieldErrors.province ||
                        fieldErrors.ward ||
                        fieldErrors.street}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="note">Ghi chú cho đơn hàng</Label>
                  <textarea
                    id="note"
                    rows={3}
                    maxLength={500}
                    className="flex w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 font-light resize-none"
                    placeholder="Ví dụ: Giao hàng vào giờ hành chính..."
                    value={formNote}
                    onChange={(e) => {
                      setFormNote(e.target.value);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.note;
                        return next;
                      });
                    }}
                  />
                  {fieldErrors.note && (
                    <p className="text-xs text-red-500">{fieldErrors.note}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Phương thức vận chuyển */}
            <section className="bg-white p-6 sm:p-8 rounded-xl border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="h-5 w-5 text-stone-400" />
                <h2 className="text-xl font-serif text-stone-800">
                  Phương thức vận chuyển
                </h2>
              </div>

              <div className="border border-stone-200 rounded-lg p-4 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-4 border-stone-800 bg-white" />
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      Giao hàng tiêu chuẩn
                    </p>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                      Dự kiến giao trong 2-4 ngày làm việc
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(shippingFee)}
                </span>
              </div>
            </section>

            {/* Phương thức thanh toán */}
            <section className="bg-white p-6 sm:p-8 rounded-xl border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-stone-400" />
                <h2 className="text-xl font-serif text-stone-800">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-stone-800 bg-stone-50/50" : "border-stone-200 hover:border-stone-300"}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "border-stone-800" : "border-stone-300"}`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="h-2 w-2 rounded-full bg-stone-800" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800 flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-stone-500" />
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-stone-500 font-light mt-1">
                      Khách hàng thanh toán bằng tiền mặt khi shipper giao hàng
                      tới.
                    </p>
                  </div>
                </label>

                {/* MoMo */}
                <label
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "momo" ? "border-[#ae2070] bg-pink-50/50" : "border-stone-200 hover:border-stone-300"}`}
                  onClick={() => setPaymentMethod("momo")}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === "momo" ? "border-[#ae2070]" : "border-stone-300"}`}
                  >
                    {paymentMethod === "momo" && (
                      <div className="h-2 w-2 rounded-full bg-[#ae2070]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#ae2070]" />
                      Ví MoMo
                    </p>
                    <p className="text-xs text-stone-500 font-light mt-1">
                      Thanh toán trực tuyến qua ví điện tử MoMo. Bạn sẽ được
                      chuyển đến trang quét mã QR của MoMo để thanh toán.
                    </p>

                    {paymentMethod === "momo" && (
                      <div className="mt-3 p-3 bg-white border border-pink-100 rounded text-xs text-stone-600 font-light leading-relaxed">
                        Sau khi nhấn{" "}
                        <span className="font-medium text-stone-800">
                          &ldquo;Thanh toán qua MoMo&rdquo;
                        </span>
                        , bạn sẽ được chuyển đến trang thanh toán MoMo để quét
                        mã QR hoặc đăng nhập ví MoMo.
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Cột Phải: Tổng quan đơn hàng */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-100 shadow-sm">
              <h2 className="text-xl font-serif text-stone-800 mb-6">
                Đơn hàng của bạn
              </h2>

              {/* Danh sách sản phẩm */}
              <div className="space-y-4 pt-2 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {dataCart?.items?.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4"
                  >
                    <div className="relative">
                      <div className="w-16 h-24 rounded bg-stone-50 border border-stone-100 overflow-hidden shrink-0">
                        {item.product?.thumbnail?.url ? (
                          <img
                            src={item.product.thumbnail.url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="text-sm font-medium text-stone-800 line-clamp-2">
                        {item.product?.name ?? "Sản phẩm"}
                      </h3>
                      <p className="text-xs text-stone-500 font-light mt-1">
                        Size: {item.size}
                      </p>
                      <p className="text-sm font-medium text-stone-800 mt-2">
                        {formatCurrency(
                          (item.product?.price ?? 0) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4 bg-stone-100" />

              {/* Tính tiền */}
              <div className="space-y-3 text-sm font-light text-stone-600">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="text-stone-800">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-stone-800">
                    {formatCurrency(shippingFee)}
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-stone-100" />

              <div className="flex justify-between items-end mb-6">
                <span className="font-serif text-lg text-stone-900">
                  Tổng cộng
                </span>
                <span className="text-2xl font-medium tracking-tight text-stone-900">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button
                type="submit"
                className={`w-full h-12 text-base ${
                  paymentMethod === "momo"
                    ? "bg-[#ae2070] hover:bg-[#8f1a5c]"
                    : ""
                }`}
                disabled={isSubmitting || !reservationId}
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : paymentMethod === "momo"
                    ? "Thanh toán qua MoMo"
                    : "Hoàn tất đặt hàng"}
              </Button>

              <div className="mt-6 flex items-start gap-2 text-xs text-stone-500 font-light justify-center">
                <ShieldCheck className="h-4 w-4 text-stone-400 shrink-0" />
                <p>Thông tin của bạn được bảo mật an toàn tuyệt đối.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
