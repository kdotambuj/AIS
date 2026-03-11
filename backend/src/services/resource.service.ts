import { prisma } from "../lib/prisma.js";
import {
  CreateResourceCategoryInput,
  CreateResourceInput,
  BulkResourceRow,
} from "../schema/resource.schema.js";

export interface BulkResourceResult {
  success: boolean;
  row: number;
  name: string;
  categoryName: string;
  categoryCreated?: boolean;
  error?: string;
}

export interface BulkResourceResponse {
  created: number;
  failed: number;
  categoriesCreated: number;
  results: BulkResourceResult[];
}

export const CreateResourceCategoryService = async (
  data: CreateResourceCategoryInput,
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

export const CreateResourceService = async (data: CreateResourceInput) => {
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

export const GetAllResourcesService = async () => {
  const resources = await prisma.resource.findMany({
    include: {
      resourceCategory: true,
    },
  });

  return resources;
};

export const BulkCreateResourcesService = async (
  authorityId: string,
  resources: BulkResourceRow[],
): Promise<BulkResourceResponse> => {
  const results: BulkResourceResult[] = [];
  let created = 0;
  let failed = 0;
  let categoriesCreated = 0;

  // Cache for category lookups/creations to minimize DB calls
  const categoryCache: Map<string, string> = new Map();

  // Pre-fetch existing categories for this authority
  const existingCategories = await prisma.resourceCategory.findMany({
    where: { authorityId },
    select: { id: true, name: true },
  });

  for (const cat of existingCategories) {
    categoryCache.set(cat.name.toUpperCase(), cat.id);
  }

  for (let i = 0; i < resources.length; i++) {
    const row = resources[i];
    const rowNumber = i + 2; // Excel row (1-indexed + header row)

    try {
      // Validate required fields
      if (!row.name || row.name.trim() === "") {
        throw new Error("Resource name is required");
      }
      if (!row.categoryName || row.categoryName.trim() === "") {
        throw new Error("Category name is required");
      }

      const categoryNameUpper = row.categoryName.trim().toUpperCase();
      let categoryId = categoryCache.get(categoryNameUpper);
      let categoryCreated = false;

      // If category doesn't exist, create it
      if (!categoryId) {
        const newCategory = await prisma.resourceCategory.create({
          data: {
            name: categoryNameUpper,
            description:
              row.categoryDescription?.trim() ||
              `Auto-created category for ${categoryNameUpper}`,
            authorityId,
          },
          select: { id: true, name: true },
        });
        categoryId = newCategory.id;
        categoryCache.set(categoryNameUpper, categoryId);
        categoriesCreated++;
        categoryCreated = true;
      }

      // Create the resource
      await prisma.resource.create({
        data: {
          name: row.name.trim(),
          description: row.description?.trim() || null,
          model: row.model?.trim() || null,
          resourceCategoryId: categoryId,
          quantity: row.quantity || 1,
        },
      });

      created++;
      results.push({
        success: true,
        row: rowNumber,
        name: row.name.trim(),
        categoryName: categoryNameUpper,
        categoryCreated,
      });
    } catch (err: any) {
      failed++;
      results.push({
        success: false,
        row: rowNumber,
        name: row.name || "Unknown",
        categoryName: row.categoryName || "Unknown",
        error: err.message || "Unknown error",
      });
    }
  }

  return {
    created,
    failed,
    categoriesCreated,
    results,
  };
};
