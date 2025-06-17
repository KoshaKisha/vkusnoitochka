import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const employees = await prisma.employee.findMany()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Ошибка при получении сотрудников:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
