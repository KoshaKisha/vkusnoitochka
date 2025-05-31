"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  FileText,
  Calendar,
  MessageSquare,
  UserPlus,
  Search,
  Filter,
  Download,
  LogOut,
  Clock,
  TrendingUp,
} from "lucide-react"

export default function HRDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [requests, setRequests] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [newThisMonth, setNewThisMonth] = useState(0)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    requestId: number | null
    action: "approved" | "rejected" | null
  }>({
    isOpen: false,
    requestId: null,
    action: null,
  })
  const requestTypeMap: Record<string, string> = {
    vacation: "отпуск",
    sick: "больничный",
    other: "другое",
  }
  const [hourStats, setHourStats] = useState<{ currentMonthHours: number; difference: number } | null>(null)
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        console.error("Ошибка загрузки профиля")
      }
    }

    fetchProfile()
  }, [])
  useEffect(() => {
    const stored = localStorage.getItem("token")
    if (stored) setToken(stored)
  }, [])
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/hr/stats")
        if (res.ok) {
          const data = await res.json()
          setHourStats({ currentMonthHours: data.currentMonthHours, difference: data.difference })
        }
      } catch (error) {
        console.error("Ошибка загрузки статистики по часам", error)
      }
    }

    fetchStats()
  }, [])
  useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/hr/requests")
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      } else {
        console.error("Ошибка при получении заявок")
      }
    } catch (error) {
      console.error("Ошибка при получении заявок", error)
    }
  }

  fetchRequests()
  }, [])
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/hr/employees")
      if (!res.ok) throw new Error("Ошибка получения сотрудников")
      const data = await res.json()

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const newCount = data.filter((emp: any) => new Date(emp.createdAt) >= startOfMonth).length

      setTotalEmployees(data.length)
      setNewThisMonth(newCount)
    } catch (error) {
      console.error(error)
    }
  }

  fetchEmployees()
}, [])
  const pendingCount = requests.filter((req) => req.status === "pending").length
  const updateRequestStatus = async (id: number, status: "approved" | "rejected") => {
    const res = await fetch(`/api/hr/requests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      const updated = await res.json()
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      )
    }
  }
  const openConfirmDialog = (id: number, action: "approved" | "rejected") => {
    setConfirmDialog({ isOpen: true, requestId: id, action })
  } 
  const handleConfirm = async () => {
    if (!confirmDialog.requestId || !confirmDialog.action) return
    await updateRequestStatus(confirmDialog.requestId, confirmDialog.action)
    setConfirmDialog({ isOpen: false, requestId: null, action: null })
  }
  const employees = [
    { id: 1, name: "Иванов И.И.", position: "Разработчик", department: "IT", status: "Активен", hoursMonth: 168 },
    { id: 2, name: "Петрова А.С.", position: "Дизайнер", department: "Дизайн", status: "Активен", hoursMonth: 160 },
    {
      id: 3,
      name: "Сидоров П.П.",
      position: "Аналитик",
      department: "Аналитика",
      status: "В отпуске",
      hoursMonth: 120,
    },
    { id: 4, name: "Козлова М.В.", position: "Менеджер", department: "Продажи", status: "Активен", hoursMonth: 172 },
  ]

  const reports = [
    { name: "Отчет по рабочему времени", description: "Январь 2024", date: "31.01.2024", type: "Время" },
    { name: "Отчет по отпускам", description: "Квартальный отчет", date: "31.12.2023", type: "Отпуска" },
    { name: "Аналитика эффективности", description: "Месячная аналитика", date: "31.01.2024", type: "Аналитика" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HR-панель</h1>
                 <p className="text-sm text-gray-500">
                  Добро пожаловать,{" "}
                  {profile
                    ? `${profile.lastName} ${profile.firstName.charAt(0)}.`
                    : "пользователь"}
              </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("token")
                window.location.href = "/"
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">+{newThisMonth} за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ожидающие заявки</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Требуют рассмотрения</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средние часы/месяц</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hourStats ? `${hourStats.currentMonthHours}` : "Загрузка..."}
              </div>
              <p className="text-xs text-muted-foreground">
                {hourStats ? `${hourStats.difference >= 0 ? "+" : ""}${hourStats.difference} к прошлому месяцу` : ""}
              </p>
          </CardContent>
        </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Эффективность</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+2% к прошлому месяцу</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Управление сотрудниками</CardTitle>
                    <CardDescription>Список всех сотрудников и их информация</CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Добавить сотрудника
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск сотрудников..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                  </Button>
                </div>

                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.position} • {employee.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{employee.hoursMonth}ч</p>
                          <p className="text-xs text-muted-foreground">за месяц</p>
                        </div>
                        <Badge variant={employee.status === "Активен" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Заявки на рассмотрение</CardTitle>
                <CardDescription>Заявки на отпуск, больничные и отгулы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests
                    .filter((r) => r.status === "pending")
                    .map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">{`${request.employee.lastName} ${request.employee.firstName[0]}.`}</p>
                            <p className="text-sm text-muted-foreground">
                              {requestTypeMap[request.type] || "Неизвестно"} • {new Date(request.startDate).toLocaleDateString("ru-RU")} -{" "}
                              {new Date(request.endDate).toLocaleDateString("ru-RU")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Подана: {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium">
                              {
                                Math.ceil(
                                  (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                ) + 1
                              }{" "}
                              дн.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => openConfirmDialog(request.id, "rejected")}
                          >
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openConfirmDialog(request.id, "approved")}
                          >
                            Одобрить
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Отчеты и аналитика</CardTitle>
                    <CardDescription>Генерация и просмотр отчетов</CardDescription>
                  </div>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Создать отчет
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <p className="text-xs text-muted-foreground">Создан: {report.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approved" ? "Подтвердить одобрение" : "Подтвердить отклонение"}
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите{" "}
              {confirmDialog.action === "approved" ? "одобрить" : "отклонить"} эту заявку?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, requestId: null, action: null })}>
              Отмена
            </Button>
            <Button
              className={confirmDialog.action === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={handleConfirm}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
