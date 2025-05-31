import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params

  const employeeId = parseInt(id)
  if (isNaN(employeeId)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 })
  }

  const body = await req.json()
  const { status } = body

  const allowedStatuses = ["Активен", "В отпуске", "На больничном", "Уволен"]
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 })
  }

  try {
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Ошибка при обновлении статуса сотрудника:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
