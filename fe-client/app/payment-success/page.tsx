"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import {
  checkRetryPayment,
  createMomoPayment,
} from "@/components/services/order.services";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " VNĐ";
}

function PaymentResult() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const resultCode = searchParams.get("resultCode");
  const message = searchParams.get("message");
  const amount = searchParams.get("amount");
  const transId = searchParams.get("transId");
  const extraData = searchParams.get("extraData");

  let orderId = "";
  if (extraData) {
    try {
      const decoded = JSON.parse(atob(extraData));
      orderId = decoded.orderId ?? "";
    } catch {
      orderId = "";
    }
  }

  const isSuccess = resultCode === "0";
  const amountNumber = amount ? parseInt(amount, 10) : 0;
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    if (!isSuccess) return;

    const timer = window.setTimeout(() => {
      router.push("/profile/order-history");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [isSuccess, router]);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetrying(true);
    setRetryError("");
    try {
      const checkRes = await checkRetryPayment(orderId);
      if (checkRes.status !== 200) {
        setRetryError(checkRes.message);
        return;
      }
      const momoRes = await createMomoPayment(amountNumber, orderId);
      if (momoRes.payUrl) {
        window.location.href = momoRes.payUrl;
        return;
      }
      setRetryError("Không thể tạo thanh toán MoMo");
    } catch {
      setRetryError("Thanh toán lại thất bại, vui lòng thử lại");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
        {isSuccess ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-serif text-stone-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-sm text-stone-500 font-light mb-6">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được thanh toán
              thành công qua MoMo.
            </p>
            <p className="text-xs text-stone-400 mb-4">
              Hệ thống sẽ tự động chuyển bạn đến trang lịch sử đơn hàng...
            </p>

            <div className="bg-stone-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              {transId && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-light">Mã giao dịch</span>
                  <span className="text-stone-800 font-medium">{transId}</span>
                </div>
              )}
              {amountNumber > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-light">Số tiền</span>
                  <span className="text-stone-800 font-medium">
                    {formatCurrency(amountNumber)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500 font-light">Trạng thái</span>
                <span className="text-green-600 font-medium">Đã thanh toán</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-serif text-stone-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-sm text-stone-500 font-light mb-6">
              {message || "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
            </p>

            {resultCode && (
              <div className="bg-stone-50 rounded-lg p-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-light">Mã lỗi</span>
                  <span className="text-stone-800 font-medium">{resultCode}</span>
                </div>
              </div>
            )}

            {retryError && (
              <p className="text-sm text-red-500 mb-4">{retryError}</p>
            )}
          </>
        )}

        <div className="flex flex-col gap-3">
          {!isSuccess && orderId && (
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="w-full h-11 gap-2 bg-[#ae2070] hover:bg-[#8f1a5c]"
            >
              <Wallet className="h-4 w-4" />
              {retrying ? "Đang xử lý..." : "Thanh toán lại qua MoMo"}
            </Button>
          )}

          <Button asChild className="w-full h-11 gap-2">
            <Link href="/profile/order-history">
              <ShoppingBag className="h-4 w-4" />
              Xem đơn hàng
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-11 gap-2">
            <Link href="/products">
              Tiếp tục mua sắm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFAF8] flex items-center justify-center">
          <p className="text-stone-500">Đang xử lý kết quả thanh toán...</p>
        </div>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}
