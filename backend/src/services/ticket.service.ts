import { prisma } from "../lib/prisma.js";
import { CreateTicketInput, TicketItemInput } from "../schema/ticket.schema.js";
import {
  TicketItemStatus,
  TicketStatus,
} from "../../generated/prisma/enums.js";

export const CreateTicketService = async (data: CreateTicketInput) => {
  if (!data.ticketItems || data.ticketItems.length == 0)
    throw new Error("At least one ticket item is needed");

  const ticket = await prisma.$transaction(async (tx) => {
    const createdTicket = await tx.ticket.create({
      data: {
        requestedUserId: data.requestedUserId,
        authorityId: data.authorityId,
      },
    });

    const itemsData = data.ticketItems.map((item: TicketItemInput) => ({
      ticketId: createdTicket.id,
      resourceId: item.resourceId,
      quantity: item.quantity,
      from: item.from,
      till: item.till,
    }));

    await tx.ticketItem.createMany({
      data: itemsData,
    });
    return createdTicket;
  });

  return ticket;
};

export const GetAllTicketsService = async () => {
  const tickets = await prisma.ticket.findMany({
    include: {
      ticketItems: true,
    },
  });

  return tickets;
};

export const GetAuthorityTicketsService = async (authorityId: string) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      authorityId: authorityId,
    },
    include: {
      requestedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
      ticketItems: {
        include: {
          resource: {
            select: {
              id: true,
              name: true,
              model: true,
              resourceCategory: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tickets;
};

export const GetMyAuthorityTicketsService = async (userId: string) => {
  // First get the authority owned by this user
  const authority = await prisma.resourceAuthority.findUnique({
    where: {
      ownerId: userId,
    },
  });

  if (!authority) {
    throw new Error("No authority found for this user");
  }

  return GetAuthorityTicketsService(authority.id);
};

export const UpdateTicketItemStatusService = async (
  ticketItemId: string,
  status: TicketItemStatus,
  userId: string,
) => {
  const ticketItem = await prisma.ticketItem.findUnique({
    where: { id: ticketItemId },
    include: {
      ticket: {
        include: {
          authority: true,
        },
      },
    },
  });

  if (!ticketItem) {
    throw new Error("Ticket item not found");
  }

  // Verify the user owns the authority
  if (ticketItem.ticket.authority.ownerId !== userId) {
    throw new Error("Unauthorized to update this ticket item");
  }

  const updateData: any = {
    status,
  };

  // Add metadata based on status
  if (status === "ACCEPTED" || status === "REJECTED") {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  } else if (status === "ISSUED") {
    updateData.issuedBy = userId;
    updateData.issuedAt = new Date();
  } else if (status === "RETURNED") {
    updateData.returnedAt = new Date();
    updateData.receivedBy = userId;
  }

  const updatedItem = await prisma.ticketItem.update({
    where: { id: ticketItemId },
    data: updateData,
  });

  // Update ticket status based on all items
  await updateTicketStatusBasedOnItems(ticketItem.ticketId);

  return updatedItem;
};

const updateTicketStatusBasedOnItems = async (ticketId: string) => {
  const items = await prisma.ticketItem.findMany({
    where: { ticketId },
  });

  let newStatus: TicketStatus = "PENDING";

  const allRejected = items.every((item) => item.status === "REJECTED");
  const allReturned = items.every(
    (item) => item.status === "RETURNED" || item.status === "REJECTED",
  );
  const hasAccepted = items.some(
    (item) => item.status === "ACCEPTED" || item.status === "ISSUED",
  );

  if (allRejected) {
    newStatus = "REJECTED";
  } else if (allReturned) {
    newStatus = "RESOLVED";
  } else if (hasAccepted) {
    newStatus = "APPROVED";
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { ticketStatus: newStatus },
  });
};
