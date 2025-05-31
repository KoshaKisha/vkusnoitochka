import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Ошибка при получении сотрудников:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
