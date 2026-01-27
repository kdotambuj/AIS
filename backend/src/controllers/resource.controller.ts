import { Response, Request } from "express";
import { ZodError } from "zod";
import {
  CreateResourceCategorySchema,
  CreateResourceSchema,
} from "../schema/resource.schema.js";
import {
  CreateResourceCategoryService,
  CreateResourceService,
  GetAllAuthorityResourcesService,
  GetAllResourcesService,
} from "../services/resource.service.js";

export const CreateResourceCategoryController = async (
  req: Request,
  res: Response
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
  res: Response
) => {
  try {
    const { authorityId } = req.params;
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
  res: Response
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


