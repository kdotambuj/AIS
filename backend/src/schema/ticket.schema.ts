import { z } from "zod";

export const TicketItemSchema = z
  .object({
    resourceId: z.string().min(1, "Resource ID is required"),

    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0"),

    from: z.coerce.date(),
    till: z.coerce.date(),
  })
  .refine((data) => data.from < data.till, {
    message: "`from` must be before `till`",
    path: ["till"],
  });

export const CreateTicketSchema = z.object({
  requestedUserId: z.string().min(1, "Requested user ID is required"),

  authorityId: z.string().min(1, "Authority ID is required"),

  ticketItems: z
    .array(TicketItemSchema)
    .min(1, "At least one ticket item is required"),
});

export const UpdateTicketItemStatusSchema = z.object({
  ticketItemId: z.string().min(1, "Ticket item ID is required"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "ISSUED", "RETURNED"]),
});

export const UpdateTicketItemsStatusSchema = z
  .object({
    ticketId: z.string().min(1, "Ticket ID is required"),
    items: z
      .array(
        z.object({
          ticketItemId: z.string().min(1, "Ticket item ID is required"),
          status: z.enum(["ACCEPTED", "REJECTED"]),
        }),
      )
      .min(1, "At least one ticket item decision is required"),
  })
  .refine(
    (data) => {
      const uniqueCount = new Set(data.items.map((item) => item.ticketItemId))
        .size;
      return uniqueCount === data.items.length;
    },
    {
      message: "Duplicate ticket item decisions are not allowed",
      path: ["items"],
    },
  );

// Base object – plain ZodObject so we can .extend() it before adding refinements
const TwoHourWindowBase = z.object({
  from: z.coerce.date(),
  till: z.coerce.date(),
});

// Shared refinements applied after extending
function applyTwoHourWindowRefinements<T extends { from: Date; till: Date }>(
  schema: z.ZodType<T>,
) {
  return schema
    .refine((data) => data.from < data.till, {
      message: "`from` must be before `till`",
      path: ["till"],
    })
    .refine(
      (data) => {
        const durationMs = data.till.getTime() - data.from.getTime();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        return durationMs >= twoHoursMs && durationMs % twoHoursMs === 0;
      },
      {
        message:
          "Requested duration must be at least 2 hours and in 2-hour continuous blocks",
        path: ["till"],
      },
    );
}

export const CreateStudentTicketItemSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
});

export const CreateStudentTicketBatchSchema = applyTwoHourWindowRefinements(
  TwoHourWindowBase.extend({
    ticketItems: z
      .array(CreateStudentTicketItemSchema)
      .min(1, "At least one ticket item is required"),
  }),
);

export const ResourceAvailabilityQuerySchema = applyTwoHourWindowRefinements(
  TwoHourWindowBase.extend({
    resourceIds: z.array(z.string()).optional(),
  }),
);

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type TicketItemInput = z.infer<typeof TicketItemSchema>;
export type UpdateTicketItemStatusInput = z.infer<
  typeof UpdateTicketItemStatusSchema
>;
export type UpdateTicketItemsStatusInput = z.infer<
  typeof UpdateTicketItemsStatusSchema
>;
export type CreateStudentTicketBatchInput = z.infer<
  typeof CreateStudentTicketBatchSchema
>;
export type ResourceAvailabilityQueryInput = z.infer<
  typeof ResourceAvailabilityQuerySchema
>;
