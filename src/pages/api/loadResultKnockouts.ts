import { PossibleResult } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { Override } from "../../utils/override";

type Data = any;
type TypedRequest = Override<NextApiRequest, { body: Body }>;
type Body = {
  matchId: string;
  result: PossibleResult;
  country1Id: string;
  country2Id: string;
  points1: number;
  points2: number;
};

export default async function loadResult(
  req: TypedRequest,
  res: NextApiResponse<Data>
) {
  if (process.env.NODE_ENV !== "development") return res.status(404).end();

  const { matchId, result, country1Id, country2Id, points1, points2 } =
    req.body;

  await prisma.result.create({ data: { result, matchId } });

  await prisma.user.updateMany({
    where: {
      votes: {
        some: {
          matchId,
          result,
          ...(result === 'WIN_C_1' && { country1Id }),
          ...(result === 'WIN_C_2' && { country2Id })
        },
      },
    },
    data: { points: { increment: points1 } },
  });
  await prisma.user.updateMany({
    where: {
      votes: {
        some: {
          matchId,
          result,
          country1Id,
          country2Id,
        },
      },
    },
    data: { points: { increment: points2 } },
  });
  
  res.status(200).json({ ok: true });
}
