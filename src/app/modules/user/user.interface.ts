import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  GUIDE = "GUIDE",
  TOURIST = "TOURIST"
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IGuideProfile {
  expertise?: string[];       // e.g. ["History", "Food"]
  dailyRate?: number;         // price per booking/day
  languages?: string[];       // e.g. ["English", "Spanish"]
  verified?: boolean;         // admin-verified guide
  bio?: string;
  photos?: string[];          // urls
}

export interface ITouristProfile {
  preferences?: string[];     // travel interests
  phone?: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;         // email verified
  role: Role;
  auths: IAuthProvider[];
  guideProfile?: IGuideProfile;
  touristProfile?: ITouristProfile;
  createdAt?: Date;
  updatedAt?: Date;
}
