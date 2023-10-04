import type { Lead } from "@prisma/client";
import { prisma } from "~/server/db.server";

export function deleteLead({ id }: Pick<Lead, "id">) {
  return prisma.lead.deleteMany({
    where: { id },
  });
}
