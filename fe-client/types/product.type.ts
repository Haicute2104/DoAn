// types/product.ts

export interface ISizeStock {
  size: string;
  stock: number;
  sold: number;
}

export interface IFashionSpecs {
  material?: string;
  origin?: string;
  style?: string;
  pattern?: string;
  season?: string;
  careInstructions?: string;
  elasticity?: string;
  thickness?: string;
}

export interface ISEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface IProduct {
  _id: string; // MongoDB ID dạng string khi về Client
  name: string;
  slug: string;
  description: string; 
  shortDescription?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };     // Chỉ giữ ID hoặc có thể là object Category tùy API trả về
  collection?: string; 
  
  images: {
    url: string;
    public_id: string;
  }[];
  
  thumbnail: {
    url: string;
    public_id: string;
  };

  price: number;
  originalPrice?: number;
  
  sizeStock: ISizeStock[];
  totalStock: number;
  totalSold: number;

  specs: IFashionSpecs;
  tags: string[];
  seo: ISEO;
  
  rating: {
    average: number;
    count: number;
  };

  gender?: "nam" | "nu" | "unisex";
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: "active" | "inactive" | "draft";
  
  createdAt: string; // Chuyển từ Date sang string ISO
  updatedAt: string;
}