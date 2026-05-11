export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  productCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt?: string;
  updatedAt?: string;
}