"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
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
  Search,
  Filter,
  Download,
  LogOut,
  Clock,
  Trash2,
  Edit
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Crown } from "lucide-react"

export default function HRDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("Активен")
  const [reports, setReports] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [newThisMonth, setNewThisMonth] = useState(0)
  const [hourStats, setHourStats] = useState<{ currentMonthHours: number; difference: number } | null>(null)
  // Shifts management state
  const [selectedEmployeeForShifts, setSelectedEmployeeForShifts] = useState<any | null>(null)
  const [shifts, setShifts] = useState<any[]>([])
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<any | null>(null)
  const [isDeleteShiftDialogOpen, setIsDeleteShiftDialogOpen] = useState(false)
  const [deletingShift, setDeletingShift] = useState<any | null>(null)
  const router = useRouter()
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
  const fetchShifts = async (employeeId: number) => {
    try {
      const res = await fetch(`/api/hr/shifts/by-employee/${employeeId}`)
      if (!res.ok) throw new Error("Ошибка получения смен")
      const data = await res.json()
      setShifts(data)
    } catch (error) {
      console.error(error)
      setShifts([])
    }
  }
  useEffect(() => {
  const fetchAll = async () => {
    const token = localStorage.getItem("token")
    if (token) setToken(token)
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
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    try {
      const [profileRes, employeesRes, reportsRes, statsRes, requestsRes] = await Promise.all([
        fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/hr/employees"),
        fetch(token ? `/api/hr/reports/user/${JSON.parse(atob(token.split('.')[1])).id}` : ""),
        fetch("/api/hr/stats"),
        fetch("/api/hr/requests"),
      ])

      // Профиль
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      } else {
        console.error("Ошибка загрузки профиля")
      }

      // Сотрудники
      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)

        const newThisMonth = employeesData.filter((emp: any) =>
          new Date(emp.createdAt) >= startOfMonth
        ).length

        setTotalEmployees(employeesData.length)
        setNewThisMonth(newThisMonth)
      } else {
        console.error("Ошибка получения сотрудников")
      }

      // Отчёты
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
      }

      // Статистика
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setHourStats({
          currentMonthHours: statsData.currentMonthHours,
          difference: statsData.difference,
        })
      }

      // Заявки
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData)
      } else {
        console.error("Ошибка получения заявок")
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    }
  }

  fetchAll()
}, [])
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
    sick: "отгул",
    other: "другое",
  }
  
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
  function getReportFileName(reportType: string, createdAt: string | Date): string {
    const date = new Date(createdAt)

    const monthNames = [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ]

    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
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

   // Get only employees with role "employee"
  const employeeRoleUsers = employees.filter((emp) => emp.role === "employee")

  // Handle shift editing
  const handleEditShift = async () => {
    if (!editingShift) return

    try {
      const res = await fetch(`/api/hr/shifts/${editingShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editingShift.date,
          startTime: editingShift.startTime,
          endTime: editingShift.endTime,
        }),
      })

      if (res.ok) {
        setIsEditShiftDialogOpen(false)
        if (selectedEmployeeForShifts) {
          fetchShifts(selectedEmployeeForShifts.id)
        }
      } else {
        console.error("Ошибка при обновлении смены")
      }
    } catch (error) {
      console.error("Ошибка при обновлении смены", error)
    }
  }

  // Handle shift deletion
  const handleDeleteShift = async () => {
    if (!deletingShift) return

    try {
      const res = await fetch(`/api/hr/shifts/${deletingShift.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteShiftDialogOpen(false)
        if (selectedEmployeeForShifts) {
          fetchShifts(selectedEmployeeForShifts.id)
        }
      } else {
        console.error("Ошибка при удалении смены")
      }
    } catch (error) {
      console.error("Ошибка при удалении смены", error)
    }
  }

  // Generate time options for select
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }
return (
  <div className="min-h-screen bg-gray-50">
    {/* Header - адаптивный */}
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-2 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">HR-панель</h1>
              <p className="text-xs text-gray-500">
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
            className="w-full sm:w-auto"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/"
            }}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Stats Cards - адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Всего сотрудников</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+{newThisMonth} за месяц</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ожидающие заявки</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Требуют рассмотрения</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Средние часы/месяц</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {hourStats ? `${hourStats.currentMonthHours}` : "Загрузка..."}
            </div>
            <p className="text-xs text-muted-foreground">
              {hourStats ? `${hourStats.difference >= 0 ? "+" : ""}${hourStats.difference} к прошлому месяцу` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="employees" className="space-y-4 sm:space-y-6">
        {/* Адаптивные табы */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="employees" className="text-xs sm:text-sm py-1 sm:py-2">Сотрудники</TabsTrigger>
          <TabsTrigger value="shifts" className="text-xs sm:text-sm py-1 sm:py-2">Смены</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs sm:text-sm py-1 sm:py-2">Заявки</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm py-1 sm:py-2">Отчеты</TabsTrigger>
        </TabsList>

        {/* Сотрудники - адаптивный контент */}
        <TabsContent value="employees" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Управление сотрудниками</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Список всех сотрудников и их информация</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <Input
                    placeholder="Поиск сотрудников..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 text-xs sm:text-sm h-8 sm:h-9"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="text-xs sm:text-sm h-8 sm:h-9">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Фильтры
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 space-y-4">
                    <div>
                      <Label className="block text-xs sm:text-sm mb-1">Фильтр по статусу</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs sm:text-sm">Все</SelectItem>
                          <SelectItem value="Активен" className="text-xs sm:text-sm">Активен</SelectItem>
                          <SelectItem value="В отпуске" className="text-xs sm:text-sm">В отпуске</SelectItem>
                          <SelectItem value="На больничном" className="text-xs sm:text-sm">На больничном</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
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
              
              <div className="space-y-3 sm:space-y-4">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${getRoleBackgroundColor(employee.role)} rounded-full flex items-center justify-center`}
                      >
                        {getRoleIcon(employee.role)}
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <p className="font-medium text-sm sm:text-lg">{employee.firstName} {employee.lastName}</p>
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
                    <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-normal">
                      <div className="text-right sm:text-left">
                        <p className="text-xs sm:text-sm font-medium">{employee.hoursMonth}ч</p>
                        <p className="text-2xs sm:text-xs text-muted-foreground">за месяц</p>
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
                        className="text-2xs sm:text-xs"
                      >
                        {employee.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 sm:h-8"
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
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground text-sm">Сотрудники не найдены</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Смены - адаптивный контент */}
        <TabsContent value="shifts" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Управление сменами</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Просмотр и редактирование смен сотрудников</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Выберите сотрудника</Label>
                  <Select
                    value={selectedEmployeeForShifts?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const employee = employeeRoleUsers.find((emp) => emp.id.toString() === value)
                      setSelectedEmployeeForShifts(employee || null)
                      if (employee) {
                        fetchShifts(employee.id)
                      } else {
                        setShifts([])
                      }
                    }}
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeRoleUsers.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()} className="text-xs sm:text-sm">
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEmployeeForShifts && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-lg font-medium">
                        Смены: {selectedEmployeeForShifts.firstName} {selectedEmployeeForShifts.lastName}
                      </h3>
                    </div>

                    {shifts.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {shifts.map((shift) => (
                          <div key={shift.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm sm:text-base">
                                  {new Date(shift.date).toLocaleDateString("ru-RU")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(shift.startTime).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(shift.endTime).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-normal">
                              <div className="text-right sm:text-left mr-0 sm:mr-4">
                                <p className="text-xs sm:text-sm font-medium">
                                  {(() => {
                                    const start = new Date(shift.startTime)
                                    const end = new Date(shift.endTime)
                                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                                    const h = Math.floor(hours)
                                    const m = Math.round((hours - h) * 60)
                                    return `${h}:${m.toString().padStart(2, "0")}`
                                  })()}
                                </p>
                                <p className="text-2xs sm:text-xs text-muted-foreground">часов</p>
                              </div>
                              <div className="flex space-x-1 sm:space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 sm:h-8 w-7 sm:w-auto p-0 sm:px-3"
                                  onClick={() => {
                                    setEditingShift({
                                      ...shift,
                                      date: shift.date.split("T")[0],
                                    })
                                    setIsEditShiftDialogOpen(true)
                                  }}
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Редактировать</span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 sm:h-8 w-7 sm:w-auto p-0 sm:px-3"
                                  onClick={() => {
                                    setDeletingShift(shift)
                                    setIsDeleteShiftDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Удалить</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-muted-foreground text-sm">У сотрудника нет запланированных смен</p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedEmployeeForShifts && (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-muted-foreground text-sm">Выберите сотрудника для просмотра смен</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Заявки - адаптивный контент */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Заявки на рассмотрение</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Заявки на отпуск, больничные и отгулы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {requests
                  .filter((r) => r.status === "pending")
                  .map((request) => (
                    <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{`${request.employee.lastName} ${request.employee.firstName[0]}.`}</p>
                          <p className="text-xs text-muted-foreground">
                            {requestTypeMap[request.type] || "Неизвестно"} • {new Date(request.startDate).toLocaleDateString("ru-RU")} -{" "}
                            {new Date(request.endDate).toLocaleDateString("ru-RU")}
                          </p>
                          <p className="text-2xs sm:text-xs text-muted-foreground">
                            Подана: {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-normal">
                        <div className="text-right sm:text-left mr-0 sm:mr-4">
                          <p className="text-xs sm:text-sm font-medium">
                            {
                              Math.ceil(
                                (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              ) + 1
                            }{" "}
                            дн.
                          </p>
                        </div>
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 sm:h-8 text-xs px-2 sm:px-3 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => openConfirmDialog(request.id, "rejected")}
                          >
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 sm:h-8 text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700"
                            onClick={() => openConfirmDialog(request.id, "approved")}
                          >
                            Одобрить
                          </Button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Отчеты - адаптивный контент */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Отчеты и аналитика</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Генерация и просмотр отчетов</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
                  <Button onClick={generateReport} className="text-xs sm:text-sm h-8 sm:h-9">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Быстрый отчет
                  </Button>

                  <Button variant="outline" asChild className="text-xs sm:text-sm h-8 sm:h-9">
                    <a href="/reports">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Все отчеты
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {reports.map((report, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                        <p className="text-2xs sm:text-xs text-muted-foreground">
                          Создан: {new Date(report.createdAt).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-normal">
                      <Badge variant="outline" className="text-2xs sm:text-xs">{report.type}</Badge>
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-xs px-2 sm:px-3">
                          <a
                            href={report.filePath}
                            download={getReportFileName(report.type, report.createdAt)}
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Скачать
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 sm:h-8 text-xs px-2 sm:px-3"
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

        {/* Edit Shift Dialog */}
      <Dialog open={isEditShiftDialogOpen} onOpenChange={setIsEditShiftDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать смену</DialogTitle>
            <DialogDescription>Измените дату или время смены</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="editDate">Дата</Label>
              <Input
                id="editDate"
                type="date"
                value={editingShift?.date || ""}
                onChange={(e) => setEditingShift({ ...editingShift, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="editStartTime">Время начала</Label>
                <Select
                  value={editingShift?.startTime || ""}
                  onValueChange={(value) => setEditingShift({ ...editingShift, startTime: value })}
                >
                  <SelectTrigger id="editStartTime">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={`edit-start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editEndTime">Время окончания</Label>
                <Select
                  value={editingShift?.endTime || ""}
                  onValueChange={(value) => setEditingShift({ ...editingShift, endTime: value })}
                >
                  <SelectTrigger id="editEndTime">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={`edit-end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditShiftDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditShift}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Dialog */}
      <Dialog open={isDeleteShiftDialogOpen} onOpenChange={setIsDeleteShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить смену</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить смену на{" "}
              {deletingShift && new Date(deletingShift.date).toLocaleDateString("ru-RU")}? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteShiftDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteShift}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}