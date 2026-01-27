import { z } from "zod";

export const TicketItemSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),

  quantity: z.number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),

  from: z.coerce.date(),
  till: z.coerce.date(),
}).refine(
  (data) => data.from < data.till,
  {
    message: "`from` must be before `till`",
    path: ["till"],
  }
);

export const CreateTicketSchema = z.object({
  requestedUserId: z.string().min(1, "Requested user ID is required"),

  authorityId: z.string().min(1, "Authority ID is required"),

  ticketItems: z.array(TicketItemSchema)
    .min(1, "At least one ticket item is required"),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type TicketItemInput = z.infer<typeof TicketItemSchema>;
