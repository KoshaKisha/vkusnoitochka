import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

function getEmployeeIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    return decoded.id
  } catch (e) {
    return null
  }
}

export async function GET(req: Request) {
  const employeeId = getEmployeeIdFromRequest(req)

  if (!employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
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

export async function POST(req: Request) {
  const employeeId = getEmployeeIdFromRequest(req)

  if (!employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { date, startTime, endTime } = body

    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(`${date}T${endTime}:00`)
    const parsedDate = new Date(date)

    const schedule = await prisma.schedule.create({
      data: {
        date: parsedDate,
        startTime: start,
        endTime: end,
        employeeId,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ошибка при создании смены" }, { status: 500 })
  }
}
