import { Response, Request } from "express";
import { ZodError } from "zod";
import { CreateResourceCategorySchema } from "../schema/resource.schema.js";
import { createResourceCategoryService } from "../services/resource.service.js";

export const CreateResourceCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = CreateResourceCategorySchema.parse(req.body);
    const resourceCategory = await createResourceCategoryService(data);

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
