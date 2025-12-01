import { Schema, model } from "mongoose";
import { ITour } from "./tour.interface";

const tourSchema = new Schema<ITour>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  itinerary: { type: String },

  fee: { type: Number, required: true },
  durationHours: { type: Number, required: true },
  meetingPoint: { type: String, required: true },
  maxGroupSize: { type: Number, required: true },

  thumbnail: { type: String },
  images: { type: [String], default: [] },

  guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
  language: { type: String, required: true },
  category: { type: String, required: true },
  destinationCity: { type: String, required: true },

  isActive: { type: Boolean, default: true }
},
{
  timestamps: true,
  versionKey: false
});

export const Tour = model<ITour>("Tour", tourSchema);
