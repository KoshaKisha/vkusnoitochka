"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, ArrowLeft } from "lucide-react"

export default function ReportsPage() {
  type Report = {
  id: number
  name: string
  type: string
  description?: string
  filePath: string
  createdAt: string
}
  const [reportType, setReportType] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [generatedReports, setGeneratedReports] = useState<Report[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const router = useRouter()
  useEffect(() => {
  const init = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/")
      return
    }

    // Проверка роли из токена
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.role !== "hr") {
        router.replace("/unauthorized")
        return
      }
    } catch (err) {
      console.error("Ошибка при декодировании токена", err)
      router.replace("/")
      return
    }

    // Загрузка профиля и отчетов
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        console.log("Пользователь не аутентифицирован")
        return
      }

      const { id } = await res.json()
      setUserId(id)

      const reportsRes = await fetch(`/api/hr/reports/user/${id}`)
      const reports = await reportsRes.json()
      setGeneratedReports(reports)
    } catch (error) {
      console.error("Ошибка при загрузке отчетов:", error)
    }
  }

  init()
}, [])


 const handleGenerateReport = async () => {
  if (!dateFrom || !dateTo || !userId) return

  const res = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: reportType,
      dateFrom,
      dateTo,
    }),
  })

  if (res.ok) {
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    // 🔽 Получаем имя файла из заголовка Content-Disposition
    const contentDisposition = res.headers.get("Content-Disposition")
    let fileName = "report.csv"
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match?.[1]) {
        fileName = match[1]
      }
    }

    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()

    URL.revokeObjectURL(url)

    // Обновить список отчетов, если нужно
    const reportsRes = await fetch(`/api/hr/reports/user/${userId}`)
    const updatedReports = await reportsRes.json()
    setGeneratedReports(updatedReports)
  } else {
    alert("Не удалось сгенерировать отчет")
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
           <Button
                variant="ghost"
                size="sm"
                className="mr-4"
                onClick={() => router.push("/dashboard/hr")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Отчеты и аналитика</h1>
                <p className="text-sm text-gray-500">Генерация и управление отчетами</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Generation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Создать отчет</CardTitle>
                <CardDescription>Настройте параметры для генерации нового отчета</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportType">Тип отчета</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип отчета" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Рабочее время</SelectItem>
                        <SelectItem value="overtime">Переработки</SelectItem>
                        <SelectItem value="vacation">Отпуска</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="dateFrom">С даты</Label>
                      <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="dateTo">По дату</Label>
                      <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                  </div>
                  <div>
                  </div>

                  <Button onClick={handleGenerateReport} className="w-full" disabled={!reportType}>
                    <FileText className="w-4 h-4 mr-2" />
                    Сгенерировать отчет
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Reports */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Сгенерированные отчеты</CardTitle>
                    <CardDescription>История созданных отчетов и возможность их скачивания</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedReports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <div>Создан: {new Date(report.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex space-x-2">
                          <a href={`/api/hr/reports/${report.id}/download`}>
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Скачать
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
