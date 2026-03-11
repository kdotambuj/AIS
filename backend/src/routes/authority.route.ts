import { Router } from "express";
import {
  CreateAuthorityController,
  GetAuthoritiesController,
  GetMyAuthorityController,
} from "../controllers/authority.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("ADMIN"),
  CreateAuthorityController,
);

router.get(
  "/authorities",
  authMiddleware,
  authorizeRoles("ADMIN", "STUDENT", "HOD", "LAB_INCHARGE"),
  GetAuthoritiesController,
);

router.get(
  "/my-authority",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE"),
  GetMyAuthorityController,
);

export default router;
