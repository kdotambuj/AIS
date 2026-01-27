import { Request, Response } from "express";
import { ZodError } from "zod";
import { CreateTicketSchema } from "../schema/ticket.schema.js";
import {
  CreateTicketService,
  GetAllTicketsService,
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
