import { Router } from "express";
import { CreateAuthorityController, GetAuthoritiesController } from "../controllers/authority.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("ADMIN"),
  CreateAuthorityController
);

router.get('/authorities', authMiddleware, authorizeRoles('ADMIN','STUDENT', 'HOD', 'LAB_INCHARGE'), GetAuthoritiesController)

export default router;
