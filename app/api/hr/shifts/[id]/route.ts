import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const shiftId = Number.parseInt(params.id)

    if (isNaN(shiftId)) {
      return NextResponse.json({ error: "Неверный ID смены" }, { status: 400 })
    }

    const { date, startTime, endTime } = await req.json()

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 400 })
    }

    // Validate date format
    const shiftDate = new Date(date)
    if (isNaN(shiftDate.getTime())) {
      return NextResponse.json({ error: "Некорректный формат даты" }, { status: 400 })
    }

    // Create proper datetime objects for start and end times
    const formattedDate = date // Should be in YYYY-MM-DD format
    const startDateTime = new Date(`${formattedDate}T${startTime}:00`)
    const endDateTime = new Date(`${formattedDate}T${endTime}:00`)

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json({ error: "Некорректный формат времени" }, { status: 400 })
    }

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      return NextResponse.json({ error: "Время окончания должно быть позже времени начала" }, { status: 400 })
    }

    // Check if shift exists
    const existingShift = await prisma.schedule.findUnique({
      where: { id: shiftId },
    })

    if (!existingShift) {
      return NextResponse.json({ error: "Смена не найдена" }, { status: 404 })
    }

    const updated = await prisma.schedule.update({
      where: { id: shiftId },
      data: {
        date: shiftDate,
        startTime: startDateTime,
        endTime: endDateTime,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Ошибка обновления смены:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
    try {
    const params = await context.params
    const shiftId = Number.parseInt(params.id)
    if (isNaN(shiftId)) {
      return NextResponse.json({ error: "Некорректный ID смены" }, { status: 400 })
    }

    // Проверка, существует ли смена
    const existingShift = await prisma.schedule.findUnique({
      where: { id: shiftId },
    })

    if (!existingShift) {
      return NextResponse.json({ error: "Смена не найдена" }, { status: 404 })
    }

    await prisma.schedule.delete({
      where: { id: shiftId },
    })

    return NextResponse.json({ message: "Смена успешно удалена" })
  } catch (error) {
    console.error("Ошибка при удалении смены:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
