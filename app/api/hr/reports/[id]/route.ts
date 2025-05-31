import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    const params = await context.params
    const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 })
  }

  try {
    await prisma.report.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при удалении отчёта:", error)
    return NextResponse.json({ error: "Ошибка при удалении отчёта" }, { status: 500 })
  }
}