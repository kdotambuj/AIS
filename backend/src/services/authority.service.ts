import { prisma } from "../lib/prisma.js";
import { CreateAuthorityInput } from "../schema/authority.schema.js";

export const CreateAuthorityService = async (data: CreateAuthorityInput) => {
  const authority = await prisma.resourceAuthority.create({
    data: {
      name: data.name,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
      location: data.location,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      departmentId: true,
      location: true,
      ownerId: true,
    },
  });

  return authority;
};

export const GetAuthoritiesService = async () => {
  const authorities = await prisma.resourceAuthority.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      department: true,
    },
  });
  return authorities;
};

export const GetAuthorityByOwnerIdService = async (ownerId: string) => {
  const authority = await prisma.resourceAuthority.findUnique({
    where: {
      ownerId: ownerId,
    },
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      resourceCategories: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          _count: {
            select: {
              resources: true,
            },
          },
        },
      },
      _count: {
        select: {
          tickets: true,
          resourceCategories: true,
        },
      },
      createdAt: true,
    },
  });
  return authority;
};
