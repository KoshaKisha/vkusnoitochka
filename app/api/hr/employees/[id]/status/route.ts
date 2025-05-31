import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const body = await req.json()
  const { manualStatus } = body

  const allowedStatuses = ["Активен", "В отпуске", "На больничном", "Уволен"]

  if (!allowedStatuses.includes(manualStatus)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 })
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: {
        manualStatus,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка обновления статуса сотрудника:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

