const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { IUser } from '@/types/user.type';
import Cookies from 'js-cookie';

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('accessToken') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

function getAuthHeadersFormData(): Record<string, string> {
  const token = Cookies.get('accessToken') || '';
  return {
    'Authorization': `Bearer ${token}`,
  };
}

export const userServices = {
  getProfileUser: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: getAuthHeaders(),
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error("Failed to fetch profile user");
    }
    return response.json();
  }
}

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
};

export type UpdatePasswordPayload = {
  password: string;
  newPassword: string;
};

export const updateProfileUser = async (
  data: UpdateProfilePayload
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/user/profile/update`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "Cập nhật thông tin thất bại"
    );
  }
  return response.json();
};

export const updatePasswordUser = async (
  data: UpdatePasswordPayload
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/user/profile/password/update`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "Cập nhật mật khẩu thất bại"
    );
  }
  return response.json();
};

//Lấy danh sách địa chỉ
export const getListAddress = async () =>{
  const response = await fetch(`${API_URL}/user/address/list`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error("Failed to fetch list address");
  }
  return response.json();
}

//Thêm địa chỉ
export type AddressPayload = {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
}
export const createAddress = async (data: AddressPayload) =>{
  const response = await fetch(`${API_URL}/user/address/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create address");
  }
  return response.json();
}

export const deleteAddress = async (id: string) =>{
  const response = await fetch(`${API_URL}/user/address/delete/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Xóa địa chỉ thất bại");
  }
  return response.json();
}

export const updateAddress = async (id: string, data: AddressPayload) =>{
  const response = await fetch(`${API_URL}/user/address/update/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Cập nhật địa chỉ thất bại");
  }
  return response.json();
}

export const setDefaultAddress = async (id: string) =>{
  const response = await fetch(`${API_URL}/user/address/set-default/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Đặt địa chỉ mặc định thất bại");
  }
  return response.json();
}

export const upDateAvatarUser = async (formData: FormData) =>{
  const response = await fetch(`${API_URL}/user/profile/avatar/update`, {
    method: "PATCH",
    headers: getAuthHeadersFormData(),
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Cập nhật ảnh avatar thất bại");
  }
  return response.json();
}