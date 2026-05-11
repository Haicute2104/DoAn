const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getContact() {
  const res = await fetch(`${API_URL}/contact`, {
    next: { revalidate: 1800 }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch contact");
  }
  return res.json();
}