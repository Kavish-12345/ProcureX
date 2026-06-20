import { PrismaClient } from "@prisma/client/extension";

// Standard practice to create one instance (Connection pool)
const prisma = new PrismaClient();

export default prisma;

