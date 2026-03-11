import {
  CreateTicketController,
  GetAllTicketsController,
  GetMyAuthorityTicketsController,
  UpdateTicketItemStatusController,
} from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("STUDENT"),
  CreateTicketController,
);

router.get(
  "/get",
  authMiddleware,
  authorizeRoles("ADMIN", "STUDENT", "LAB_INCHARGE"),
  GetAllTicketsController,
);

router.get(
  "/my-authority",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE"),
  GetMyAuthorityTicketsController,
);

router.patch(
  "/update-item-status",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE"),
  UpdateTicketItemStatusController,
);

export default router;
