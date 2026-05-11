import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/client";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  totalOrder: number;
  totalPrice: number;
  address?: {
    street?: string;
    ward?: string;
    distric?: string;
    city?: string;
  }[];
  createdAt: string;
  updatedAt: string;

}

interface AuthResult {
  success?: boolean;
  message?: string;
  user?: AuthUser;
  accessToken?: string;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(u: Record<string, any>): AuthUser {
  return {
    id: u.id ?? u._id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    avatarPublicId: u.avatarPublicId,
    dateOfBirth: u.dateOfBirth,
    gender: u.gender,
    role: u.role,
    totalOrder: u.totalOrder ?? 0,
    totalPrice: u.totalPrice ?? 0,
    address: u.address,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Đăng nhập thất bại" };
    }

    Cookies.set('accessToken', data.accessToken, {
      expires: 1,
      sameSite: 'lax',
    });

    const user: AuthUser = mapUser(data.user);
    return { success: true, user, accessToken: data.accessToken };
  } catch {
    return { error: "Không thể kết nối đến server" };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: 'include',
    });
  } catch {
    // ignore
  }
  Cookies.remove('accessToken');
}

export async function refreshAccessToken(): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      Cookies.remove('accessToken');
      return { error: data.message };
    }

    Cookies.set('accessToken', data.accessToken, {
      expires: 1,
      sameSite: 'lax',
    });

    const user: AuthUser | undefined = data.user
      ? mapUser(data.user)
      : undefined;

    return { success: true, user, accessToken: data.accessToken };
  } catch {
    Cookies.remove('accessToken');
    return { error: "Không thể kết nối đến server" };
  }
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Đăng ký thất bại" };
    }

    return { success: true, message: data.message };
  } catch {
    return { error: "Không thể kết nối đến server" };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Gửi yêu cầu thất bại" };
    }

    return { success: true, message: data.message };
  } catch {
    return { error: "Không thể kết nối đến server" };
  }
}

export async function resetPasswordAction(token: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Đặt lại mật khẩu thất bại" };
    }

    return { success: true, message: data.message };
  } catch {
    return { error: "Không thể kết nối đến server" };
  }
}

export async function activateAccountAction(token: string) {
  try {
    const res = await fetch(`${API_URL}/auth/activate/${token}`, {
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Kích hoạt tài khoản thất bại" };
    }

    return { success: true, message: data.message };
  } catch {
    return { error: "Không thể kết nối đến server" };
  }
}