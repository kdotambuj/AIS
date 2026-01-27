import { prisma } from "../lib/prisma.js";
import { CreateTicketInput, TicketItemInput } from "../schema/ticket.schema.js";

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

export const GetAllTicketsService = async ()=>{
  const tickets =  await prisma.ticket.findMany({
    include:{
      ticketItems:true
    }
  })

  return tickets;
}
