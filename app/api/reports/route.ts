import { writeFile } from "fs/promises"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { format } from "date-fns"
import { getWorkHoursCSV } from "@/lib/reportGenerator"

export async function POST(req: NextRequest) {
  try {
    const { type, dateFrom, dateTo, createdBy } = await req.json()

    // Получение CSV-содержимого
    const csvContent = await getWorkHoursCSV(new Date(dateFrom), new Date(dateTo))

    const fileName = `report_time_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
    const filePath = `/reports/${fileName}`

    const absolutePath = join(process.cwd(), "public", "reports", fileName)
    await writeFile(absolutePath, csvContent)

    const report = await prisma.report.create({
      data: {
        name: `Отчет по рабочему времени за ${format(new Date(dateFrom), "dd.MM.yyyy")} - ${format(new Date(dateTo), "dd.MM.yyyy")}`,
        type: "time",
        description: "Автоматически сгенерированный отчет по рабочему времени",
        filePath,
        createdBy,
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Ошибка генерации отчета:", error)
    return NextResponse.json({ error: "Ошибка генерации отчета" }, { status: 500 })
  }
}
