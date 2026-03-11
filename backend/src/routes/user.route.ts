import { Router } from "express";
import multer from "multer";
import {
  GetAllUsersController,
  GetUserProfileController,
  UpdateStudentDetailsController,
  UpdateUserProfilePhotoController,
  BulkCreateUsersController,
  GetBulkUploadTemplateController,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Configure multer for Excel file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

router.get("/users", GetAllUsersController);
router.get("/profile", authMiddleware, GetUserProfileController);
router.patch("/profile", authMiddleware, UpdateStudentDetailsController);
router.patch(
  "/profile/photo",
  authMiddleware,
  UpdateUserProfilePhotoController,
);

// Bulk user creation routes (Admin only)
router.post(
  "/bulk-upload",
  authMiddleware,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  BulkCreateUsersController,
);
router.get(
  "/bulk-upload/template",
  authMiddleware,
  authorizeRoles("ADMIN"),
  GetBulkUploadTemplateController,
);

export default router;
