import { Schema, model } from "mongoose";
import { IContact } from "./contact.interface";

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, requiredPaths: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String},
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", contactSchema);
