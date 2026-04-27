import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const UserSignupSchema = z
  .object({
    email: z.email(),
    name: z.string().min(1),
    password: z.string().min(8),
    departmentId: z.string().optional(),
    role: z.enum(Role),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "ADMIN" && !data.departmentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "departmentId is required for non-admin users",
        path: ["departmentId"],
      });
    }
  });

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(Role),
});

export type SignupInput = z.infer<typeof UserSignupSchema>;
export type LoginInput = z.infer<typeof UserLoginSchema>;
