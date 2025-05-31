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
                <p className="text-sm text-gray-500">Добро пожаловать, Иванов И.И.</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Мой профиль</CardTitle>
                <CardDescription>Личная информация и настройки</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Основная информация</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">ФИО</label>
                          <p className="text-sm">Иванов Иван Иванович</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Должность</label>
                          <p className="text-sm">Старший разработчик</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Отдел</label>
                          <p className="text-sm">IT-отдел</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Дата приема</label>
                          <p className="text-sm">15.03.2020</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-4">Контактная информация</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">i.ivanov@company.ru</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Телефон</label>
                          <p className="text-sm">+7 (999) 123-45-67</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Внутренний номер</label>
                          <p className="text-sm">1234</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button>Редактировать профиль</Button>
                </div>
              </CardContent>
            </Card>
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
