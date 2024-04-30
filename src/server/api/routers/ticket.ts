import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { CreateTicketFormSchema } from "@/types/forms";
import { TRPCError } from "@trpc/server";

export const ticketRouter = createTRPCRouter({
  tickets: protectedProcedure
    .input(z.object({ userID: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.role === "ADMIN") {
        const tickets = await ctx.db.ticket.findMany();
        return tickets;
      } else {
        const tickets = await ctx.db.ticket.findMany({
          where: {
            userId: input.userID,
          },
        });
        return tickets;
      }
    }),
  create: protectedProcedure
    .input(CreateTicketFormSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role === "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Admins cannot create tickets",
        });
      }
      const ticket = await ctx.db.ticket.create({
        data: {
          title: input.title,
          category: input.category,
          priority: "LOW",
          status: "OPEN",
          content: [
            {
              userID: ctx.session.user.id,
              description: input.description,
            },
          ],
          userId: ctx.session.user.id,
        },
      });
      return ticket;
    }),
  reply: protectedProcedure
    .input(z.object({ ticketID: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: {
          id: input.ticketID,
        },
      });
      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }
      if (ticket.status === "CLOSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reply to a closed ticket",
        });
      }
      const reply = await ctx.db.ticket.update({
        where: {
          id: input.ticketID,
        },
        data: {
          ...ticket,
          content: [
            ...ticket.content,
            {
              userID: ctx.session.user.id,
              description: input.description,
            },
          ],
        },
      });
      return reply;
    }),
  changeTicketStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["OPEN", "CLOSED"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role === "USER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Users cannot change ticket status",
        });
      }
      const ticket = await ctx.db.ticket.findUnique({
        where: {
          id: input.ticketId,
        },
      });
      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }
      const updatedTicket = await ctx.db.ticket.update({
        where: {
          id: input.ticketId,
        },
        data: {
          status: input.status,
        },
      });
      return updatedTicket;
    }),
  changePriority: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: {
          id: input.ticketId,
        },
      });
      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }
      if (ticket.status === "CLOSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change priority of a closed ticket",
        });
      }
      const updatedTicket = await ctx.db.ticket.update({
        where: {
          id: input.ticketId,
        },
        data: {
          priority: input.priority,
        },
      });
      return updatedTicket;
    }),
});
