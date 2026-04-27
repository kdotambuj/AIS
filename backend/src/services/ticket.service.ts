import { prisma } from "../lib/prisma.js";
import {
  CreateStudentTicketBatchInput,
  CreateTicketInput,
  ResourceAvailabilityQueryInput,
  TicketItemInput,
  UpdateTicketItemsStatusInput,
} from "../schema/ticket.schema.js";
import {
  TicketItemStatus,
  TicketStatus,
} from "../../generated/prisma/enums.js";

// Availability must depend on approval outcome.
// Pending requests should NOT block inventory.
const BLOCKING_STATUSES: TicketItemStatus[] = ["ACCEPTED", "ISSUED"];

export const CreateTicketService = async (data: CreateTicketInput) => {
  if (!data.ticketItems || data.ticketItems.length == 0)
    throw new Error("At least one ticket item is needed");

  const requestedResourceIds = Array.from(
    new Set(data.ticketItems.map((item) => item.resourceId)),
  );

  const resources = await prisma.resource.findMany({
    where: {
      id: {
        in: requestedResourceIds,
      },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      resourceCategory: {
        select: {
          authorityId: true,
        },
      },
    },
  });

  if (resources.length !== requestedResourceIds.length) {
    throw new Error("One or more selected resources were not found");
  }

  const resourceMap = new Map(
    resources.map((resource) => [resource.id, resource]),
  );

  const groupedByWindow = data.ticketItems.reduce<
    Map<
      string,
      Array<{ resourceId: string; quantity: number; from: Date; till: Date }>
    >
  >((acc, item) => {
    const key = `${item.from.toISOString()}__${item.till.toISOString()}`;
    const bucket = acc.get(key) ?? [];
    bucket.push(item);
    acc.set(key, bucket);
    return acc;
  }, new Map());

  for (const [, itemsInWindow] of groupedByWindow.entries()) {
    const from = itemsInWindow[0].from;
    const till = itemsInWindow[0].till;

    const aggregatedByResource = itemsInWindow.reduce<Map<string, number>>(
      (acc, item) => {
        const current = acc.get(item.resourceId) ?? 0;
        acc.set(item.resourceId, current + item.quantity);
        return acc;
      },
      new Map(),
    );

    const resourceIds = Array.from(aggregatedByResource.keys());
    const blockedByResource = await getBlockedQuantityByResource(
      resourceIds,
      from,
      till,
    );

    for (const [
      resourceId,
      requestedQuantity,
    ] of aggregatedByResource.entries()) {
      const resource = resourceMap.get(resourceId);

      if (!resource) {
        throw new Error("Resource mapping failed");
      }

      if (resource.resourceCategory.authorityId !== data.authorityId) {
        throw new Error(
          `${resource.name} does not belong to the selected authority`,
        );
      }

      const blockedQuantity = blockedByResource.get(resourceId) ?? 0;
      const availableQuantity = Math.max(
        resource.quantity - blockedQuantity,
        0,
      );

      if (requestedQuantity > availableQuantity) {
        throw new Error(
          `Insufficient availability for ${resource.name}. Available quantity: ${availableQuantity}`,
        );
      }
    }
  }

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

export const GetMyRequestedTicketsService = async (userId: string) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      requestedUserId: userId,
    },
    include: {
      authority: {
        select: {
          id: true,
          name: true,
          location: true,
          department: {
            select: {
              id: true,
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
              quantity: true,
              resourceCategory: {
                select: {
                  id: true,
                  name: true,
                  authorityId: true,
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

const getBlockedQuantityByResource = async (
  resourceIds: string[],
  from: Date,
  till: Date,
) => {
  const overlappingItems = await prisma.ticketItem.findMany({
    where: {
      resourceId: {
        in: resourceIds,
      },
      status: {
        in: BLOCKING_STATUSES,
      },
      from: {
        lt: till,
      },
      till: {
        gt: from,
      },
    },
    select: {
      resourceId: true,
      quantity: true,
    },
  });

  return overlappingItems.reduce<Map<string, number>>((acc, item) => {
    const current = acc.get(item.resourceId) ?? 0;
    acc.set(item.resourceId, current + item.quantity);
    return acc;
  }, new Map());
};

export const GetResourceAvailabilityService = async (
  query: ResourceAvailabilityQueryInput,
) => {
  const whereClause = query.resourceIds?.length
    ? {
        id: {
          in: query.resourceIds,
        },
      }
    : undefined;

  const resources = await prisma.resource.findMany({
    where: whereClause,
    select: {
      id: true,
      quantity: true,
      resourceCategory: {
        select: {
          authorityId: true,
        },
      },
    },
  });

  if (!resources.length) {
    return [];
  }

  const blockedByResource = await getBlockedQuantityByResource(
    resources.map((resource) => resource.id),
    query.from,
    query.till,
  );

  return resources.map((resource) => {
    const blockedQuantity = blockedByResource.get(resource.id) ?? 0;
    const availableQuantity = Math.max(resource.quantity - blockedQuantity, 0);

    return {
      resourceId: resource.id,
      authorityId: resource.resourceCategory.authorityId,
      totalQuantity: resource.quantity,
      blockedQuantity,
      availableQuantity,
    };
  });
};

export const CreateStudentTicketBatchService = async (
  userId: string,
  data: CreateStudentTicketBatchInput,
) => {
  const student = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      rollNumber: true,
      enrollmentNumber: true,
    },
  });

  if (!student || student.role !== "STUDENT") {
    throw new Error("Only students can create resource requests");
  }

  if (!student.rollNumber || !student.enrollmentNumber) {
    throw new Error(
      "Please update roll number and enrollment number before requesting resources",
    );
  }

  const aggregatedItems = data.ticketItems.reduce<
    Map<string, { resourceId: string; quantity: number }>
  >((acc, item) => {
    const existing = acc.get(item.resourceId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.set(item.resourceId, {
        resourceId: item.resourceId,
        quantity: item.quantity,
      });
    }
    return acc;
  }, new Map());

  const requestedItems = Array.from(aggregatedItems.values());
  const requestedResourceIds = requestedItems.map((item) => item.resourceId);

  const resources = await prisma.resource.findMany({
    where: {
      id: {
        in: requestedResourceIds,
      },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      resourceCategory: {
        select: {
          id: true,
          authorityId: true,
        },
      },
    },
  });

  if (resources.length !== requestedResourceIds.length) {
    throw new Error("One or more selected resources were not found");
  }

  const resourceMap = new Map(
    resources.map((resource) => [resource.id, resource]),
  );

  const blockedByResource = await getBlockedQuantityByResource(
    requestedResourceIds,
    data.from,
    data.till,
  );

  for (const item of requestedItems) {
    const resource = resourceMap.get(item.resourceId);
    if (!resource) {
      throw new Error("Resource mapping failed");
    }

    const blockedQuantity = blockedByResource.get(item.resourceId) ?? 0;
    const availableQuantity = Math.max(resource.quantity - blockedQuantity, 0);

    if (item.quantity > availableQuantity) {
      throw new Error(
        `Insufficient availability for ${resource.name}. Available quantity: ${availableQuantity}`,
      );
    }
  }

  const groupedByAuthority = requestedItems.reduce<
    Map<
      string,
      {
        authorityId: string;
        ticketItems: Array<{ resourceId: string; quantity: number }>;
      }
    >
  >((acc, item) => {
    const resource = resourceMap.get(item.resourceId);

    if (!resource) {
      return acc;
    }

    const authorityId = resource.resourceCategory.authorityId;
    const existingGroup = acc.get(authorityId);

    if (existingGroup) {
      existingGroup.ticketItems.push({
        resourceId: item.resourceId,
        quantity: item.quantity,
      });
    } else {
      acc.set(authorityId, {
        authorityId,
        ticketItems: [
          {
            resourceId: item.resourceId,
            quantity: item.quantity,
          },
        ],
      });
    }

    return acc;
  }, new Map());

  const groups = Array.from(groupedByAuthority.values());

  const createdTickets = await prisma.$transaction(async (tx) => {
    const ticketIds: string[] = [];

    for (const group of groups) {
      const createdTicket = await tx.ticket.create({
        data: {
          requestedUserId: userId,
          authorityId: group.authorityId,
          ticketItems: {
            create: group.ticketItems.map((item) => ({
              resourceId: item.resourceId,
              quantity: item.quantity,
              from: data.from,
              till: data.till,
            })),
          },
        },
        select: {
          id: true,
        },
      });

      ticketIds.push(createdTicket.id);
    }

    return ticketIds;
  });

  return {
    createdTicketCount: createdTickets.length,
    createdTicketIds: createdTickets,
    groupedAuthorityCount: groups.length,
  };
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

export const UpdateTicketItemsStatusService = async (
  ticketId: string,
  items: UpdateTicketItemsStatusInput["items"],
  userId: string,
) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      authority: true,
      ticketItems: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.authority.ownerId !== userId) {
    throw new Error("Unauthorized to update this ticket");
  }

  const ticketItemMap = new Map(
    ticket.ticketItems.map((ticketItem) => [ticketItem.id, ticketItem]),
  );

  for (const itemDecision of items) {
    const ticketItem = ticketItemMap.get(itemDecision.ticketItemId);

    if (!ticketItem) {
      throw new Error("One or more ticket items do not belong to this ticket");
    }

    if (ticketItem.status !== "PENDING") {
      throw new Error("Only pending ticket items can be accepted or rejected");
    }
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    for (const itemDecision of items) {
      await tx.ticketItem.update({
        where: {
          id: itemDecision.ticketItemId,
        },
        data: {
          status: itemDecision.status,
          approvedBy: userId,
          approvedAt: now,
        },
      });
    }
  });

  await updateTicketStatusBasedOnItems(ticketId);

  const updatedItems = await prisma.ticketItem.findMany({
    where: {
      id: {
        in: items.map((item) => item.ticketItemId),
      },
    },
  });

  return updatedItems;
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
