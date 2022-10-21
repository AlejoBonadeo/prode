// src/server/router/_app.ts
import { router } from "../trpc";

import { exampleRouter } from "./example";
import { authRouter } from './auth';
import { votesRouter } from './votes';

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  votes: votesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
