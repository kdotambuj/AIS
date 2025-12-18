import { Router } from "express";
import { CreateResourceCategoryController } from "../controllers/resource.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";


const router = Router();

router.post('/create-category',authMiddleware, authorizeRoles('ADMIN', 'LAB_INCHARGE', 'HOD'), CreateResourceCategoryController);

export default router;