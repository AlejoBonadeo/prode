import { PossibleResult } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { Override } from "../../utils/override";

type Data = any;
type TypedRequest = Override<NextApiRequest, { body: Body }>;
type Body = {
  matchId: string;
  result: PossibleResult;
};

export default async function loadResult(
  req: TypedRequest,
  res: NextApiResponse<Data>
) {
  if (process.env.NODE_ENV !== "development") return res.status(404).end();

  const { matchId, result } = req.body;

  await prisma.result.create({ data: { result, matchId } });

  await prisma.user.updateMany({
    where: {
      votes: {
        some: {
          matchId,
          result,
        },
      },
    },
    data: { points: { increment: 1 } },
  });

  res.status(200).json({ ok: true });
}
