import { z } from "zod";
import {Role, Department} from "../generated/prisma/enums.js"

export const CreateResourceCategorySchema  = z.object({
    name:z.string().min(2).transform(str=>str.toUpperCase()),
    description:z.string().min(2),
    authorityId: z.string(),
})

export const CreateResourceSchema = z.object({
    name : z.string().min(1),
    description:z.string().optional(),
    model:z.string().optional(),
    resourceCategoryId:z.string(),
    quantity:z.int()
})

export type CreateResourceCategoryInput = z.infer<typeof CreateResourceCategorySchema>;
export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;