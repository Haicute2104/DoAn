import axios from "axios";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://products:5003/api/v1/client";

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category: { _id: string; name: string; slug: string } | string;
  thumbnail: { url: string; public_id: string };
  images: { url: string; public_id: string }[];
  price: number;
  originalPrice?: number;
  sizeStock: { size: string; stock: number; sold: number }[];
  totalStock: number;
  totalSold: number;
  specs: {
    material?: string;
    origin?: string;
    style?: string;
    pattern?: string;
    season?: string;
    careInstructions?: string;
    elasticity?: string;
    thickness?: string;
  };
  tags: string[];
  gender?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: string;
}

interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
}

interface ProductListResponse {
  products: ApiProduct[];
  pagination: { totalItems: number; totalPages: number; currentPage: number };
}

interface ProductDetailResponse {
  product: ApiProduct;
}

interface CategoryListResponse {
  categories: ApiCategory[];
}

export async function getAllProducts(): Promise<ApiProduct[]> {
  const allProducts: ApiProduct[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await axios.get<ProductListResponse>(
      `${PRODUCT_SERVICE_URL}/product`,
      { params: { page, limit } },
    );

    const { products, pagination } = res.data;
    allProducts.push(...products);

    if (page >= pagination.totalPages) break;
    page++;
  }

  return allProducts;
}

export async function getProductById(
  id: string,
): Promise<ApiProduct | null> {
  try {
    const res = await axios.get<ProductDetailResponse>(
      `${PRODUCT_SERVICE_URL}/product/${id}`,
    );
    return res.data.product;
  } catch {
    return null;
  }
}

export async function getAllCategories(): Promise<ApiCategory[]> {
  const res = await axios.get<CategoryListResponse>(
    `${PRODUCT_SERVICE_URL}/category`,
  );
  return res.data.categories;
}

export type { ApiProduct, ApiCategory };
