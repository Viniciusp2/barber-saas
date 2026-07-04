import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encode } from "next-auth/jwt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const existingShops = await prisma.barbershop.findMany({
  where: { owner: { email: "e2e-test@example.com" } },
  select: { id: true },
});
const shopIds = existingShops.map((s) => s.id);
if (shopIds.length > 0) {
  await prisma.staff.deleteMany({ where: { barbershopId: { in: shopIds } } });
  await prisma.service.deleteMany({ where: { barbershopId: { in: shopIds } } });
  await prisma.barbershop.deleteMany({ where: { id: { in: shopIds } } });
}

const user = await prisma.user.upsert({
  where: { email: "e2e-test@example.com" },
  update: { role: "USER" },
  create: {
    email: "e2e-test@example.com",
    name: "Teste E2E",
    role: "USER",
  },
});

const token = await encode({
  token: {
    sub: user.id,
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    picture: null,
  },
  secret: process.env.NEXTAUTH_SECRET,
  salt: "authjs.session-token",
});

console.log(JSON.stringify({ userId: user.id, cookie: token }));

await prisma.$disconnect();
