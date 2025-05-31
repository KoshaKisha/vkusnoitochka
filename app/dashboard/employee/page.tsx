"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, User, LogOut, Timer } from "lucide-react"
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
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  const res = await fetch("/api/schedules", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
   body: JSON.stringify({
      date: formattedDate,
      startTime: newShift.startTime,
      endTime: newShift.endTime, }),
  })

  if (res.ok) {
    const shift = await res.json()

    const [startHour, startMinute] = newShift.startTime.split(":").map(Number)
    const [endHour, endMinute] = newShift.endTime.split(":").map(Number)
    const hours = endHour - startHour + (endMinute - startMinute) / 60

    setShifts({
      ...shifts,
      [formattedDate]: {
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        hours,
      },
    })
  } else {
    console.error("Ошибка при добавлении смены")
  }

  setIsDialogOpen(false)
}


  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewShift({
        ...newShift,
        date: date,
      })
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                      {Object.entries(shifts).map(([date, shift]) => (
                        <div key={date} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="font-medium">{date}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(date).toLocaleDateString("ru-RU", { weekday: "short" })}
                              </div>
                            </div>
                            <div className="text-sm">
                              <div>
                                <strong>Начало:</strong> {shift.startTime}
                              </div>
                              <div>
                                <strong>Окончание:</strong> {shift.endTime}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-lg">
                              {Math.floor(shift.hours)}:
                              {Math.round((shift.hours % 1) * 60)
                                .toString()
                                .padStart(2, "0")}
                            </div>
                            <Badge variant="default">Запланировано</Badge>
                          </div>
                        </div>
                      ))}
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
                              oldPassword: "",
                              newPassword: "",
                              confirmPassword: "",
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

                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-3">Изменить пароль</h3>

                          <div className="flex flex-col gap-2 mb-3">
                            <Label htmlFor="oldPassword">Текущий пароль</Label>
                            <Input
                              id="oldPassword"
                              type="password"
                              value={editForm.oldPassword}
                              onChange={(e) => setEditForm({ ...editForm, oldPassword: e.target.value })}
                              placeholder="Введите текущий пароль"
                            />
                          </div>

                          <div className="flex flex-col gap-2 mb-3">
                            <Label htmlFor="newPassword">Новый пароль</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={editForm.newPassword}
                              onChange={(e) => {
                                setEditForm({ ...editForm, newPassword: e.target.value })
                                setPasswordError("")
                              }}
                              placeholder="Введите новый пароль"
                            />
                          </div>

                          <div className="flex flex-col gap-2 mb-3">
                            <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={editForm.confirmPassword}
                              onChange={(e) => {
                                setEditForm({ ...editForm, confirmPassword: e.target.value })
                                setPasswordError("")
                              }}
                              placeholder="Повторите новый пароль"
                            />
                          </div>

                          {passwordError && <p className="text-sm text-red-600 mb-3">{passwordError}</p>}
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
                            // Validate passwords if they are being changed
                            if (editForm.newPassword || editForm.confirmPassword || editForm.oldPassword) {
                              if (!editForm.oldPassword) {
                                setPasswordError("Введите текущий пароль")
                                return
                              }
                              if (!editForm.newPassword) {
                                setPasswordError("Введите новый пароль")
                                return
                              }
                              if (editForm.newPassword !== editForm.confirmPassword) {
                                setPasswordError("Новые пароли не совпадают")
                                return
                              }
                              if (editForm.newPassword.length < 6) {
                                setPasswordError("Новый пароль должен содержать минимум 6 символов")
                                return
                              }
                            }

                            try {
                              const updateData: any = {
                                firstName: editForm.firstName,
                                lastName: editForm.lastName,
                                email: editForm.email,
                              }

                              // Only include password fields if user is changing password
                              if (editForm.oldPassword && editForm.newPassword) {
                                updateData.oldPassword = editForm.oldPassword
                                updateData.newPassword = editForm.newPassword
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
                <CardTitle>Мои заявки</CardTitle>
                <CardDescription>Заявки на отпуск, больничные и другие запросы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full md:w-auto">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Подать заявку на отпуск
                  </Button>

                  <div className="space-y-3">
                    <h3 className="font-medium">Активные заявки</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Заявка на отпуск</p>
                          <p className="text-sm text-muted-foreground">01.03.2024 - 15.03.2024 (14 дней)</p>
                          <p className="text-sm text-muted-foreground">Подана: 20.01.2024</p>
                        </div>
                        <Badge variant="secondary">На рассмотрении</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shift Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddShift}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
