export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: {
    url: string;
    public_id: string;
  };
}

export interface ICartItem {
  productId: string;
  size: string;
  quantity: number;
  product: IProduct;
}
export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: Date;
}