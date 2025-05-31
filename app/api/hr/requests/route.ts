import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.request.findMany({
      include: {
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении заявок" }, { status: 500 })
  }
}
