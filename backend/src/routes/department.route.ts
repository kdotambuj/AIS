import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { CreateDepartmentController } from "../controllers/department.controller.js";

const router = Router();

router.post('/create', CreateDepartmentController);

export default router;