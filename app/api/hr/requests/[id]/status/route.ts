import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const id = Number(params.id)

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Неверный статус" }, { status: 400 })
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления статуса" }, { status: 500 })
  }
}
