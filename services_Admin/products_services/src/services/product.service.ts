import { generateFullSEO } from "../helpers/seoHelper";
import { validateProductData } from "../helpers/validationHelper";
import Category from "../models/category.model";
import Collection from "../models/collection.model";

/**
 * Service layer cho Product - Tách logic business ra khỏi controller
 */

interface ProductDataInput {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  category?: string;
  collection?: string;
  productType?: string;
  tags?: string[];
  thumbnail?: { url: string; public_id: string } | string;
  images?: Array<{ url: string; public_id: string }> | string[];
  slug?: string;
  sizeStock?: Array<{ size: string; stock: number; sold?: number }>;
  totalStock?: number;
  totalSold?: number;
  seo?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SEOGenerationResult {
  shouldGenerate: boolean;
  seoData?: Record<string, unknown>;
}

/**
 * Kiểm tra xem có cần gen SEO không
 */
export const shouldGenerateSEO = (data: ProductDataInput): boolean => {
  return !!(
    data.name ||
    data.description ||
    data.price ||
    data.category ||
    data.collection ||
    data.tags ||
    data.thumbnail
  );
};

/**
 * Tự động gen SEO nếu cần
 */
export const autoGenerateSEO = async (
  productData: ProductDataInput,
  existingData?: ProductDataInput
): Promise<SEOGenerationResult> => {
  // Nếu user đã gửi SEO, ưu tiên dùng SEO của user
  if (productData.seo && Object.keys(productData.seo).length > 0) {
    return { shouldGenerate: false };
  }

  // Merge dữ liệu mới với dữ liệu cũ (nếu có)
  const mergedData = {
    name: productData.name || existingData?.name || "",
    description: productData.description || existingData?.description,
    price: productData.price !== undefined ? productData.price : existingData?.price,
    category: productData.category || existingData?.category,
    collection: productData.collection || existingData?.collection,
    productType: productData.productType || existingData?.productType || "",
    tags: productData.tags || existingData?.tags,
    thumbnail: productData.thumbnail || existingData?.thumbnail,
    slug: productData.slug || existingData?.slug || ""
  };

  // Lấy tên category và collection
  const [category, collection] = await Promise.all([
    mergedData.category
      ? Category.findById(mergedData.category).select("name")
      : Promise.resolve(null),
    mergedData.collection
      ? Collection.findById(mergedData.collection).select("name")
      : Promise.resolve(null)
  ]);

  // Extract thumbnail URL nếu là object
  const thumbnailUrl = typeof mergedData.thumbnail === 'object' && mergedData.thumbnail !== null
    ? mergedData.thumbnail.url
    : mergedData.thumbnail;

  const seoData = generateFullSEO({
    name: mergedData.name,
    description: mergedData.description || mergedData.slug,
    price: mergedData.price || 0,
    category: category?.name,
    collection: collection?.name,
    productType: mergedData.productType,
    tags: mergedData.tags,
    thumbnail: thumbnailUrl,
    slug: mergedData.slug
  });

  return {
    shouldGenerate: true,
    seoData: seoData as unknown as Record<string, unknown>
  };
};

/**
 * Validate và prepare data cho create/update
 */
export const validateAndPrepareProduct = async (
  productData: ProductDataInput,
  existingData?: ProductDataInput
): Promise<{ isValid: boolean; errors?: string[]; preparedData?: ProductDataInput }> => {
  // 1. Validate
  const validation = validateProductData({
    name: productData.name || existingData?.name,
    description: productData.description || existingData?.description,
    price: productData.price !== undefined ? productData.price : existingData?.price,
    sizeStock: productData.sizeStock || existingData?.sizeStock
  });

  if (!validation.isValid) {
    return { isValid: false, errors: validation.errors };
  }

  // 2. Tính totalStock và totalSold từ sizeStock
  const sizeStockData = productData.sizeStock ?? existingData?.sizeStock;
  if (sizeStockData && Array.isArray(sizeStockData)) {
    productData.totalStock = sizeStockData.reduce((sum, item) => sum + (item.stock || 0), 0);
    productData.totalSold = sizeStockData.reduce((sum, item) => sum + (item.sold || 0), 0);
  }

  // 3. Auto-generate SEO nếu cần
  const seoResult = await autoGenerateSEO(productData, existingData);
  if (seoResult.shouldGenerate && seoResult.seoData) {
    productData.seo = seoResult.seoData;
  }

  return {
    isValid: true,
    preparedData: productData
  };
};

