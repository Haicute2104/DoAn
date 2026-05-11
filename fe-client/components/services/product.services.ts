const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ProductQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
}

export async function getProducts(params: ProductQueryParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.category) searchParams.set("category", params.category);

  const queryString = searchParams.toString();
  const url = `${API_URL}/products${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export async function getProductById(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export async function getProductNew() {
  const res = await fetch(`${API_URL}/products/new`,{
    next: { revalidate: 1800 }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch product new");
  }
  return res.json();
}

export async function getProductFeatured() {
  const res = await fetch(`${API_URL}/products/featured`,{
    next: { revalidate: 1800 }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch product featured");
  }
  return res.json();
}

export async function getProductBestSeller() {
  const res = await fetch(`${API_URL}/products/best-seller`,{
    next: { revalidate: 1800 }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch product best seller");
  }
  return res.json();
}