export interface IAddress {
  _id: string;
  fullName?: string;
  phone?: string;
  street?: string;
  ward?: string;
  province?: string;
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  gender?: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  totalOrder: number;
  totalPrice: number;
  address: IAddress[];
  deleteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}