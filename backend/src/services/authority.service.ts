import { prisma } from "../lib/prisma.js";
import { CreateAuthorityInput } from "../schema/authority.schema.js";

export const CreateAuthorityService = async (data: CreateAuthorityInput) => {
  const authority = await prisma.resourceAuthority.create({
    data: {
      name: data.name,
      ownerId: data.ownerId,
      department: data.department,
      location:data.location
    },
    select: {
      id: true,
      name:true,
      department:true,
      location:true,
      ownerId:true
    },
  });

  return authority;
};
