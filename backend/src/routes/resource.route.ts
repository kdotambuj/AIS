import { Router } from "express";
import {
  CreateResourceCategoryController,
  CreateResourceContoller,
  GetAllAuthorityResourcesController,
  GetAllResourcesController,
} from "../controllers/resource.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/create-category",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  CreateResourceCategoryController
);
router.post(
  "/create-resource",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  CreateResourceContoller
);
router.get(
  "/get/:authorityId",
  authMiddleware,
  authorizeRoles("ADMIN", "LAB_INCHARGE", "HOD"),
  GetAllAuthorityResourcesController
);

router.get('/get', authMiddleware, authorizeRoles('STUDENT', 'ADMIN', 'LAB_INCHARGE'), GetAllResourcesController)

export default router;
