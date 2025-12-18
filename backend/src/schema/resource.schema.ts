import { z } from "zod";
import {Role, Department} from "../generated/prisma/enums.js"

export const CreateResourceCategorySchema  = z.object({
    name:z.string().min(2).transform(str=>str.toUpperCase()),
    description:z.string().min(2),
    authorityId: z.string(),
})

export type CreateResourceCategoryInput = z.infer<typeof CreateResourceCategorySchema>;