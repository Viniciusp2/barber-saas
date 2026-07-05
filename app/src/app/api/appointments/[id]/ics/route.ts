import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildIcsContent } from "@/lib/calendar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, staff: true, barbershop: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  const start = appointment.date;
  const end = new Date(start.getTime() + appointment.service.durationMin * 60_000);

  const ics = buildIcsContent({
    uid: `appointment-${appointment.id}@barber-saas`,
    title: `${appointment.service.name} — ${appointment.barbershop.name}`,
    description: `Agendamento com ${appointment.staff.name} na ${appointment.barbershop.name}.`,
    location: appointment.barbershop.address ?? appointment.barbershop.name,
    start,
    end,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agendamento.ics"',
    },
  });
}
