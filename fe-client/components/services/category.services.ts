const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, {
    next: { revalidate: 1800 }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}