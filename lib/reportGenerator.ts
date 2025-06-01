import { prisma } from "@/lib/prisma"

export async function getWorkHoursCSV(dateFrom: Date, dateTo: Date) {
  const data = await prisma.schedule.findMany({
    where: {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    include: {
      employee: true,
    },
  })

  const rows = [
    ["ФИО", "Дата", "Начало", "Конец", "Часов"],
    ...data.map((record) => {
      const start = new Date(`1970-01-01T${record.startTime}`)
      const end = new Date(`1970-01-01T${record.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return [record.employee.firstName, record.date.toISOString().slice(0, 10), record.startTime, record.endTime, hours.toFixed(2)]
    }),
  ]

  return rows.map((r) => r.join(",")).join("\n")
}
