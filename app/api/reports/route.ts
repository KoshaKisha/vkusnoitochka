import { writeFile } from "fs/promises"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { format } from "date-fns"
import { getWorkHoursCSV,  getOvertimeCSV, getVacationCSV } from "@/lib/reportGenerator"

export async function POST(req: NextRequest) {
  try {
    const { type, dateFrom, dateTo, createdBy } = await req.json()

    const from = new Date(dateFrom)
    const to = new Date(dateTo)

    let csvContent = ""
    let reportName = ""
    let filePrefix = ""
    let description = ""

    switch (type) {
      case "time":
        csvContent = await getWorkHoursCSV(from, to)
        reportName = `Отчет по рабочему времени за ${format(from, "dd.MM.yyyy")} - ${format(to, "dd.MM.yyyy")}`
        filePrefix = "workhours"
        description = "Автоматически сгенерированный отчет по рабочему времени"
        break

      case "overtime":
        csvContent = await getOvertimeCSV(from, to)
        reportName = `Отчет по переработкам за ${format(from, "dd.MM.yyyy")} - ${format(to, "dd.MM.yyyy")}`
        filePrefix = "overtime"
        description = "Автоматически сгенерированный отчет по переработкам"
        break

      case "vacation":
        csvContent = await getVacationCSV()
        reportName = `Отчет по отпускам`
        filePrefix = "vacation"
        description = "Автоматически сгенерированный отчет по отпускам"
        break

      default:
        return NextResponse.json({ error: "Неизвестный тип отчета" }, { status: 400 })
    }

    const fileName = `report_${filePrefix}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
    const filePath = `/reports/${fileName}`
    const absolutePath = join(process.cwd(), "public", "reports", fileName)

    await writeFile(absolutePath, csvContent)

    const report = await prisma.report.create({
      data: {
        name: reportName,
        type,
        description,
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
