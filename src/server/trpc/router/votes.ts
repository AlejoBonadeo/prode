import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createUserToken } from "../../../utils/jwt";
import { TRPCError } from "@trpc/server";
import { PossibleResult } from "@prisma/client";

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
        const votes = await ctx.prisma.vote.createMany({
          data: input.map((v) => ({ ...v, userId: ctx.user!.id })),
        });
        return votes;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
