import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  try {
    const employees = await prisma.employee.findMany({
      include: {
        schedules: {
          where: {
            date: {
              gte: startOfMonth,
            },
          },
        },
        requests: {
          where: {
            status: "approved",
            type: { in: ["vacation", "sick"] },
          },
        },
      },
    })

    const today = new Date()

    const result = employees.map((employee) => {
      // По умолчанию используем статус из базы
      let status = employee.status

      // Только если не "Уволен", смотрим активные заявки
      if (status !== "Уволен") {
        const activeRequest = employee.requests.find((req) => {
          const start = new Date(req.startDate)
          const end = new Date(req.endDate)
          return start <= today && today <= end
        })

        if (activeRequest) {
          status = activeRequest.type === "vacation" ? "В отпуске" : "На больничном"
        } else {
          status = "Активен" // нет заявок — статус активен
        }
      }

      // Часы за месяц
      const hoursMonth = employee.schedules.reduce((sum, schedule) => {
        const start = new Date(schedule.startTime)
        const end = new Date(schedule.endTime)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + diff
      }, 0)

      return {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt,
        status,
        hoursMonth: Math.round(hoursMonth),
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Ошибка при получении сотрудников:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, role, password } = body

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ message: "Все поля обязательны" }, { status: 400 })
    }

    const existing = await prisma.employee.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      },
    })

    return NextResponse.json({ message: "Сотрудник создан", employee: newEmployee }, { status: 201 })
  } catch (error) {
    console.error("Ошибка создания сотрудника:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}
