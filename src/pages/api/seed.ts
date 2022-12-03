import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

type Data = any;

export default async function seed(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (process.env.NODE_ENV !== "development") return res.status(404).end();

  await prisma.user.updateMany({
    data: {
      points: {
        divide: 2
      }
    }
  })

  res.status(200).json({ ok: "MESSI" });
}
