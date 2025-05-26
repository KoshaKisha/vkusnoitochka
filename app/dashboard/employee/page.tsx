"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageSquare, User, Play, Square, Coffee, LogOut, Timer } from "lucide-react"

export default function EmployeeDashboard() {
  const [isWorking, setIsWorking] = useState(false)
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null)
  const [totalHoursToday] = useState("7:45")
  const [totalHoursMonth] = useState("156:30")

  const handleStartWork = () => {
    setIsWorking(true)
    setWorkStartTime(new Date())
  }

  const handleEndWork = () => {
    setIsWorking(false)
    setWorkStartTime(null)
  }

  const getCurrentWorkTime = () => {
    if (!workStartTime) return "00:00"
    const now = new Date()
    const diff = now.getTime() - workStartTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const recentTimeEntries = [
    { date: "2024-01-26", start: "09:00", end: "18:00", hours: "8:00", status: "Завершен" },
    { date: "2024-01-25", start: "09:15", end: "17:45", hours: "7:30", status: "Завершен" },
    { date: "2024-01-24", start: "09:00", end: "18:30", hours: "8:30", status: "Завершен" },
    { date: "2024-01-23", start: "09:30", end: "18:00", hours: "7:30", status: "Завершен" },
  ]

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
            <Button variant="outline" size="sm">
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
            <CardDescription>Отметьте начало и окончание рабочего дня</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {isWorking ? getCurrentWorkTime() : "00:00"}
                </div>
                <p className="text-sm text-muted-foreground">Текущая смена</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{totalHoursToday}</div>
                <p className="text-sm text-muted-foreground">Сегодня отработано</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{totalHoursMonth}</div>
                <p className="text-sm text-muted-foreground">За месяц</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              {!isWorking ? (
                <Button onClick={handleStartWork} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Начать смену
                </Button>
              ) : (
                <>
                  <Button onClick={handleEndWork} variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    Завершить смену
                  </Button>
                  <Button variant="outline">
                    <Coffee className="w-4 h-4 mr-2" />
                    Перерыв
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="timesheet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timesheet">Табель</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="feedback">Обратная связь</TabsTrigger>
          </TabsList>

          <TabsContent value="timesheet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>История рабочего времени</CardTitle>
                <CardDescription>Ваши отметки времени за последние дни</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTimeEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="font-medium">{entry.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("ru-RU", { weekday: "short" })}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div>
                            <strong>Начало:</strong> {entry.start}
                          </div>
                          <div>
                            <strong>Окончание:</strong> {entry.end}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">{entry.hours}</div>
                        <Badge variant="default">{entry.status}</Badge>
                      </div>
                    </div>
                  ))}
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
                    <Calendar className="w-4 h-4 mr-2" />
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

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Обратная связь</CardTitle>
                <CardDescription>Оставьте отзыв, предложение или жалобу</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full md:w-auto">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Написать сообщение
                  </Button>

                  <div className="space-y-3">
                    <h3 className="font-medium">Мои сообщения</h3>
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>У вас пока нет сообщений</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
