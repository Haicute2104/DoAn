import { IOrder } from "@/types/order.type";
import Cookies from 'js-cookie';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('accessToken') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export const reserveStock = async (items: { productId: string; size: string; quantity: number }[]) => {
  const response = await fetch(`${API_URL}/order/reserve-stock`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể giữ chỗ sản phẩm");
  }
  return data as { reservationId: string; expiresIn: number };
};

export const releaseStockReservation = async (reservationId: string) => {
  try {
    await fetch(`${API_URL}/order/release-stock`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reservationId }),
      keepalive: true,
    });
  } catch {
    // best-effort, cron job sẽ dọn nếu fail
  }
};

export const createOrder = async (order: IOrder, idCart: string) => {
  const response = await fetch(`${API_URL}/order/${idCart}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create order");
  }
  return response.json();
};

export const getOrders = async () => {
  const response = await fetch(`${API_URL}/order`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error("Failed to get orders");
  }
  return response.json();
}

export const cancelOrder = async (orderId: string) => {
  const response = await fetch(`${API_URL}/order/${orderId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to cancel order");
  }
  return response.json();
}

export const checkRetryPayment = async (orderId: string) => {
  const response = await fetch(`${API_URL}/order/${orderId}/retry-payment`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const createMomoPayment = async (amount: number, orderId: string) => {
  const response = await fetch(`${API_URL}/payment/momo/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, orderId }),
  });
  if (!response.ok) {
    let errorMessage = "Failed to create MoMo payment";
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // keep default message when response body is not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<{ payUrl: string }>;
}
