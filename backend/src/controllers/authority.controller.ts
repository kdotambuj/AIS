import { Response, Request } from "express";
import { ZodError } from "zod";
import { CreateAuthoritySchema } from "../schema/authority.schema.js";
import { CreateAuthorityService } from "../services/authority.service.js";

export const CreateAuthorityController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = CreateAuthoritySchema.parse(req.body);
    const authority = await CreateAuthorityService(data);

    return res.status(201).json({
      success: true,
      message: "Authority Created",
      data: authority,
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
      message: err.message || "Create Authority failed",
    });
  }
};
