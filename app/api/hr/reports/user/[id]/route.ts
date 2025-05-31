import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
  context: { params: { id: string } }
) {
  // Await params before accessing properties
  const params = await context.params
  const userId = parseInt(params.id, 10)

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 })
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Ошибка при получении отчетов:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}
