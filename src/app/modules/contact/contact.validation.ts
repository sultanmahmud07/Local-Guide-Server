import { z } from "zod";

export const createContactValidation = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone must be at least 10 digits" }),
    message: z.string().optional(),
  }),
});
