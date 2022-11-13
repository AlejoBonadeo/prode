import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createUserToken } from "../../../utils/jwt";
import { TRPCError } from "@trpc/server";
import { PossibleResult, User } from "@prisma/client";

export const votesRouter = router({
  castVotes: protectedProcedure
    .input(
      z.array(
        z.object({
          matchId: z.string(),
          result: z.nativeEnum(PossibleResult),
          country1Id: z.string(),
          country2Id: z.string(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(ctx.user);
        const votes = await ctx.prisma.vote.createMany({
          data: input.map((v) => ({ ...v, userId: ctx.user!.id })),
        });
        return votes;
      } catch (error) {
        console.log(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLeaderboard: publicProcedure.query(async ({ ctx }): Promise<User[]> => {
    try {
      return ctx.prisma.user.findMany({
        where: { votes: { some: {} } },
        orderBy: { points: "desc" },
      });
    } catch (error) {
      return [];
    }
  }),
});
