import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, context: { params: { employeeId: string } }) {
  try {
    const params = await context.params
    const employeeId = parseInt(params.employeeId, 10)
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Некорректный ID сотрудника" }, { status: 400 })
    }

    const shifts = await prisma.schedule.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error("Ошибка получения смен:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
