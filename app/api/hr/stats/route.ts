import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [currentMonthSchedules, prevMonthSchedules] = await Promise.all([
      prisma.schedule.findMany({
        where: {
          startTime: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
      }),
      prisma.schedule.findMany({
        where: {
          startTime: {
            gte: prevMonthStart,
            lte: prevMonthEnd,
          },
        },
      }),
    ])

    const getTotalHours = (schedules: typeof currentMonthSchedules) => {
      return schedules.reduce((acc, shift) => {
        const start = new Date(shift.startTime).getTime()
        const end = new Date(shift.endTime).getTime()
        const hours = (end - start) / (1000 * 60 * 60) // в часах
        return acc + hours
      }, 0)
    }

    const currentTotalHours = getTotalHours(currentMonthSchedules)
    const prevTotalHours = getTotalHours(prevMonthSchedules)
    const diff = currentTotalHours - prevTotalHours

    return NextResponse.json({
      currentMonthHours: Math.round(currentTotalHours),
      previousMonthHours: Math.round(prevTotalHours),
      difference: Math.round(diff),
    })
  } catch (error) {
    console.error("Ошибка получения статистики по часам:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
