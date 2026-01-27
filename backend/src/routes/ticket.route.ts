import { CreateTicketController, GetAllTicketsController } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("STUDENT"),
  CreateTicketController
);

router.get('/get', authMiddleware, authorizeRoles('ADMIN', 'STUDENT', 'LAB_INCHARGE'), GetAllTicketsController)

export default router;