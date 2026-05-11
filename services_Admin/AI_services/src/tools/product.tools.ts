import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchProducts } from "../services/vectorStore.service";
import {
  getProductById,
  getAllCategories,
} from "../services/productApi.service";

export const searchProductsTool = tool(
  async ({ query, maxResults, minPrice, maxPrice, gender }) => {
    try {
      const fetchCount = Math.max(maxResults * 3, 15);
      let results = await searchProducts(query, fetchCount);

      if (minPrice !== undefined) {
        results = results.filter((r) => Number(r.metadata.price) >= minPrice);
      }
      if (maxPrice !== undefined) {
        results = results.filter((r) => Number(r.metadata.price) <= maxPrice);
      }
      if (gender) {
        results = results.filter(
          (r) => !r.metadata.gender || r.metadata.gender === gender,
        );
      }

      results = results.slice(0, maxResults);

      if (results.length === 0) {
        const priceInfo = [];
        if (minPrice !== undefined)
          priceInfo.push(`từ ${minPrice.toLocaleString("vi-VN")}đ`);
        if (maxPrice !== undefined)
          priceInfo.push(`đến ${maxPrice.toLocaleString("vi-VN")}đ`);
        const priceStr = priceInfo.length > 0 ? ` trong khoảng giá ${priceInfo.join(" ")}` : "";
        return `Không tìm thấy sản phẩm nào phù hợp với "${query}"${priceStr}. Thử mở rộng khoảng giá hoặc thay đổi từ khóa.`;
      }

      const formatted = results.map((r, i) => {
        const m = r.metadata;
        const specs = m.specs as Record<string, string | undefined>;
        const lines = [
          `${i + 1}. ${m.name} (độ phù hợp: ${(r.score * 100).toFixed(0)}%)`,
          `   Giá: ${Number(m.price).toLocaleString("vi-VN")}đ${m.originalPrice ? ` (gốc: ${Number(m.originalPrice).toLocaleString("vi-VN")}đ)` : ""}`,
          `   Danh mục: ${m.category}`,
          `   Size còn hàng: ${(m.availableSizes as string[]).join(", ") || "Hết hàng"}`,
          `   Tồn kho: ${m.totalStock} | Đã bán: ${m.totalSold}`,
        ];

        if (specs.material) lines.push(`   Chất liệu: ${specs.material}`);
        if (specs.style) lines.push(`   Phong cách: ${specs.style}`);
        if (specs.pattern) lines.push(`   Họa tiết: ${specs.pattern}`);
        if (m.gender) lines.push(`   Giới tính: ${m.gender}`);
        lines.push(`   ID: ${m.productId}`);
        lines.push(`   Slug: ${m.slug}`);

        return lines.join("\n");
      });

      return formatted.join("\n\n");
    } catch (err) {
      return `Lỗi tìm kiếm: ${(err as Error).message}`;
    }
  },
  {
    name: "search_products",
    description:
      "Tìm kiếm sản phẩm thời trang bằng ngôn ngữ tự nhiên (vector embedding) kết hợp lọc giá và giới tính. " +
      "QUAN TRỌNG: Nếu khách nói ngân sách/giá (ví dụ 'dưới 500k', 'từ 1tr đến 2tr'), BẮT BUỘC phải truyền minPrice/maxPrice. " +
      "Đơn vị giá là VNĐ (500k = 500000, 1tr = 1000000, 2tr = 2000000).",
    schema: z.object({
      query: z
        .string()
        .describe("Mô tả sản phẩm cần tìm (KHÔNG bao gồm giá, chỉ loại/phong cách/chất liệu)"),
      maxResults: z
        .number()
        .default(5)
        .describe("Số lượng kết quả tối đa (mặc định 5)"),
      minPrice: z
        .number()
        .optional()
        .describe("Giá tối thiểu (VNĐ). Ví dụ: 500000 cho 500k"),
      maxPrice: z
        .number()
        .optional()
        .describe("Giá tối đa (VNĐ). Ví dụ: 2000000 cho 2 triệu"),
      gender: z
        .enum(["nam", "nu", "unisex"])
        .optional()
        .describe("Lọc theo giới tính nếu khách chỉ định"),
    }),
  },
);

export const getProductDetailTool = tool(
  async ({ productId }) => {
    try {
      const product = await getProductById(productId);

      if (!product) return "Không tìm thấy sản phẩm.";

      const cat = product.category;
      const catName =
        typeof cat === "object" && cat !== null
          ? (cat as { name: string }).name
          : "N/A";
      const specs = product.specs ?? {};
      const sizes = (product.sizeStock ?? [])
        .map((s) => `${s.size}(còn ${s.stock})`)
        .join(", ");

      return [
        `Tên: ${product.name}`,
        `Giá: ${product.price.toLocaleString("vi-VN")}đ`,
        product.originalPrice
          ? `Giá gốc: ${product.originalPrice.toLocaleString("vi-VN")}đ`
          : null,
        `Danh mục: ${catName}`,
        `Size & tồn kho: ${sizes}`,
        `Tổng tồn: ${product.totalStock} | Đã bán: ${product.totalSold}`,
        specs.material ? `Chất liệu: ${specs.material}` : null,
        specs.style ? `Phong cách: ${specs.style}` : null,
        specs.pattern ? `Họa tiết: ${specs.pattern}` : null,
        specs.season ? `Mùa: ${specs.season}` : null,
        specs.origin ? `Xuất xứ: ${specs.origin}` : null,
        product.gender ? `Giới tính: ${product.gender}` : null,
        product.tags?.length ? `Tags: ${product.tags.join(", ")}` : null,
        `Slug: ${product.slug}`,
      ]
        .filter(Boolean)
        .join("\n");
    } catch (err) {
      return `Lỗi: ${(err as Error).message}`;
    }
  },
  {
    name: "get_product_detail",
    description:
      "Xem chi tiết một sản phẩm cụ thể theo ID. Dùng khi cần thông tin đầy đủ về 1 sản phẩm.",
    schema: z.object({
      productId: z
        .string()
        .describe("ID của sản phẩm (lấy từ kết quả search)"),
    }),
  },
);

export const getCategoriesList = tool(
  async () => {
    try {
      const categories = await getAllCategories();
      if (categories.length === 0) return "Chưa có danh mục nào.";
      return categories
        .map((c, i) => `${i + 1}. ${c.name} (slug: ${c.slug})`)
        .join("\n");
    } catch (err) {
      return `Lỗi: ${(err as Error).message}`;
    }
  },
  {
    name: "get_categories",
    description:
      "Lấy danh sách tất cả danh mục sản phẩm. Dùng khi cần biết shop có những loại sản phẩm gì.",
    schema: z.object({}),
  },
);

export const productTools = [
  searchProductsTool,
  getProductDetailTool,
  getCategoriesList,
];
