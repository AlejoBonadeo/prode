// src/server/router/context.ts
import { User } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "../db/client";
import { verifyUserToken } from '../../utils/jwt';

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = Record<string, never>;

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async ({req}: CreateNextContextOptions) => {
  const { token = "" } = req.cookies;

 const user = await verifyUserToken(token);

  return {...(await createContextInner({})), user};
};

export type Context = inferAsyncReturnType<typeof createContext>;
