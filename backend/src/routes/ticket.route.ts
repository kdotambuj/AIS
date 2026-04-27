import {
  CreateStudentTicketBatchController,
  CreateTicketController,
  GetAllTicketsController,
  GetMyRequestedTicketsController,
  GetResourceAvailabilityController,
  GetMyAuthorityTicketsController,
  UpdateTicketItemStatusController,
  UpdateTicketItemsStatusController,
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

router.post(
  "/create-batch",
  authMiddleware,
  authorizeRoles("STUDENT"),
  CreateStudentTicketBatchController,
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

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("STUDENT"),
  GetMyRequestedTicketsController,
);

router.get(
  "/resource-availability",
  authMiddleware,
  authorizeRoles("STUDENT", "LAB_INCHARGE", "ADMIN"),
  GetResourceAvailabilityController,
);

router.patch(
  "/update-item-status",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE"),
  UpdateTicketItemStatusController,
);

router.patch(
  "/update-items-status",
  authMiddleware,
  authorizeRoles("LAB_INCHARGE"),
  UpdateTicketItemsStatusController,
);

export default router;
