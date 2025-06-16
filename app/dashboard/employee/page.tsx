"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, LogOut, Timer, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Popover } from "@radix-ui/react-popover"
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover"


type ScheduleFromAPI = {
  id: number
  date: string
  startTime: string
  endTime: string
  employeeId: number
}

export default function EmployeeDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [token, setToken] = useState<string | null>(null)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [shiftError, setShiftError] = useState("")
  const router = useRouter()
  const [requestForm, setRequestForm] = useState({
    type: "vacation" as "vacation" | "sick" | "other",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    comment: "",
  })
  const requestTypeMap: Record<string, string> = {
    vacation: "отпуск",
    sick: "отгул",
    other: "другое",
  }
  const [requestError, setRequestError] = useState("")
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [shifts, setShifts] = useState<{
    [date: string]: { startTime: string; endTime: string; hours: number }}>({})
  const [newShift, setNewShift] = useState({
    date: new Date(),
    startTime: "09:00",
    endTime: "18:00",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // Calculate total hours for the current month
  const calculateTotalHours = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const totalHours = Object.entries(shifts).reduce((sum, [dateStr, shift]) => {
      const date = new Date(dateStr)
      const isSameMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear
      return isSameMonth ? sum + shift.hours : sum
    }, 0)

    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }
  const [requests, setRequests] = useState<any[]>([])
  const fetchRequests = async () => {
    if (!token) return
    const res = await fetch("/api/requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setRequests(data)
    }
  }
  useEffect(() => {
    fetchRequests()
  }, [token])

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
      router.replace("/")
      return
    }

    // Проверка роли из токена
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.role !== "employee") {
        router.replace("/unauthorized")
        return
      }
    } catch (err) {
      console.error("Ошибка при декодировании токена", err)
      router.replace("/")
      return
    }

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
    const token = localStorage.getItem("token")
    if (!token) return
    const fetchShifts = async () => {
      const res = await fetch("/api/schedules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
      console.error("Ошибка загрузки смен")
      return
    }

    const data: ScheduleFromAPI[] = await res.json()

    const parsedShifts: {
      [date: string]: { startTime: string; endTime: string; hours: number }
    } = data.reduce((acc, shift) => {
      const dateStr = formatDate(new Date(shift.date))

      const start = new Date(shift.startTime)
      const end = new Date(shift.endTime)
      const hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60

      acc[dateStr] = {
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        hours,
      }

      return acc
    }, {} as {
      [date: string]: { startTime: string; endTime: string; hours: number }
    })

    setShifts(parsedShifts)
  }

  fetchShifts()
}, [])


  // Calculate total hours for today
  const calculateTodayHours = () => {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const todayShift = shifts[todayStr]

  if (!todayShift) return "00:00"

  const hours = Math.floor(todayShift.hours)
  const minutes = Math.round((todayShift.hours - hours) * 60)
  return `${hours}:${minutes.toString().padStart(2, "0")}`
}


  // Format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}


  // Handle adding a new shift
  const handleAddShift = async () => {
  if (!newShift.date) return

  const formattedDate = formatDate(newShift.date)

  // Проверка: смена на этот день уже существует
  if (shifts[formattedDate]) {
    setShiftError("Смена на этот день уже существует")
    return
  }

  // Вычисление продолжительности смены
  const [startHour, startMinute] = newShift.startTime.split(":").map(Number)
  const [endHour, endMinute] = newShift.endTime.split(":").map(Number)
  const hours = endHour - startHour + (endMinute - startMinute) / 60

  // Проверка: смена не должна превышать 9 часов
  if (hours > 9) {
    setShiftError("Смена не может быть длиннее 9 часов")
    return
  }

  const res = await fetch("/api/schedules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: formattedDate,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
    }),
  })

  if (res.ok) {
    setShifts({
      ...shifts,
      [formattedDate]: {
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        hours,
      },
    })
    setIsDialogOpen(false)
    setShiftError("")
  } else {
    setShiftError("Ошибка при добавлении смены")
  }
}

  // Get minimum date based on request type
  const getMinDate = () => {
    const today = new Date()
    if (requestForm.type === "vacation") {
      const minDate = new Date(today)
      minDate.setDate(today.getDate() + 3)
      return minDate
    }
    return today
  }

  // Validate request form
  const validateRequest = () => {
    if (!requestForm.startDate) {
      setRequestError("Выберите дату начала")
      return false
    }
    if (!requestForm.endDate) {
      setRequestError("Выберите дату окончания")
      return false
    }
    if (requestForm.endDate < requestForm.startDate) {
      setRequestError("Дата окончания не может быть раньше даты начала")
      return false
    }
    const durationInMs = requestForm.endDate.getTime() - requestForm.startDate.getTime()
    const days = Math.ceil(durationInMs / (1000 * 60 * 60 * 24)) + 1 // +1, чтобы включать обе даты
    if (requestForm.type === "vacation" && days > 28) {
      setRequestError("Продолжительность отпуска не может превышать 28 дней")
      return false
    }
    if (requestForm.type === "sick" && days > 14) {
      setRequestError("Продолжительность отгула не может превышать 14 дней")
      return false
    }
    if (requestForm.type === "other" && !requestForm.comment.trim()) {
      setRequestError("Укажите комментарий для заявки")
      return false
    }
    return true
  }

  // Handle request submission
  const handleSubmitRequest = async () => {
    if (!validateRequest()) return

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: requestForm.type,
          startDate: requestForm.startDate?.toISOString(),
          endDate: requestForm.endDate?.toISOString(),
          comment: requestForm.comment,
        }),
      })

      if (res.ok) {
        setIsRequestDialogOpen(false)
        setRequestError("")
        fetchRequests()
      } else {
        const error = await res.json()
        setRequestError(error.message || "Ошибка при создании заявки")
      }
    } catch (error) {
      setRequestError("Ошибка при создании заявки")
    }
  }


  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewShift({
        ...newShift,
        date: date,
      })
      setShiftError("")
      setIsDialogOpen(true)
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

  // Check if a date has a shift
  const hasShift = (date: Date) => {
    return shifts[formatDate(date)] !== undefined
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Личный кабинет</h1>
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
        {/* Time Tracking Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="w-5 h-5" />
              <span>Учет рабочего времени</span>
            </CardTitle>
            <CardDescription>Сводка отработанных часов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{calculateTodayHours()}</div>
                <p className="text-sm text-muted-foreground">Сегодня отработано</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{calculateTotalHours()}</div>
                <p className="text-sm text-muted-foreground">За месяц</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="timesheet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timesheet">Табель</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
          </TabsList>

          <TabsContent value="timesheet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Календарь смен</CardTitle>
                <CardDescription>Нажмите на дату, чтобы добавить или изменить смену</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date <= today
                      }}
                      modifiers={{
                        hasShift: (date) => hasShift(date),
                      }}
                      modifiersClassNames={{
                        hasShift: "bg-green-100 font-bold text-green-800",
                      }}
                    />
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="font-medium mb-4">Запланированные смены</h3>
                    <div className="space-y-4">
                      {Object.entries(shifts)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // сортировка по дате по убыванию
                        .slice(0, 10) // только 10 последних смен
                        .map(([date, shift]) => {
                          const now = new Date()
                          const shiftDate = new Date(date)
                          const [startHour, startMinute] = shift.startTime.split(":").map(Number)
                          const [endHour, endMinute] = shift.endTime.split(":").map(Number)

                          const shiftStart = new Date(shiftDate)
                          shiftStart.setHours(startHour, startMinute, 0, 0)

                          const shiftEnd = new Date(shiftDate)
                          shiftEnd.setHours(endHour, endMinute, 0, 0)

                          let statusLabel = "Запланировано"
                          let badgeClass = "bg-yellow-100 text-yellow-800"

                          if (now > shiftEnd) {
                            statusLabel = "Прошла"
                            badgeClass = "bg-red-100 text-red-800"
                          } else if (now >= shiftStart && now <= shiftEnd) {
                            statusLabel = "Текущая"
                            badgeClass = "bg-green-100 text-green-800"
                          }

                          return (
                            <div key={date} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="font-medium">{date}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {shiftDate.toLocaleDateString("ru-RU", { weekday: "short" })}
                                  </div>
                                </div>
                                <div className="text-sm">
                                  <div><strong>Начало:</strong> {shift.startTime}</div>
                                  <div><strong>Окончание:</strong> {shift.endTime}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-lg">
                                  {Math.floor(shift.hours)}:{Math.round((shift.hours % 1) * 60).toString().padStart(2, "0")}
                                </div>
                                <Badge className={badgeClass}>{statusLabel}</Badge>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Мой профиль</CardTitle>
                  <CardDescription>Личная информация и настройки</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">ФИО</label>
                        <p className="text-sm">{profile ? `${profile.lastName} ${profile.firstName}` : "..."}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{profile?.email ?? "..."}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Внутренний номер</label>
                        <p className="text-sm">{profile?.id ?? "..."}</p>
                      </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => {
                          if (profile) {
                            setEditForm({
                              firstName: profile.firstName,
                              lastName: profile.lastName,
                              email: profile.email,
                              // oldPassword: "",
                              // newPassword: "",
                              // confirmPassword: "",
                            })
                            setIsEditingProfile(true)
                            setPasswordError("")
                          }
                        }}
                      >
                        Редактировать профиль
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="firstName">Имя</Label>
                            <Input
                              id="firstName"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              placeholder="Введите имя"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="lastName">Фамилия</Label>
                            <Input
                              id="lastName"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              placeholder="Введите фамилию"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="Введите email"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setIsEditingProfile(false)
                            setPasswordError("")
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={async () => {
                            try {
                              const updateData: any = {
                                firstName: editForm.firstName,
                                lastName: editForm.lastName,
                                email: editForm.email,
                              }
                              const res = await fetch("/api/profile", {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(updateData),
                              })

                              if (res.ok) {
                                const updatedProfile = await res.json()
                                setProfile(updatedProfile)
                                setIsEditingProfile(false)
                                setPasswordError("")
                                // Show success message or notification here if needed
                              } else {
                                const error = await res.json()
                                setPasswordError(error.message || "Ошибка при обновлении профиля")
                              }
                            } catch (error) {
                              setPasswordError("Ошибка при обновлении профиля")
                            }
                          }}
                        >
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Мои заявки</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Заявки на отпуск, больничные и другие запросы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <Button
                    className="w-full md:w-auto text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => {
                      setIsRequestDialogOpen(true)
                      setRequestForm({
                        type: "vacation",
                        startDate: undefined,
                        endDate: undefined,
                        comment: "",
                      })
                      setRequestError("")
                    }}
                  >
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Подать заявку
                  </Button>

                  <div className="space-y-2 sm:space-y-3">
                    {requests.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground py-2 sm:py-3 text-center">Нет активных заявок</p>
                    ) : (
                      requests.map((request) => (
                        <div 
                          key={request.id} 
                          className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">
                              Заявка на {requestTypeMap[request.type] || "Неизвестно"}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(request.startDate).toLocaleDateString("ru-RU")} -{" "}
                              {new Date(request.endDate).toLocaleDateString("ru-RU")}
                            </p>
                            {request.comment && (
                              <p className="text-xs text-gray-500 mt-1">
                                Комментарий: {request.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-normal">
                            <Badge
                              className={`text-xs ${
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {request.status === "approved"
                                ? "Одобрено"
                                : request.status === "rejected"
                                ? "Отклонено"
                                : "На рассмотрении"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 sm:h-8 w-7 sm:w-8 p-0 sm:p-2"
                              onClick={() => {
                                setSelectedRequestId(request.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shift Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setShiftError("")
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить смену</DialogTitle>
            <DialogDescription>
              Укажите время начала и окончания смены на {newShift.date?.toLocaleDateString("ru-RU")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startTime">Время начала</Label>
                <Select
                  value={newShift.startTime}
                  onValueChange={(value) => setNewShift({ ...newShift, startTime: value })}
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endTime">Время окончания</Label>
                <Select
                  value={newShift.endTime}
                  onValueChange={(value) => setNewShift({ ...newShift, endTime: value })}
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {shiftError && <p className="text-sm text-red-600">{shiftError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddShift}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    {/* Request Dialog */}
      {/* Request Dialog - Compact Version */}
<Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
  <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader className="sticky top-0 bg-background z-10 pb-2">
      <DialogTitle className="text-lg">Подать заявку</DialogTitle>
      <DialogDescription className="text-sm">Заполните форму для подачи заявки</DialogDescription>
    </DialogHeader>
    
    <div className="grid gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-sm">Тип заявки</Label>
        <Select
          value={requestForm.type}
          onValueChange={(value: "vacation" | "sick" | "other") => {
            setRequestForm({
              ...requestForm,
              type: value,
              startDate: undefined,
              endDate: undefined,
              comment: "",
            })
            setRequestError("")
          }}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Выберите тип"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">Отпуск</SelectItem>
            <SelectItem value="sick">Отгул</SelectItem>
            <SelectItem value="other">Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-sm">Дата начала</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {requestForm.startDate ? (
                  format(requestForm.startDate, "PPP", { locale: ru })
                ) : (
                  <span>Выберите дату</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={requestForm.startDate}
                onSelect={(date) => setRequestForm({...requestForm, startDate: date})}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm">Дата окончания</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 justify-start text-left font-normal"
                disabled={!requestForm.startDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {requestForm.endDate ? (
                  format(requestForm.endDate, "PPP", { locale: ru })
                ) : (
                  <span>Выберите дату</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={requestForm.endDate}
                onSelect={(date) => setRequestForm({...requestForm, endDate: date})}
                disabled={(date) => date < (requestForm.startDate || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {requestForm.type === "other" && (
        <div className="flex flex-col gap-1">
          <Label className="text-sm">Комментарий</Label>
          <textarea
            className="min-h-[80px] w-full rounded-md border p-2 text-sm"
            placeholder="Укажите причину..."
            value={requestForm.comment}
            onChange={(e) => setRequestForm({...requestForm, comment: e.target.value})}
            maxLength={300}
          />
          <div className="text-xs text-muted-foreground text-right">
            {requestForm.comment.length}/300
          </div>
        </div>
      )}

      {requestError && (
        <div className="text-sm text-red-600">{requestError}</div>
      )}
    </div>

    <DialogFooter className="sticky bottom-0 bg-background pt-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="h-8 flex-1"
          onClick={() => setIsRequestDialogOpen(false)}
        >
          Отмена
        </Button>
        <Button
          className="h-8 flex-1"
          onClick={handleSubmitRequest}
        >
          Подать
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Delete Dialog */}
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent className="max-w-[95vw] sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-xl">Удалить заявку?</DialogTitle>
      <DialogDescription className="text-xs sm:text-sm">
        Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <Button 
        variant="outline" 
        onClick={() => setIsDeleteDialogOpen(false)}
        className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
      >
        Отмена
      </Button>
      <Button
        variant="destructive"
        onClick={async () => {
          if (!selectedRequestId) return

          const res = await fetch(`/api/requests?id=${selectedRequestId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })

          if (res.ok) {
            setIsDeleteDialogOpen(false)
            setSelectedRequestId(null)
            fetchRequests()
          } else {
            console.error("Ошибка при удалении заявки")
          }
        }}
        className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
      >
        Удалить
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}
