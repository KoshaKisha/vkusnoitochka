import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, type, description, filePath, createdBy } = await req.json()

    const report = await prisma.report.create({
      data: {
        name,
        type,
        description,
        filePath,
        createdBy,
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Ошибка создания отчета:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}
