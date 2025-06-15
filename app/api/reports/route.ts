import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"
import { getWorkHoursCSV, getOvertimeCSV, getVacationCSV } from "@/lib/reportGenerator"

export async function POST(req: NextRequest) {
  try {
    const { type, dateFrom, dateTo } = await req.json()

    const from = new Date(dateFrom)
    const to = new Date(dateTo)

    let csvContent = ""
    let fileName = ""

    switch (type) {
      case "time":
        csvContent = await getWorkHoursCSV(from, to)
        fileName = `workhours_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
        break
      case "overtime":
        csvContent = await getOvertimeCSV(from, to)
        fileName = `overtime_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
        break
      case "vacation":
        csvContent = await getVacationCSV()
        fileName = `vacation_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
        break
      default:
        return NextResponse.json({ error: "Неизвестный тип отчета" }, { status: 400 })
    }

    // Добавляем BOM и отдаем файл
    const utf8WithBom = '\uFEFF' + csvContent

    return new NextResponse(utf8WithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Ошибка генерации отчета:", error)
    return NextResponse.json({ error: "Ошибка генерации отчета" }, { status: 500 })
  }
}
