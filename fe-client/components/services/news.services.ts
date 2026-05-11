export const getNews = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`,{
    next: { revalidate: 1800 }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}

export async function getNewsById(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${id}`,{
    next: { revalidate: 1800 }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}