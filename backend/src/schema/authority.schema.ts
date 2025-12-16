import { z } from "zod";
import {Role, Department} from "../generated/prisma/enums.js"
import e from "express";

export const CreateAuthoritySchema = z.object({
    name:z.string().min(2, "Length should be atleast 2"),
    description:z.string().optional(),
    department:z.enum(Department),
    location:z.string().min(2),
    ownerId:z.string()
})

export  type CreateAuthorityInput = z.infer<typeof CreateAuthoritySchema>;