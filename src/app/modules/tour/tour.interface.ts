import { Types } from "mongoose";

export type Language = "English" | "Spanish" | "French" | "German" | "Other";
export type TourCategory = "Food" | "Art" | "Adventure" | "History" | "Nature" | "Other";

export interface ITour {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  itinerary?: string;
  fee: number;
  durationHours: number;
  meetingPoint: string;
  maxGroupSize: number;

  thumbnail?: string;       // single image
  images?: string[];        // multiple images

  guide: Types.ObjectId;
  language: Language;
  category: TourCategory;
  destinationCity: string;
  isActive: boolean;
}
