import { stripHtmlTags } from "./seoHelper";

/**
 * Validation helpers cho Product
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}


/**
 * Validate product data
 */
export const validateProductData = (data: {
  name?: string;
  description?: string;
  price?: number;
  sizeStock?: Array<{ size: string; stock: number }>;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < 5) {
    errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
  }

  if (data.name && data.name.length > 200) {
    errors.push("Tên sản phẩm không được vượt quá 200 ký tự");
  }


  // Validate price
  if (data.price !== undefined) {
    if (data.price < 0) {
      errors.push("Giá sản phẩm không được âm");
    }
    if (data.price === 0) {
      errors.push("Giá sản phẩm phải lớn hơn 0");
    }
    if (data.price > 1000000000) {
      errors.push("Giá sản phẩm không hợp lệ");
    }
  }

  // Validate sizeStock
  if (data.sizeStock && data.sizeStock.length === 0) {
    errors.push("Phải có ít nhất 1 size và số lượng tồn kho");
  }

  if (data.sizeStock) {
    data.sizeStock.forEach((item, index) => {
      if (!item.size || item.size.trim() === "") {
        errors.push(`Size ở vị trí ${index + 1} không được để trống`);
      }
      if (item.stock < 0) {
        errors.push(`Số lượng tồn kho của size ${item.size} không được âm`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate image URLs
 */
export const validateImages = (
  images: string[],
  thumbnail?: string
): ValidationResult => {
  const errors: string[] = [];
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;

  if (!thumbnail || thumbnail.trim() === "") {
    errors.push("Ảnh thumbnail là bắt buộc");
  } else if (!urlRegex.test(thumbnail)) {
    errors.push("URL ảnh thumbnail không hợp lệ");
  }

  if (images.length === 0) {
    errors.push("Phải có ít nhất 1 ảnh sản phẩm");
  }

  images.forEach((url, index) => {
    if (!urlRegex.test(url)) {
      errors.push(`Ảnh thứ ${index + 1} không hợp lệ: ${url}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get plain text length from HTML (for displaying info)
 */
export const getPlainTextLength = (html: string): number => {
  return stripHtmlTags(html).length;
};

