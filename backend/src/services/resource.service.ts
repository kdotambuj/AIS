import { prisma } from "../lib/prisma.js";
import {
  CreateResourceCategoryInput,
  CreateResourceInput,
} from "../schema/resource.schema.js";

export const createResourceCategoryService = async (
  data: CreateResourceCategoryInput
) => {
  const resourceCategory = await prisma.resourceCategory.create({
    data: {
      name: data.name,
      description: data.description,
      authorityId: data.authorityId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return resourceCategory;
};

export const createResourceService = async (data: CreateResourceInput) => {
  const resource = await prisma.resource.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      model: data.model ?? null,
      resourceCategoryId: data.resourceCategoryId,
      quantity: data.quantity ?? null,
    },
  });

  return resource;
};

export const GetAllAuthorityResourcesService = async (authorityId: string) => {
  const resources = await prisma.resourceCategory.findMany({
    where: {
      authorityId: authorityId,
    },
    select: {
      id: true,
      name: true,

      resources: {
        select: {
          id: true,
          name: true,
          model: true,
          description: true,
          quantity: true,
          status: true,
        },
      },
    },
  });


  return resources;
};
