import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().min(5).max(100),
  password: z.string()
    .min(8)
    .regex(/(?=.*[A-Z])/, "Must include uppercase")
    .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
    .regex(/(?=.*\d)/, "Must include number"),
  phone: z.string().regex(/^(?:\+8801\d{9}|01\d{9})$/).optional(),
  address: z.string().max(200).optional(),
  //  role: z.nativeEnum(Role).optional() 
});

export const updateUserZodSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  password: z.string()
    .min(8)
    .regex(/(?=.*[A-Z])/, "Must include uppercase")
    .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
    .regex(/(?=.*\d)/, "Must include number")
    .optional(),
  phone: z.string().regex(/^(?:\+8801\d{9}|01\d{9})$/).optional(),
  address: z.string().max(200).optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional()
});
