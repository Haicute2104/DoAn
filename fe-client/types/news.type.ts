export interface INews {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  status: "pending_review" | "published" | "rejected";
  thumbnail: {
    url: string;
    public_id: string;
  };
  viewCount: number;
  publishedAt?: Date;
}
