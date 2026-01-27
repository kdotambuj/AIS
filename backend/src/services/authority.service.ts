import { prisma } from "../lib/prisma.js";
import { CreateAuthorityInput } from "../schema/authority.schema.js";

export const CreateAuthorityService = async (data: CreateAuthorityInput) => {
  const authority = await prisma.resourceAuthority.create({
    data: {
      name: data.name,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
      location:data.location,
      description:data.description
    },
    select: {
      id: true,
      name:true,
      departmentId:true,
      location:true,
      ownerId:true
    },
  });

  return authority;
};

export const GetAuthoritiesService = async ()=>{
    const authorities = await prisma.resourceAuthority.findMany({
      select:{
        id:true,
        name:true,
        location:true,
        description:true,
        department:true
      }
    });
    return authorities;
}
