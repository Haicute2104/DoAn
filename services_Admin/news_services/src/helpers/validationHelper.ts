import { stripHtmlTags } from "./seoHelper";

/**
 * Validation helpers cho Product
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate description từ TinyMCE
 */
export const validateDescription = (
  description: string,
  minLength = 50,
  maxLength = 5000
): ValidationResult => {
  const errors: string[] = [];

  if (!description || description.trim() === "") {
    errors.push("Mô tả sản phẩm không được để trống");
    return { isValid: false, errors };
  }

  // Strip HTML và kiểm tra độ dài thực
  const plainText = stripHtmlTags(description);

  if (plainText.length < minLength) {
    errors.push(`Mô tả sản phẩm phải có ít nhất ${minLength} ký tự (hiện tại: ${plainText.length} ký tự)`);
  }

  if (plainText.length > maxLength) {
    errors.push(`Mô tả sản phẩm không được vượt quá ${maxLength} ký tự (hiện tại: ${plainText.length} ký tự)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

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

  // Validate description
  if (data.description) {
    const descValidation = validateDescription(data.description);
    if (!descValidation.isValid) {
      errors.push(...descValidation.errors);
    }
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

