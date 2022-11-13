import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

type Data = any;

export default async function seed(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (process.env.NODE_ENV !== "development") return res.status(404).end();
  await prisma.user.deleteMany({});
  // await prisma.country.createMany({ data: req.body.countries });
  // await prisma.match.createMany({ data: req.body.matches });

  res.status(200).json({ ok: true });
}
