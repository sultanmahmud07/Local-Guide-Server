import z from "zod";

export const createParcelZodSchema = z.object({
  receiver: z.string({ required_error: "Receiver ID required" }),
  type: z.string().min(1, "Parcel type required"),
  weight: z.number().positive("Weight must be positive"),
  address: z.string().min(10, "Address must be at least 10 chars"),
  fee: z.number().optional(),
  deliveryDate: z.string().optional()
});

export const updateParcelStatusZodSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "APPROVED",
    "DISPATCHED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELED",
    "BLOCKED",
    "UNBLOCKED"
  ]),
  location: z.string().optional(),
  note: z.string().optional()
});
