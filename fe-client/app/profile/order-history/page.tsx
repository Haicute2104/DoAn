"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CircleCheck,
  CircleDotDashed,
  CircleX,
  PackageCheck,
  Truck,
  Wallet,
} from "lucide-react";

import {
  getOrders,
  cancelOrder,
  checkRetryPayment,
  createMomoPayment,
} from "@/components/services/order.services";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { Order } from "@/types/order.type";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { Button } from "@/components/UI/button";

function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const { showAlert } = useAlert();

  useEffect(() => {
    fetchOrders();
  }, []);

  console.log(orders);

  const fetchOrders = async () => {
    setLoading(true);

    const res = await getOrders();

    if (res.status === 200) {
      setOrders(res.orders);
    }

    setLoading(false);
  };

  const openCancelDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    try {
      const res = await cancelOrder(selectedOrderId);

      fetchOrders();
      setOpenDialog(false);
      setSelectedOrderId(null);
      setCancellingId(null);
      showAlert("success", res.message);
    } catch {
      showAlert("error", "Hủy đơn hàng thất bại.");
    }
  };

  const handleRetryPayment = async (order: Order) => {
    setRetryingId(order._id);
    try {
      const checkRes = await checkRetryPayment(order._id);
      if (checkRes.status !== 200) {
        showAlert("error", checkRes.message);
        fetchOrders();
        return;
      }

      const momoRes = await createMomoPayment(order.totalAmount, order._id);
      if (momoRes.payUrl) {
        window.location.href = momoRes.payUrl;
        return;
      }
      showAlert("error", "Không thể tạo thanh toán MoMo");
    } catch {
      showAlert("error", "Thanh toán lại thất bại, vui lòng thử lại");
    } finally {
      setRetryingId(null);
    }
  };

  const canRetryPayment = (order: Order) => {
    if (order.status !== "pending") return false;
    if (order.paymentMethod !== "momo") return false;
    if (order.paymentStatus === "paid") return false;
    const hoursSince =
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSince <= 24;
  };

  const formattedDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const statusOrder = [
    {
      label: "Đang chờ",
      value: "pending",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: <CircleDotDashed size={16} />,
    },
    {
      label: "Đã xác nhận",
      value: "confirmed",
      textColor: "text-green-600",
      bgColor: "bg-green-100",
      icon: <CircleCheck size={16} />,
    },
    {
      label: "Đang giao hàng",
      value: "shipped",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: <Truck size={16} />,
    },
    {
      label: "Đã giao hàng",
      value: "delivered",
      textColor: "text-green-600",
      bgColor: "bg-green-100",
      icon: <PackageCheck size={16} />,
    },
    {
      label: "Đã hủy",
      value: "cancelled",
      textColor: "text-red-600",
      bgColor: "bg-red-100",
      icon: <CircleX size={16} />,
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <LoadingSpinner label="Đang tải..." />
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6">
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-2xl text-brand-dark">
            Lịch sử đơn hàng của bạn
          </h2>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = statusOrder.find(
              (item) => item.value === order.status,
            );

            return (
              <div key={order._id} className="border p-4 rounded space-y-4">
                {/* header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">Mã đơn hàng #</span>

                    <span className="font-semibold">{order.orderNumber}</span>

                    <span className="text-gray-400">|</span>

                    <span className="text-sm text-gray-500">
                      {formattedDate(order.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-3 py-1 ${statusInfo?.bgColor} ${statusInfo?.textColor}`}
                  >
                    {statusInfo?.icon}
                    <span className="font-medium">{statusInfo?.label}</span>
                  </div>
                </div>

                {/* items */}
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition"
                  >
                    <div className="p-6 flex gap-6">
                      <div className="w-24 h-32 bg-gray-100 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-grow flex justify-between">
                        <div>
                          <h4 className="font-serif text-lg mb-1">
                            {item.name}
                          </h4>

                          <p className="text-sm text-gray-500">
                            Phân loại: {item.size}
                          </p>

                          <p className="text-sm text-gray-500">
                            Số lượng: {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-gray-400 line-through text-sm">
                            {item.price.toLocaleString("vi-VN")} VNĐ
                          </p>

                          <p className="font-medium text-brand-red">
                            {item.price.toLocaleString("vi-VN")} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 p-6">
                      * Phương thức thanh toán:{" "}
                      <span className="text-[#F03838] font-semibold">
                        {order.paymentMethod === "momo"
                          ? "Ví MoMo"
                          : "Thanh toán khi nhận hàng (COD)"}
                      </span>{" "}
                    </p>
                  </div>
                ))}

                {/* footer */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    Thành tiền:
                    <span className="text-xl text-brand-red ml-2">
                      {order.subtotal.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {canRetryPayment(order) && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={retryingId === order._id}
                        className="border border-[#ae2070] text-[#ae2070] px-6 py-2 hover:bg-pink-50 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Wallet size={16} />
                        {retryingId === order._id
                          ? "Đang xử lý..."
                          : "Thanh toán lại"}
                      </button>
                    )}

                    {(order.status === "pending" ||
                      order.status === "confirmed") && (
                      <button
                        onClick={() => openCancelDialog(order._id)}
                        disabled={cancellingId === order._id}
                        className="border border-red-300 text-red-600 px-6 py-2 hover:bg-red-50 disabled:opacity-50"
                      >
                        {cancellingId === order._id ? "Đang hủy..." : "Hủy đơn"}
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button className="border border-blue-300 text-blue-600 px-6 py-2 hover:bg-blue-50 flex items-center gap-2">
                        <Truck size={16} />
                        Theo dõi
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <>
                        <button className="border px-6 py-2">Đánh giá</button>

                        <button className="border border-brand-red text-brand-red px-6 py-2 hover:bg-brand-red hover:text-white">
                          Mua lại
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* cancel dialog */}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>

            <DialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này không?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setOpenDialog(false)}
              className="rounded-none border-0"
            >
              Đóng
            </Button>

            <Button
              onClick={handleCancelOrder}
              className="rounded-none bg-white text-[#F03838] border border-[#F03838]"
            >
              Xác nhận hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrderHistoryPage;
