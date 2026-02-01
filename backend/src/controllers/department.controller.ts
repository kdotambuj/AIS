import { Request, Response } from "express";
import {
  CreateDepartmentService,
  GetAllDepartmentsService,
} from "../services/department.service.js";

export const CreateDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name } = req.body;

    const department = await CreateDepartmentService(name);

    return res.status(201).json({
      success: true,
      message: "Department Created",
      data: department,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Department Creation Failed",
    });
  }
};

export const GetAllDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const departments = await GetAllDepartmentsService();

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch departments",
    });
  }
};
