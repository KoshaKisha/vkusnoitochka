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
      const start = record.startTime
      const end = record.endTime

      const hours =
        (end.getHours() * 60 + end.getMinutes() - start.getHours() * 60 - start.getMinutes()) / 60

      return [
        record.employee.firstName,
        record.date.toISOString().slice(0, 10),
        start.toTimeString().slice(0, 5),
        end.toTimeString().slice(0, 5),
        hours.toFixed(2),
      ]
    }),
  ]

  return rows.map((r) => r.join(",")).join("\n")
}

export async function getOvertimeCSV(dateFrom: Date, dateTo: Date) {
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

  const overtimeRecords = data
    .map((record) => {
      const start = record.startTime
      const end = record.endTime

      const hours =
        (end.getHours() * 60 + end.getMinutes() - start.getHours() * 60 - start.getMinutes()) / 60

      return {
        employee: record.employee,
        date: record.date.toISOString().slice(0, 10),
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        hours,
      }
    })
    .filter((r) => r.hours > 10)

  if (overtimeRecords.length === 0) {
    return "В выбранный период переработок не было"
  }

  const rows = [
    ["ФИО", "Дата", "Начало", "Конец", "Часов", "Сверхурочно"],
    ...overtimeRecords.map((r) => [
      `${r.employee.firstName} ${r.employee.lastName ?? ""}`.trim(),
      r.date,
      r.startTime,
      r.endTime,
      r.hours.toFixed(2),
      (r.hours - 8).toFixed(2),
    ]),
  ]

  return rows.map((row) => row.join(",")).join("\n")
}

export async function getVacationCSV() {
  const employees = await prisma.employee.findMany({
    include: {
      requests: {
        where: {
          type: "vacation",
          status: "approved",
        },
      },
    },
  })

  const rows: string[][] = [
    ["ФИО", "Период отпуска", "Дней в отпуске", "Всего дней в отпуске", "Остаток дней отпуска"],
  ]

  for (const employee of employees) {
    const fullName = `${employee.firstName} ${employee.lastName}`

    if (employee.requests.length === 0) {
      rows.push([fullName, "—", "0", "0", "28"])
      continue
    }

    let totalDaysUsed = 0

    for (const request of employee.requests) {
      const from = request.startDate.toISOString().slice(0, 10)
      const to = request.endDate.toISOString().slice(0, 10)

      const daysUsed =
        (request.endDate.getTime() - request.startDate.getTime()) /
          (1000 * 60 * 60 * 24) +
        1

      totalDaysUsed += daysUsed

      rows.push([
        fullName,
        `${from} - ${to}`,
        daysUsed.toString(),
        totalDaysUsed.toString(),
        (28 - totalDaysUsed).toFixed(0),
      ])
    }
  }

  return rows.map((row) => row.join(",")).join("\n")
}

