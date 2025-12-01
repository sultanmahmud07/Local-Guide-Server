import { Types } from "mongoose";

export type Language = "English" | "Spanish" | "French" | "German" | "Other";
export type TourCategory = "Food" | "Art" | "Adventure" | "History" | "Nature" | "Other";
export type TourStatus = "PUBLIC" | "PRIVATE" | "HOLD" | "SUSPENDED";
export type TourTransportationMode = "Walking" | "Biking" | "Private Transport" | "Public Transport" | "Other";
export interface ITour {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;       // single image
  images?: string[];        // multiple images
  deleteImages?: string[];        // multiple images to delete
  fee: number;
  childFee?: number;
  durationHours: number;
  meetingPoint: string;
  maxGroupSize: number;
  transportationMode?: TourTransportationMode;
  startTime: string[];
  itinerary?: string[];
  importantPoints?: string[];        
  cancellationPolicy?: string[];   
  inclusionsAndExclusions?: {
    inclusions: string[];
    exclusions: string[];
  };   
  author: Types.ObjectId;
  language: Language;
  category: TourCategory;
  destinationCity: string;
  isActive: boolean;
  status: TourStatus;

}
