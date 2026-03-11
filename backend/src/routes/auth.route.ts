import { Router } from "express";
import {
  SignupController,
  LoginController,
  GetMeController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", SignupController);
router.post("/login", LoginController);
router.get("/me", authMiddleware, GetMeController);

export default router;
