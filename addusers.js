const { PrismaClient } = require("../vkusnoitochka/lib/generated/prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@company.ru",
    password: "admin123",
    role: "admin",
  },
  {
    firstName: "HR",
    lastName: "Manager", 
    email: "hr@company.ru",
    password: "hr123",
    role: "hr",
  },
  {
    firstName: "Employee",
    lastName: "Worker",
    email: "employee@company.ru",
    password: "employee123",
    role: "employee",
  },
]

async function main() {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    await prisma.employee.upsert({
      where: { email: user.email },
      update: {}, // если пользователь уже есть, не обновляем
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    })
  }

  console.log("Пользователи успешно добавлены")
}

main()
  .catch((e) => {
    console.error("Ошибка при добавлении пользователей:", e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
