import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const CreateResourceCategorySchema = z.object({
  name: z
    .string()
    .min(2)
    .transform((str) => str.toUpperCase()),
  description: z.string().min(2),
  authorityId: z.string(),
});

export const CreateResourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.string().optional(),
  resourceCategoryId: z.string(),
  quantity: z.int(),
});

// Schema for bulk resource data from Excel
export const BulkResourceRowSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  description: z.string().optional(),
  model: z.string().optional(),
  categoryName: z.string().min(1, "Category name is required"),
  categoryDescription: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export type CreateResourceCategoryInput = z.infer<
  typeof CreateResourceCategorySchema
>;
export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type BulkResourceRow = z.infer<typeof BulkResourceRowSchema>;
