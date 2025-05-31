import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

export async function POST(req: NextRequest) {
  const { type, createdBy } = await req.json()

  if (type !== "working_hours") {
    return NextResponse.json({ message: "Неподдерживаемый тип отчета" }, { status: 400 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const employees = await prisma.employee.findMany({
    include: {
      schedules: {
        where: {
          date: { gte: startOfMonth },
        },
      },
    },
  })

  const rows = employees.map(emp => {
    const hours = emp.schedules.reduce((acc, s) => {
      const diff = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60)
      return acc + diff
    }, 0)

    return `${emp.lastName} ${emp.firstName},${emp.email},${Math.round(hours)}ч`
  })

  const header = "ФИО,Email,Часы за месяц"
  const csvContent = [header, ...rows].join("\n")

  const dir = join(process.cwd(), "public", "reports")
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const fileName = `отчет_по_рабочим_часам_${now.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  })}.csv`
  const filePath = join(dir, fileName)
  writeFileSync(filePath, csvContent)

  const saved = await prisma.report.create({
    data: {
      name: "Отчет по рабочим часам",
      type: "working_hours",
      description: `Сгенерирован за ${now.toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric",
      })}`,
      filePath: `/reports/${fileName}`,
      createdBy,
    },
  })

  return NextResponse.json(saved)
}
