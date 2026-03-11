import { Response, Request } from "express";
import * as XLSX from "xlsx";
import {
  GetAllUsersService,
  GetUserProfileService,
  UpdateStudentDetailsService,
  UpdateUserProfilePhotoService,
  BulkCreateUsersService,
  BulkUserData,
} from "../services/user.service.js";

export const GetAllUsersController = async (req: Request, res: Response) => {
  try {
    const { limit, search } = req.query;

    const result = await GetAllUsersService({
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.users,
      total: result.total,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch users",
    });
  }
};

export const GetUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await GetUserProfileService(userId);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch profile",
    });
  }
};

export const UpdateStudentDetailsController = async (
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

    const { rollNumber, enrollmentNumber } = req.body;

    if (!rollNumber || !enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: "Roll number and enrollment number are required",
      });
    }

    const profile = await UpdateStudentDetailsService(userId, {
      rollNumber,
      enrollmentNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update profile",
    });
  }
};

export const UpdateUserProfilePhotoController = async (
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

    const { profilePhoto } = req.body;

    if (!profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "Profile photo URL is required",
      });
    }

    const profile = await UpdateUserProfilePhotoService(userId, profilePhoto);

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data: profile,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update profile photo",
    });
  }
};

export const BulkCreateUsersController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file uploaded. Please upload an Excel file (.xlsx or .xls)",
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
    const users: BulkUserData[] = rawData.map((row: any) => ({
      email: String(row.email || row.Email || "").trim(),
      name: String(row.name || row.Name || "").trim(),
      password: String(row.password || row.Password || "").trim(),
      role: String(row.role || row.Role || "")
        .trim()
        .toUpperCase() as BulkUserData["role"],
      departmentName: String(
        row.departmentName ||
          row.department ||
          row.Department ||
          row.DepartmentName ||
          "",
      ).trim(),
      rollNumber:
        row.rollNumber || row.RollNumber || row.roll_number || undefined,
      enrollmentNumber:
        row.enrollmentNumber ||
        row.EnrollmentNumber ||
        row.enrollment_number ||
        undefined,
    }));

    // Process bulk creation
    const result = await BulkCreateUsersService(users);

    return res.status(200).json({
      success: true,
      message: `Bulk upload completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  } catch (err: any) {
    console.error("Bulk upload error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to process bulk upload",
    });
  }
};

export const GetBulkUploadTemplateController = async (
  _req: Request,
  res: Response,
) => {
  try {
    // Create a sample template
    const templateData = [
      {
        email: "student1@example.com",
        name: "John Doe",
        password: "password123",
        role: "STUDENT",
        departmentName: "Computer Science",
        rollNumber: "CS2024001",
        enrollmentNumber: "EN2024001",
      },
      {
        email: "hod@example.com",
        name: "Jane Smith",
        password: "password123",
        role: "HOD",
        departmentName: "Computer Science",
        rollNumber: "",
        enrollmentNumber: "",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 }, // email
      { wch: 20 }, // name
      { wch: 15 }, // password
      { wch: 15 }, // role
      { wch: 25 }, // departmentName
      { wch: 15 }, // rollNumber
      { wch: 18 }, // enrollmentNumber
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_users_template.xlsx",
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
