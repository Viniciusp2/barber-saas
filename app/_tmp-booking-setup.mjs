import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const owner = await prisma.user.upsert({
  where: { email: "e2e-booking-owner@example.com" },
  update: { role: "OWNER" },
  create: { email: "e2e-booking-owner@example.com", name: "Dono Booking Teste", role: "OWNER" },
});

let barbershop = await prisma.barbershop.findFirst({ where: { ownerId: owner.id } });
if (!barbershop) {
  barbershop = await prisma.barbershop.create({
    data: { name: "Barbearia Booking Teste", ownerId: owner.id, openingHour: 9, closingHour: 19 },
  });
}

let staff = await prisma.staff.findFirst({ where: { barbershopId: barbershop.id } });
if (!staff) {
  staff = await prisma.staff.create({ data: { name: "Barbeiro Booking", barbershopId: barbershop.id } });
}

let service = await prisma.service.findFirst({ where: { barbershopId: barbershop.id } });
if (!service) {
  service = await prisma.service.create({
    data: { name: "Corte Simples", durationMin: 30, price: 40, barbershopId: barbershop.id },
  });
}

// Limpa agendamentos anteriores desse staff pra teste ficar deterministico
await prisma.appointment.deleteMany({ where: { staffId: staff.id } });

console.log(JSON.stringify({ barbershopId: barbershop.id, staffId: staff.id, serviceId: service.id, ownerId: owner.id }));

await prisma.$disconnect();
