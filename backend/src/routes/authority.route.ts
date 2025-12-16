import { Router } from "express";
import { CreateAuthorityController } from "../controllers/authority.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("ADMIN"),
  CreateAuthorityController
);

export default router;
