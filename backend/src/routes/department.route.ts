import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { CreateDepartmentController, GetAllDepartmentController } from "../controllers/department.controller.js";

const router = Router();

router.post('/create', CreateDepartmentController);
router.get('/get', GetAllDepartmentController)

export default router;