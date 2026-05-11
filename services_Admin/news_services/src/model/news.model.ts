import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IModeration {
  safe: boolean | null;
  score: number;
  reason: string;
  categories: string[];
  checkedAt?: Date;
}

export interface IContentImage {
  url: string;
  public_id: string;
}

export interface IReviewHistory {
  actor: string;
  review?: string;
  reviewedAt: Date;
}

export interface INews extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: IContentImage;
  author: string;
  contentImages: IContentImage[];
  moderation: IModeration;
  reviewHistory: IReviewHistory[]; 
  status: "pending_review" | "published" | "rejected";
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContentImageSchema = new Schema<IContentImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const ReviewHistorySchema = new Schema<IReviewHistory>(
  {
    actor: { type: String, required: true },
    review: { type: String, default: "" },
    reviewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    summary: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: ContentImageSchema,
    },

    contentImages: {
      type: [ContentImageSchema],
      default: [],
    },

    moderation: {
      safe: { type: Boolean, default: null },
      score: { type: Number, default: 0 },
      reason: { type: String, default: "" },
      categories: { type: [String], default: [] },
      checkedAt: { type: Date },
    },

    reviewHistory: {
      type: [ReviewHistorySchema],
      default: [],
    },

    author: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending_review", "published", "rejected"],
      default: "pending_review",
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

NewsSchema.pre("save", async function (this: INews) {
  if (!this.isModified("title")) return;

  const baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
    locale: "vi",
  });

  const timestamp = Date.now();
  this.slug = `${baseSlug}-${timestamp}`;
});

const News = mongoose.model<INews>("News", NewsSchema);

export default News;