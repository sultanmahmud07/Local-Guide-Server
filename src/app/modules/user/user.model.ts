import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, IsActive, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
  provider: { type: String, required: true },
  providerId: { type: String, required: true }
}, { _id: false });

const guideProfileSchema = new Schema({
  expertise: [{ type: String }],
  dailyRate: { type: Number },
  languages: [{ type: String }],
  verified: { type: Boolean, default: false },
  bio: { type: String },
  photos: [{ type: String }]
}, { _id: false });

const touristProfileSchema = new Schema({
  preferences: [{ type: String }],
  phone: { type: String }
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  phone: { type: String },
  picture: { type: String },
  address: { type: String },
  isDeleted: { type: Boolean, default: false },
  isActive: {
    type: String,
    enum: Object.values(IsActive),
    default: IsActive.ACTIVE
  },
  isVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.TOURIST
  },
  auths: [authProviderSchema],
  guideProfile: guideProfileSchema,
  touristProfile: touristProfileSchema
}, {
  timestamps: true,
  versionKey: false
});

export const User = model<IUser>("User", userSchema);
