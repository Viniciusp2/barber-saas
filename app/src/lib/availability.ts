import { prisma } from "@/lib/prisma";

/** Granularidade da grade de horários oferecidos ao cliente. */
const SLOT_INTERVAL_MINUTES = 60;

export interface TimeSlot {
  start: Date;
  end: Date;
}

export async function getAvailableSlots(
  staffId: string,
  serviceId: string,
  date: Date
): Promise<TimeSlot[]> {
  const [staff, service] = await Promise.all([
    prisma.staff.findUnique({
      where: { id: staffId },
      include: { barbershop: { select: { id: true, openingHour: true, closingHour: true } } },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
  ]);

  if (!staff) {
    throw new Error("Barbeiro não encontrado.");
  }
  if (!service) {
    throw new Error("Serviço não encontrado.");
  }
  if (staff.barbershopId !== service.barbershopId) {
    throw new Error("O barbeiro e o serviço pertencem a barbearias diferentes.");
  }

  if (staff.daysOff.includes(date.getDay())) {
    return [];
  }

  const { openingHour, closingHour } = staff.barbershop;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const businessStart = addMinutes(dayStart, openingHour * 60);
  const businessEnd = addMinutes(dayStart, closingHour * 60);

  const [existingAppointments, timeOffs] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        staffId,
        date: { gte: dayStart, lte: dayEnd },
        status: { not: "CANCELLED" },
      },
      include: { service: { select: { durationMin: true } } },
    }),
    prisma.staffTimeOff.findMany({
      where: {
        staffId,
        startAt: { lte: dayEnd },
        endAt: { gte: dayStart },
      },
    }),
  ]);

  const busySlots: TimeSlot[] = [
    ...existingAppointments.map((appointment) => ({
      start: appointment.date,
      end: addMinutes(appointment.date, appointment.service.durationMin),
    })),
    ...timeOffs.map((timeOff) => ({ start: timeOff.startAt, end: timeOff.endAt })),
  ];

  const now = new Date();
  const availableSlots: TimeSlot[] = [];

  for (
    let slotStart = businessStart;
    addMinutes(slotStart, service.durationMin) <= businessEnd;
    slotStart = addMinutes(slotStart, SLOT_INTERVAL_MINUTES)
  ) {
    if (slotStart < now) {
      continue;
    }

    const slotEnd = addMinutes(slotStart, service.durationMin);
    const hasConflict = busySlots.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start
    );

    if (!hasConflict) {
      availableSlots.push({ start: slotStart, end: slotEnd });
    }
  }

  return availableSlots;
}

export interface AnyStaffTimeSlot extends TimeSlot {
  staffId: string;
}

/**
 * Igual a getAvailableSlots, mas considerando todos os barbeiros da barbearia.
 * Cada horário livre é atribuído ao primeiro barbeiro disponível naquele slot
 * (usado pela opção "qualquer barbeiro disponível" no agendamento).
 */
export async function getAvailableSlotsForAnyStaff(
  barbershopId: string,
  serviceId: string,
  date: Date
): Promise<AnyStaffTimeSlot[]> {
  const staffList = await prisma.staff.findMany({ where: { barbershopId } });

  const slotsByStaff = await Promise.all(
    staffList.map(async (staff) => ({
      staffId: staff.id,
      slots: await getAvailableSlots(staff.id, serviceId, date),
    }))
  );

  const merged = new Map<string, AnyStaffTimeSlot>();
  for (const { staffId, slots } of slotsByStaff) {
    for (const slot of slots) {
      const key = slot.start.toISOString();
      if (!merged.has(key)) {
        merged.set(key, { ...slot, staffId });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/**
 * Converte uma string "YYYY-MM-DD" (ex: valor de um <input type="date">) para
 * meia-noite no horário local. Não usar `new Date(str)` diretamente: uma
 * string apenas de data é interpretada como meia-noite em UTC, o que em
 * fusos negativos (como o do Brasil) resulta no dia anterior.
 */
export function parseLocalDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Inverso de parseLocalDateString: formata um Date como "YYYY-MM-DD" local. */
export function formatLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
