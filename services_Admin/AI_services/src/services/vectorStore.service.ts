import { embeddings } from "../configs/llm.config";
import {
  getAllProducts,
  getAllCategories,
  ApiProduct,
} from "./productApi.service";

interface ProductDoc {
  text: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

let productDocs: ProductDoc[] = [];
let categoryMap: Map<string, string> = new Map();

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function buildProductText(product: ApiProduct): string {
  const specs = product.specs ?? {};
  const parts: string[] = [`Tên: ${product.name}`];

  const desc = product.shortDescription || product.description;
  if (desc) parts.push(`Mô tả: ${stripHtml(desc)}`);

  if (specs.material) parts.push(`Chất liệu: ${specs.material}`);
  if (specs.style) parts.push(`Phong cách: ${specs.style}`);
  if (specs.pattern) parts.push(`Họa tiết: ${specs.pattern}`);
  if (specs.season) parts.push(`Mùa: ${specs.season}`);
  if (specs.origin) parts.push(`Xuất xứ: ${specs.origin}`);
  if (specs.elasticity) parts.push(`Co giãn: ${specs.elasticity}`);
  if (specs.thickness) parts.push(`Độ dày: ${specs.thickness}`);

  if (product.gender) {
    const genderMap: Record<string, string> = {
      nam: "Nam",
      nu: "Nữ",
      unisex: "Unisex",
    };
    parts.push(`Giới tính: ${genderMap[product.gender] ?? product.gender}`);
  }

  parts.push(`Giá: ${formatPrice(product.price)}`);
  if (product.originalPrice && product.originalPrice > product.price) {
    parts.push(`Giá gốc: ${formatPrice(product.originalPrice)}`);
  }

  const cat = product.category;
  const catName =
    typeof cat === "object" && cat !== null
      ? (cat as { name: string }).name
      : categoryMap.get(String(cat));
  if (catName) parts.push(`Danh mục: ${catName}`);

  if (product.tags?.length) parts.push(`Tags: ${product.tags.join(", ")}`);

  return parts.join(". ");
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function initVectorStore(): Promise<void> {
  console.log("[VectorStore] Loading categories via API...");
  const categories = await getAllCategories();
  categoryMap = new Map(categories.map((c) => [String(c._id), c.name]));

  console.log("[VectorStore] Loading products via API...");
  const products = await getAllProducts();
  console.log(`[VectorStore] Found ${products.length} active products`);

  if (products.length === 0) {
    productDocs = [];
    return;
  }

  const texts: string[] = [];
  const metas: Record<string, unknown>[] = [];

  for (const p of products) {
    const text = buildProductText(p);
    const availableSizes = (p.sizeStock ?? [])
      .filter((s) => s.stock > 0)
      .map((s) => s.size);

    const cat = p.category;
    const catName =
      typeof cat === "object" && cat !== null
        ? (cat as { name: string }).name
        : categoryMap.get(String(cat)) ?? "";

    texts.push(text);
    metas.push({
      productId: p._id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      thumbnail: p.thumbnail?.url ?? "",
      availableSizes,
      totalStock: p.totalStock,
      totalSold: p.totalSold,
      gender: p.gender ?? null,
      category: catName,
      specs: p.specs ?? {},
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
    });
  }

  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await embeddings.embedDocuments(batch);
    allEmbeddings.push(...batchEmbeddings);

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(texts.length / BATCH_SIZE);
    console.log(
      `[VectorStore] Embedded batch ${batchNum}/${totalBatches}`,
    );

    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  productDocs = texts.map((text, i) => ({
    text,
    embedding: allEmbeddings[i],
    metadata: metas[i],
  }));

  console.log(`[VectorStore] Ready — ${productDocs.length} products indexed`);
}

export interface SearchResult {
  text: string;
  metadata: Record<string, unknown>;
  score: number;
}

export async function searchProducts(
  query: string,
  k = 5,
): Promise<SearchResult[]> {
  if (productDocs.length === 0) {
    return [];
  }

  const queryEmbedding = await embeddings.embedQuery(query);

  const scored = productDocs.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k);
}

export async function refreshVectorStore(): Promise<void> {
  console.log("[VectorStore] Refreshing...");
  await initVectorStore();
}
