import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  CreateStudentTicketBatchSchema,
  CreateTicketSchema,
  ResourceAvailabilityQuerySchema,
  UpdateTicketItemStatusSchema,
  UpdateTicketItemsStatusSchema,
} from "../schema/ticket.schema.js";
import {
  CreateStudentTicketBatchService,
  CreateTicketService,
  GetAllTicketsService,
  GetMyRequestedTicketsService,
  GetResourceAvailabilityService,
  GetMyAuthorityTicketsService,
  UpdateTicketItemStatusService,
  UpdateTicketItemsStatusService,
} from "../services/ticket.service.js";

export const CreateTicketController = async (req: Request, res: Response) => {
  try {
    const data = CreateTicketSchema.parse(req.body);

    const ticket = await CreateTicketService(data);

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create ticket",
    });
  }
};

export const GetAllTicketsController = async (req: Request, res: Response) => {
  try {
    const tickets = await GetAllTicketsService();
    return res.status(200).json({
      success: true,
      message: "Tickets Fetched",
      data: tickets,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch tickets",
    });
  }
};

export const GetMyAuthorityTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tickets = await GetMyAuthorityTicketsService(userId);
    return res.status(200).json({
      success: true,
      message: "Authority tickets fetched",
      data: tickets,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch authority tickets",
    });
  }
};

export const GetMyRequestedTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tickets = await GetMyRequestedTicketsService(userId);
    return res.status(200).json({
      success: true,
      message: "Student tickets fetched",
      data: tickets,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch student tickets",
    });
  }
};

export const GetResourceAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const rawResourceIds = req.query.resourceIds;
    const parsedResourceIds =
      typeof rawResourceIds === "string" && rawResourceIds.trim().length > 0
        ? rawResourceIds.split(",").map((id) => id.trim())
        : undefined;

    const query = ResourceAvailabilityQuerySchema.parse({
      from: req.query.from,
      till: req.query.till,
      resourceIds: parsedResourceIds,
    });

    const availability = await GetResourceAvailabilityService(query);

    return res.status(200).json({
      success: true,
      message: "Resource availability fetched",
      data: availability,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch resource availability",
    });
  }
};

export const CreateStudentTicketBatchController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = CreateStudentTicketBatchSchema.parse(req.body);

    const result = await CreateStudentTicketBatchService(userId, data);

    return res.status(201).json({
      success: true,
      message: "Ticket request submitted successfully",
      data: result,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to submit ticket request",
    });
  }
};

export const UpdateTicketItemStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = UpdateTicketItemStatusSchema.parse(req.body);

    const updatedItem = await UpdateTicketItemStatusService(
      data.ticketItemId,
      data.status,
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Ticket item status updated",
      data: updatedItem,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update ticket item status",
    });
  }
};

export const UpdateTicketItemsStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = UpdateTicketItemsStatusSchema.parse(req.body);

    const updatedItems = await UpdateTicketItemsStatusService(
      data.ticketId,
      data.items,
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Ticket item statuses updated",
      data: updatedItems,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update ticket item statuses",
    });
  }
};
