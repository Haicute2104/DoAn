/**
 * Helper functions để tạo SEO metadata tự động
 */

interface ProductSEOData {
  name: string;
  description?: string;
  price: number;
  category?: string;
  collection?: string;
  productType: string;
  tags?: string[];
  thumbnail?: string;
  slug: string;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  canonicalUrl: string;
}

/**
 * Tạo SEO title tự động
 * Công thức: [Tên sản phẩm] - [Giá] | [Tên shop/brand]
 */
export const generateSeoTitle = (productName: string, price?: number, shopName = "Fashion Store"): string => {
  const priceText = price ? ` - ${formatPrice(price)}` : "";
  const title = `${productName}${priceText} | ${shopName}`;
  
  // Giới hạn 60 ký tự cho SEO tốt
  return title.length > 60 ? title.substring(0, 57) + "..." : title;
};

/**
 * Strip HTML tags từ TinyMCE hoặc rich text editor
 */
export const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, " ") // Chuyển <br> thành space
    .replace(/<\/p>/gi, " ") // Chuyển </p> thành space
    .replace(/<[^>]*>/g, "") // Loại bỏ tất cả HTML tags
    .replace(/&nbsp;/g, " ") // Chuyển &nbsp; thành space
    .replace(/&amp;/g, "&") // Decode &amp;
    .replace(/&lt;/g, "<") // Decode &lt;
    .replace(/&gt;/g, ">") // Decode &gt;
    .replace(/&quot;/g, '"') // Decode &quot;
    .replace(/&#39;/g, "'") // Decode &#39;
    .replace(/\s+/g, " ") // Nhiều space -> 1 space
    .trim();
};

/**
 * Tạo SEO description tự động (xử lý HTML từ TinyMCE)
 */
export const generateSeoDescription = (
  productName: string,
  description?: string,
  price?: number,
  category?: string
): string => {
  let desc = `Mua ${productName}`;
  
  if (category) {
    desc += ` - ${category}`;
  }
  
  if (price) {
    desc += ` với giá ${formatPrice(price)}`;
  }
  
  if (description) {
    // Strip HTML tags từ TinyMCE và lấy 100 ký tự đầu
    const cleanDesc = stripHtmlTags(description);
    const shortDesc = cleanDesc.substring(0, 100).trim();
    if (shortDesc) {
      desc += `. ${shortDesc}`;
    }
  }
  
  desc += ". Giao hàng toàn quốc, đổi trả miễn phí trong 7 ngày.";
  
  // Giới hạn 160 ký tự cho SEO tốt
  return desc.length > 160 ? desc.substring(0, 157) + "..." : desc;
};

/**
 * Tạo SEO keywords tự động
 */
export const generateSeoKeywords = (data: ProductSEOData): string[] => {
  const keywords: string[] = [];
  
  // Thêm tên sản phẩm
  keywords.push(data.name);
  
  // Thêm loại sản phẩm
  const typeMap: Record<string, string> = {
    ao_dai: "áo dài",
    ao: "áo",
    quan: "quần",
    vay: "váy",
    phu_kien: "phụ kiện"
  };
  keywords.push(typeMap[data.productType] || data.productType);
  
  // Thêm category và collection
  if (data.category) keywords.push(data.category);
  if (data.collection) keywords.push(data.collection);
  
  // Thêm tags
  if (data.tags && data.tags.length > 0) {
    keywords.push(...data.tags);
  }
  
  // Thêm các từ khóa chung
  keywords.push("thời trang", "mua online", "giá rẻ", "chất lượng");
  
  return keywords;
};

/**
 * Tạo canonical URL
 */
export const generateCanonicalUrl = (slug: string, baseUrl = process.env.BASE_URL || "https://example.com"): string => {
  return `${baseUrl}/san-pham/${slug}`;
};

/**
 * Tạo toàn bộ SEO metadata tự động
 */
export const generateFullSEO = (data: ProductSEOData, shopName = "Fashion Store"): SEOMetadata => {
  return {
    title: generateSeoTitle(data.name, data.price, shopName),
    description: generateSeoDescription(data.name, data.description, data.price, data.category),
    keywords: generateSeoKeywords(data),
    ogTitle: data.name, // Open Graph title ngắn gọn hơn
    ogDescription: generateSeoDescription(data.name, data.description, data.price, data.category),
    ogImage: data.thumbnail,
    canonicalUrl: generateCanonicalUrl(data.slug)
  };
};

/**
 * Format giá tiền
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(price);
};

/**
 * Sanitize SEO input (loại bỏ HTML tags, ký tự đặc biệt)
 * Dùng cho text từ TinyMCE
 */
export const sanitizeSEOText = (text: string): string => {
  const cleaned = stripHtmlTags(text);
  return cleaned
    .replace(/[^\w\s\-.,àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, "") // Giữ tiếng Việt
    .trim();
};

/**
 * Validate SEO metadata
 */
export const validateSEO = (seo: Partial<SEOMetadata>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (seo.title && seo.title.length > 60) {
    errors.push("SEO title không nên dài quá 60 ký tự");
  }
  
  if (seo.description && seo.description.length > 160) {
    errors.push("SEO description không nên dài quá 160 ký tự");
  }
  
  if (seo.keywords && seo.keywords.length > 10) {
    errors.push("Không nên có quá 10 keywords");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

