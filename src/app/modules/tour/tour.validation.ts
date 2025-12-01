import z from "zod";
import { tourCategories, tourLanguages } from "./tour.constant";

const toNumber = (val: any) =>
  typeof val === "string" && val.trim() !== "" ? Number(val) : val;

export const createTourZodSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  itinerary: z.string().optional(),
  fee: z.preprocess(toNumber, z.number().nonnegative()),
  durationHours: z.preprocess(toNumber, z.number().positive()),
  meetingPoint: z.string().min(3),
  maxGroupSize: z.preprocess(toNumber, z.number().int().positive()),
  guide: z.string(),                 // comes from token but optional for validation
  language: z.enum([...tourLanguages]),
  category: z.enum([...tourCategories]),
  destinationCity: z.string().min(2),
});

export const updateTourZodSchema = createTourZodSchema.partial();
