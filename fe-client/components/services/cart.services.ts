import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/client";

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('accessToken') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getCart() {
  const res = await fetch(`${API_URL}/cart`, {
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch cart');
  }

  return data;
}

export async function addToCart(productId: string, size: string, quantity: number) {
  const res = await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, size, quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to add to cart');
  }

  return data;
}

export async function updateCartItem(productId: string, size: string, quantity: number) {
  const res = await fetch(`${API_URL}/cart/${productId}/${size}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to update cart');
  }

  return data;
}

export async function removeCartItem(productId: string, size: string) {
  const res = await fetch(`${API_URL}/cart/${productId}/${size}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to remove from cart');
  }

  return data;
}