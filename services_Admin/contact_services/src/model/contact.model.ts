import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  showroomName: string;
  address: string;
  phoneHotline: string;
  phoneStore: string;
  emailPrimary: string;
  emailSupport: string;
  openingHours: {
    weekday: string;
    sunday: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
  };
  mapEmbedUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    showroomName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phoneHotline: {
      type: String,
      required: true,
    },

    phoneStore: {
      type: String,
      required: true,
    },

    emailPrimary: {
      type: String,
      required: true,
    },

    emailSupport: {
      type: String,
      required: true,
    },

    openingHours: {
      weekday: { type: String },
      sunday: { type: String },
    },

    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
    },

    mapEmbedUrl: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);



const Contact = mongoose.model<IContact>('Contact', ContactSchema);
export default Contact;