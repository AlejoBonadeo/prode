import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createUserToken } from "../../../utils/jwt";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const foundUser = await ctx.prisma.user.findUnique({
        where: { name: input.name },
      });

      if (!foundUser) {
        const newPassword = await hash(input.password, 10);
        const newUser = await ctx.prisma.user.create({
          data: { ...input, password: newPassword },
        });
        const token = createUserToken(newUser);
        return { user: { ...newUser, password: undefined }, token };
      }

      if (!(await compare(input.password, foundUser.password))) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const token = createUserToken(foundUser);
      return { user: { ...foundUser, password: undefined }, token };
    }),
});
