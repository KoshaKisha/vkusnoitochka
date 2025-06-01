import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ message: "Некорректный ID сотрудника" }, { status: 400 })
  }

  const body = await req.json()
  const { firstName, lastName, email, role, password } = body

  if (!firstName || !lastName || !email || !role) {
    return NextResponse.json({ message: "Заполните все обязательные поля" }, { status: 400 })
  }

  try {
    const updateData: any = {
      firstName,
      lastName,
      email,
      role,
    }

    // Если передан новый пароль — хешируем и сохраняем
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Ошибка при обновлении сотрудника:", error)
    return NextResponse.json({ message: "Ошибка при обновлении сотрудника" }, { status: 500 })
  }
}
