import { Router } from "express";
import multer from "multer";
import {
  CreateResourceCategoryController,
  CreateResourceContoller,
  GetAllAuthorityResourcesController,
  GetAllResourcesController,
  BulkCreateResourcesController,
  GetBulkResourceTemplateController,
} from "../controllers/resource.controller.js";
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

router.post(
  "/create-category",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  CreateResourceCategoryController,
);
router.post(
  "/create-resource",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  CreateResourceContoller,
);
router.get(
  "/get/:authorityId",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  GetAllAuthorityResourcesController,
);

router.get(
  "/get",
  authMiddleware,
  authorizeRoles("STUDENT", "ADMIN", "LAB_INCHARGE"),
  GetAllResourcesController,
);

// Bulk resource upload routes (Lab Incharge and HOD)
router.post(
  "/bulk-upload",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE", "HOD"),
  upload.single("file"),
  BulkCreateResourcesController,
);
router.get(
  "/bulk-upload/template",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE", "HOD"),
  GetBulkResourceTemplateController,
);

export default router;
