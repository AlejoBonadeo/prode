import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createUserToken } from "../../../utils/jwt";
import { TRPCError } from "@trpc/server";
import { Country, Match, PossibleResult, User } from "@prisma/client";

const ZoDCountry = z.object({
  id: z.string(),
});

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
  castKnockoutVotes: protectedProcedure
    .input(
      z.object({
        quarters: z.array(ZoDCountry),
        semis: z.array(ZoDCountry),
        finals: z.array(ZoDCountry),
        thirdPlace: z.array(ZoDCountry),
        winners: z.array(z.number().min(0).max(1)),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const matches = await ctx.prisma.match.findMany({
        where: {
          group: null,
          country1: { isNot: null },
          country2: { isNot: null },
        },
        include: { country1: true, country2: true },
        orderBy: { id: "asc" },
      });

      matches.forEach(async (match, i) => {
        await ctx.prisma.vote.create({
          data: {
            matchId: match.id,
            country1Id: match.country1Id!,
            country2Id: match.country2Id!,
            result: `WIN_C_${
              input.quarters[i]!.id === match.country1Id ? "1" : "2"
            }`,
            userId: ctx.user!.id
          },
        });
      });

      for (let i = 0; i < input.quarters.length; i += 2) {
        await ctx.prisma.vote.create({
          data: {
            matchId: `q${i / 2 + 1}`,
            country1Id: input.quarters[i]!.id,
            country2Id: input.quarters[i + 1]!.id,
            result: `WIN_C_${
              input.semis[i / 2]!.id === input.quarters[i]!.id ? "1" : "2"
            }`,
            userId: ctx.user!.id
          },
        });
      }

      for (let i = 0; i < input.semis.length; i += 2) {
        await ctx.prisma.vote.create({
          data: {
            matchId: `s${i / 2 + 1}`,
            country1Id: input.semis[i]!.id,
            country2Id: input.semis[i + 1]!.id,
            result: `WIN_C_${
              input.finals[i / 2]!.id === input.semis[i]!.id ? "1" : "2"
            }`,
            userId: ctx.user!.id
          },
        });
      }

      await ctx.prisma.vote.create({
        data: {
          matchId: "3-4",
          country1Id: input.thirdPlace[0]!.id,
          country2Id: input.thirdPlace[1]!.id,
          result: `WIN_C_${(input.winners[1]! + 1) as 1 | 2}`,
          userId: ctx.user!.id
        },
      });
      await ctx.prisma.vote.create({
        data: {
          matchId: "f",
          country1Id: input.finals[0]!.id,
          country2Id: input.finals[1]!.id,
          result: `WIN_C_${(input.winners[0]! + 1) as 1 | 2}`,
          userId: ctx.user!.id
        },
      });
      return true;
    }),
});
