import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const UserSignupSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(8),
  departmentId: z.string(),
  role: z.enum(Role),
});

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(Role)
})

export type SignupInput = z.infer<typeof UserSignupSchema>;
export type LoginInput = z.infer<typeof UserLoginSchema>;
