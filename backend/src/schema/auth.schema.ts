import { z } from "zod";

export const UserSignupSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(8),
  department: z.enum([
    "ELECTRICAL_ENGG",
    "MECHANICAL_ENGG",
    "FOOTWEAR_ENGG",
    "CIVIL_ENGG",
    "AGRICULTURE_ENGG",
    "SCIENCE",
    "ARTS",
    "COMMERCE",
    "AYUSH",
    "ELECTRICAL_TECHNICAL",
    "AUTOMOBILE_TECHNICAL",
    "ENGLISH",
    "OTHER",
  ]),
  role: z.enum(["STUDENT", "LAB_INCHARGE", "ADMIN", "HOD"]),
});

export const UserLoginSchema = z.object({
  email:z.email(),
  password:z.string().min(8)
})

export type SignupInput = z.infer<typeof UserSignupSchema>;
export type LoginInput = z.infer<typeof UserLoginSchema>;
