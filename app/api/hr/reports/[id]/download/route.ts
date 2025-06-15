import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getWorkHoursCSV, getOvertimeCSV, getVacationCSV } from "@/lib/reportGenerator"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const reportId = parseInt(params.id, 10)

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  })

  if (!report) {
    return NextResponse.json({ error: "Отчет не найден" }, { status: 404 })
  }

  let csv = ""

  switch (report.type) {
    case "time":
      csv = await getWorkHoursCSV(new Date(), new Date()) // тут можно добавить реальные даты
      break
    case "overtime":
      csv = await getOvertimeCSV(new Date(), new Date())
      break
    case "vacation":
      csv = await getVacationCSV()
      break
    default:
      return NextResponse.json({ error: "Тип отчета не поддерживается" }, { status: 400 })
  }

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${report.name.replace(/\s+/g, "_")}.csv"`,
    },
  })
}
