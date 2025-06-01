"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setRole(payload.role)
      } catch (error) {
        console.error("Ошибка при чтении токена", error)
      }
    }
  }, [])

  const handleRedirect = () => {
    if (role) {
      router.push(`/dashboard/${role}`)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen text-center px-4">
      <div>
        <h1 className="text-3xl font-bold mb-4">Доступ запрещён</h1>
        <p className="text-gray-600 mb-6">У вас нет прав доступа к этой странице.</p>
        <Button onClick={handleRedirect}>
          Вернуться на дашборд
        </Button>
      </div>
    </div>
  )
}
