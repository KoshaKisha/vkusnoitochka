"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Shield, Crown } from "lucide-react"

export default function HRDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false)
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee" as "employee" | "hr" | "admin",
    password: "",
    confirmPassword: "",
  })
  const [employeeError, setEmployeeError] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("Активен")
  const [reportType, setReportType] = useState<string>("")
  const [reports, setReports] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [newThisMonth, setNewThisMonth] = useState(0)
  const fetchEmployees = async () => {
  try {
    const res = await fetch("/api/hr/employees")
    if (!res.ok) throw new Error("Ошибка получения сотрудников")
    const data = await res.json()
    setEmployees(data)
  } catch (error) {
    console.error(error)
  }
}
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
    const getRoleIcon = (userRole: "employee" | "hr" | "admin") => {
    switch (userRole) {
      case "employee":
        return <User className="w-5 h-5 text-green-600" />
      case "hr":
        return <Users className="w-5 h-5 text-purple-600" />
      case "admin":
        return <Crown className="w-5 h-5 text-orange-600" />
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }
  const generateReport = async () => {
  if (!profile) return

  try {
    const now = new Date()
    const month = now.toLocaleString("ru-RU", { month: "long" })
    const year = now.getFullYear()
    const filename = `отчет_по_рабочим_часам_за_${month}_${year}.csv`

    const csvRows = [
      ["Имя", "Фамилия", "Часы за месяц"],
      ...employees.map((emp) => [emp.firstName, emp.lastName, emp.hoursMonth])
    ]

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const res = await fetch("/api/hr/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Отчет по рабочим часам",
        type: "Время",
        description: `За ${month} ${year}`,
        filePath: url,
        createdBy: profile.id,
      }),
    })

    if (res.ok) {
      const newReport = await res.json()
      setReports((prev) => [newReport, ...prev])
      setOpenGenerateDialog(false)
    } else {
      console.error("Ошибка при сохранении отчета")
    }
  } catch (error) {
    console.error("Ошибка генерации отчета", error)
  }
}
    // Get role background color
  const getRoleBackgroundColor = (userRole: "employee" | "hr" | "admin") => {
    switch (userRole) {
      case "employee":
        return "bg-green-100"
      case "hr":
        return "bg-purple-100"
      case "admin":
        return "bg-orange-100"
      default:
        return "bg-gray-100"
    }
  }
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
    const fetchReports = async () => {
      if (!profile) return
      try {
        const res = await fetch(`/api/hr/reports/user/${profile.id}`)
        if (res.ok) {
          const data = await res.json()
          setReports(data)
        }
      } catch (error) {
        console.error("Ошибка загрузки отчетов", error)
      }
    }

    fetchReports()
  }, [profile])
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
      setEmployees(data)

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
  const validateEmployee = () => {
    if (!newEmployee.firstName.trim()) {
      setEmployeeError("Введите имя")
      return false
    }
    if (!newEmployee.lastName.trim()) {
      setEmployeeError("Введите фамилию")
      return false
    }
    if (!newEmployee.email.trim()) {
      setEmployeeError("Введите email")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      setEmployeeError("Введите корректный email")
      return false
    }
    if (!newEmployee.password) {
      setEmployeeError("Введите пароль")
      return false
    }
    if (newEmployee.password.length < 6) {
      setEmployeeError("Пароль должен содержать минимум 6 символов")
      return false
    }
    if (newEmployee.password !== newEmployee.confirmPassword) {
      setEmployeeError("Пароли не совпадают")
      return false
    }
    return true
  }

  const handleCreateEmployee = async () => {
    if (!validateEmployee()) return

    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          email: newEmployee.email,
          role: newEmployee.role,
          password: newEmployee.password,
        }),
      })

      if (res.ok) {
        setIsAddEmployeeDialogOpen(false)
        setNewEmployee({
          firstName: "",
          lastName: "",
          email: "",
          role: "employee",
          password: "",
          confirmPassword: "",
        })
        setEmployeeError("")
      } else {
        const error = await res.json()
        setEmployeeError(error.message || "Ошибка при создании сотрудника")
      }
    } catch (error) {
      setEmployeeError("Ошибка при создании сотрудника")
    }
  }
  function getReportFileName(reportType: string, createdAt: string | Date): string {
    const date = new Date(createdAt)

    const monthNames = [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ]

    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    // Преобразуем тип отчета в человеко-понятный текст
    const typeMap: Record<string, string> = {
      working_hours: "по_рабочим_часам",
      vacation: "по_отпускам",
      sick: "по_больничным",
      analytics: "аналитика",
    }

    const typeText = typeMap[reportType] || reportType

    return `отчет_${typeText}_${month}_${year}.csv`
  }
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
    // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "all" || employee.role === selectedRole
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/hr/employees")
        if (!res.ok) throw new Error("Ошибка получения сотрудников")
        const data = await res.json()
        setEmployees(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchEmployees()
  }, [])
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <Button
                    onClick={() => {
                      setIsAddEmployeeDialogOpen(true)
                      setNewEmployee({
                        firstName: "",
                        lastName: "",
                        email: "",
                        role: "employee",
                        password: "",
                        confirmPassword: "",
                      })
                      setEmployeeError("")
                    }}
                  >
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
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Фильтры
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 space-y-4">
                      <div>
                        <Label className="block text-sm mb-1">Фильтр по роли</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="employee">Сотрудник</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="admin">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="block text-sm mb-1">Фильтр по статусу</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="Активен">Активен</SelectItem>
                            <SelectItem value="В отпуске">В отпуске</SelectItem>
                            <SelectItem value="На больничном">На больничном</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole("all")
                            setSelectedStatus("all")
                          }}
                        >
                          Сбросить
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
           <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 ${getRoleBackgroundColor(employee.role)} rounded-full flex items-center justify-center`}
                        >
                          {getRoleIcon(employee.role)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-lg">{employee.firstName} {employee.lastName}</p>
                            <Badge variant="outline" className="text-xs">
                              {employee.role === "employee"
                                ? "Сотрудник"
                                : employee.role === "hr"
                                  ? "HR"
                                  : "Админ"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{employee.hoursMonth}ч</p>
                          <p className="text-xs text-muted-foreground">за месяц</p>
                        </div>
                        <Badge
                          variant={
                            employee.status === "Активен"
                              ? "default"
                              : employee.status === "В отпуске"
                                ? "secondary"
                                : employee.status === "На больничном"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {employee.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setNewStatus(employee.status)
                            setIsStatusDialogOpen(true)
                          }}
                        >
                          Изменить статус
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Сотрудники не найдены</p>
                  </div>
                )}
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
                  <Button onClick={() => setOpenGenerateDialog(true)}>
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
                          <p className="text-xs text-muted-foreground">
                            Создан: {new Date(report.createdAt).toLocaleDateString("ru-RU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{report.type}</Badge>
                       <Button asChild variant="outline" size="sm">
                        <a
                          href={report.filePath}
                          download={getReportFileName(report.type, report.createdAt)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                            const res = await fetch(`/api/hr/reports/${report.id}`, { method: "DELETE" })

                            if (res.ok) {
                              setReports((prev) => prev.filter((r) => r.id !== report.id))
                            } else {
                              console.error("Ошибка при удалении отчёта")
                            }
                        }}
                      >
                        Удалить
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

       {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить нового сотрудника</DialogTitle>
            <DialogDescription>Заполните информацию о новом сотруднике</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={newEmployee.firstName}
                  onChange={(e) => {
                    setNewEmployee({ ...newEmployee, firstName: e.target.value })
                    setEmployeeError("")
                  }}
                  placeholder="Введите имя"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={newEmployee.lastName}
                  onChange={(e) => {
                    setNewEmployee({ ...newEmployee, lastName: e.target.value })
                    setEmployeeError("")
                  }}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => {
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                  setEmployeeError("")
                }}
                placeholder="Введите email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Роль в системе</Label>
              <Select
                value={newEmployee.role}
                onValueChange={(value: "employee" | "hr" | "admin") => {
                  setNewEmployee({ ...newEmployee, role: value })
                  setEmployeeError("")
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span>Сотрудник</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hr">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>HR-менеджер</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-orange-600" />
                      <span>Администратор</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => {
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                    setEmployeeError("")
                  }}
                  placeholder="Введите пароль"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newEmployee.confirmPassword}
                  onChange={(e) => {
                    setNewEmployee({ ...newEmployee, confirmPassword: e.target.value })
                    setEmployeeError("")
                  }}
                  placeholder="Повторите пароль"
                />
              </div>
            </div>

            {employeeError && <p className="text-sm text-red-600">{employeeError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateEmployee}>Создать сотрудника</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Изменить статус сотрудника</DialogTitle>
              <DialogDescription>
                Выберите новый статус для {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Статус</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Активен">Активен</SelectItem>
                  <SelectItem value="В отпуске">В отпуске</SelectItem>
                  <SelectItem value="На больничном">На больничном</SelectItem>
                  <SelectItem value="Уволен">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedEmployee) return

                  const res = await fetch(`/api/hr/employees/${selectedEmployee.id}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ manualStatus: newStatus }),
                  })

                  if (res.ok) {
                    const updated = await res.json()
                    setEmployees((prev) =>
                      prev.map((emp) => (emp.id === updated.id ? { ...emp, status: updated.status } : emp))
                    )
                    await fetchEmployees() 
                    setIsStatusDialogOpen(false)
                  } else {
                    console.error("Ошибка при обновлении статуса")
                  }
                }}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openGenerateDialog} onOpenChange={setOpenGenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создание отчета</DialogTitle>
              <DialogDescription>Выберите тип отчета</DialogDescription>
            </DialogHeader>
            <Select onValueChange={(value) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип отчета" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working_hours">По рабочим часам</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={generateReport}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
