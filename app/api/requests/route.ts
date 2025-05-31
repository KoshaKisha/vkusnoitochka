import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getEmployeeIdFromToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    const employeeId = getEmployeeIdFromToken(token)
    if (!employeeId) return NextResponse.json({ message: "Нет доступа" }, { status: 401 })

    const { type, comment, startDate, endDate } = await req.json()

    const request = await prisma.request.create({
      data: {
        type,
        comment,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employeeId,
      },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Ошибка при создании заявки" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    const employeeId = getEmployeeIdFromToken(token)
    if (!employeeId) return NextResponse.json({ message: "Нет доступа" }, { status: 401 })

    const requests = await prisma.request.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ message: "Ошибка при получении заявок" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = Number(url.searchParams.get("id"))
    if (!id) {
      return NextResponse.json({ error: "ID заявки обязателен" }, { status: 400 })
    }

    // Тут можно добавить проверку, что заявка принадлежит текущему пользователю

    await prisma.request.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при удалении заявки:", error)
    return NextResponse.json({ error: "Ошибка при удалении заявки" }, { status: 500 })
  }
}

