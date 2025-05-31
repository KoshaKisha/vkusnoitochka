import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { date, startTime, endTime, employeeId } = body

    // Преобразуем строки в Date
    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(`${date}T${endTime}:00`)
    const parsedDate = new Date(date)

    const schedule = await prisma.schedule.create({
      data: {
        date: parsedDate,
        startTime: start,
        endTime: end,
        employeeId: Number(employeeId),
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ошибка при создании смены" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const employeeId = Number(url.searchParams.get("employeeId"))

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId обязателен" }, { status: 400 })
    }

    const schedules = await prisma.schedule.findMany({
      where: { employeeId },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ошибка получения смен" }, { status: 500 })
  }
}
