import { z } from "zod";
import { Role } from "../../generated/prisma/enums"

export const CreateAuthoritySchema = z.object({
    name: z.string().min(2, "Length should be atleast 2"),
    description: z.string().min(2),
    departmentId: z.string(),
    location: z.string().min(2),
    ownerId: z.string()
})

export type CreateAuthorityInput = z.infer<typeof CreateAuthoritySchema>;