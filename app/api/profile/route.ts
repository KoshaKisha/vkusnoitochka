import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Нет токена" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }

    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ошибка при получении профиля" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Нет токена" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    const { id } = decoded as { id: number }

    const body = await req.json()
    const { firstName, lastName, email, oldPassword, newPassword } = body

    const user = await prisma.employee.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ message: "Пользователь не найден" }, { status: 404 })
    }

    // Если пользователь хочет изменить пароль — проверяем старый
    if (oldPassword && newPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ message: "Неверный текущий пароль" }, { status: 400 })
      }

      const hashedNew = await bcrypt.hash(newPassword, 10)
      await prisma.employee.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          password: hashedNew,
        },
      })
    } else {
      await prisma.employee.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
        },
      })
    }

    const updated = await prisma.employee.findUnique({ where: { id } })
    return NextResponse.json({
      id: updated?.id,
      firstName: updated?.firstName,
      lastName: updated?.lastName,
      email: updated?.email,
    })
  } catch (error) {
    console.error("Ошибка обновления профиля:", error)
    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

