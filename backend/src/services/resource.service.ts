import { prisma } from "../lib/prisma.js";
import { CreateResourceCategoryInput } from "../schema/resource.schema.js";

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
