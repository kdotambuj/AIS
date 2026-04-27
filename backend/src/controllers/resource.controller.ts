import { Response, Request } from "express";
import { ZodError } from "zod";
import * as XLSX from "xlsx";
import {
  CreateResourceCategorySchema,
  CreateResourceSchema,
  BulkResourceRow,
} from "../schema/resource.schema.js";
import {
  CreateResourceCategoryService,
  CreateResourceService,
  GetAllAuthorityResourcesService,
  GetAllResourcesService,
  BulkCreateResourcesService,
} from "../services/resource.service.js";
import { prisma } from "../lib/prisma.js";

export const CreateResourceCategoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = CreateResourceCategorySchema.parse(req.body);
    const resourceCategory = await CreateResourceCategoryService(data);

    return res.status(201).json({
      success: true,
      message: "Resource Category Created",
      data: resourceCategory,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: err.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Create Resource Category failed",
    });
  }
};

export const CreateResourceContoller = async (req: Request, res: Response) => {
  try {
    const data = CreateResourceSchema.parse(req.body);
    const resource = await CreateResourceService(data);

    return res.status(201).json({
      success: true,
      message: "Resource Created",
      data: resource,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: err.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Create Resource failed",
    });
  }
};

export const GetAllAuthorityResourcesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authorityId = req.params.authorityId as string;
    const resources = await GetAllAuthorityResourcesService(authorityId);

    return res.status(200).json({
      success: true,
      message: "Resources fetched",
      data: resources,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Fetch Resources failed",
    });
  }
};

export const GetAllResourcesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const resources = await GetAllResourcesService();

    return res.status(200).json({
      success: true,
      message: "Resources fetched",
      data: resources,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Fetch Resources failed",
    });
  }
};

export const BulkCreateResourcesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file uploaded. Please upload an Excel file (.xlsx or .xls)",
      });
    }

    // Get the user's authority
    const authority = await prisma.resourceAuthority.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!authority) {
      return res.status(403).json({
        success: false,
        message: "You don't have a resource authority assigned",
      });
    }

    // Parse Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or has no data rows",
      });
    }

    // Map Excel columns to expected format
    const resources: BulkResourceRow[] = rawData.map((row: any) => ({
      name: String(
        row.name || row.Name || row.resourceName || row.ResourceName || "",
      ).trim(),
      description:
        String(row.description || row.Description || "").trim() || undefined,
      model: String(row.model || row.Model || "").trim() || undefined,
      categoryName: String(
        row.categoryName ||
          row.CategoryName ||
          row.category ||
          row.Category ||
          "",
      ).trim(),
      categoryDescription:
        String(
          row.categoryDescription || row.CategoryDescription || "",
        ).trim() || undefined,
      quantity: parseInt(String(row.quantity || row.Quantity || "1")) || 1,
    }));

    // Process bulk creation
    const result = await BulkCreateResourcesService(authority.id, resources);

    return res.status(200).json({
      success: true,
      message: `Bulk upload completed. Created: ${result.created}, Failed: ${result.failed}, Categories created: ${result.categoriesCreated}`,
      data: result,
    });
  } catch (err: any) {
    console.error("Bulk resource upload error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to process bulk upload",
    });
  }
};

export const GetBulkResourceTemplateController = async (
  _req: Request,
  res: Response,
) => {
  try {
    // Create a sample template
    const templateData = [
      {
        name: "Projector",
        description: "HD Projector for presentations",
        model: "Epson EB-X51",
        categoryName: "ELECTRONICS",
        categoryDescription: "Electronic equipment and devices",
        quantity: 5,
      },
      {
        name: "Laptop",
        description: "Dell laptop for lab use",
        model: "Dell Latitude 5520",
        categoryName: "COMPUTERS",
        categoryDescription: "Computing devices",
        quantity: 20,
      },
      {
        name: "Multimeter",
        description: "Digital multimeter for measurements",
        model: "Fluke 117",
        categoryName: "INSTRUMENTS",
        categoryDescription: "Measurement instruments",
        quantity: 10,
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 }, // name
      { wch: 35 }, // description
      { wch: 20 }, // model
      { wch: 20 }, // categoryName
      { wch: 35 }, // categoryDescription
      { wch: 10 }, // quantity
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Resources");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_resources_template.xlsx",
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate template",
    });
  }
};
