"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Calendar, Play, Square, Coffee, Edit, Save, ArrowLeft } from "lucide-react"

export default function TimeTrackingPage() {
  const [isWorking, setIsWorking] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    breakDuration: "",
    notes: "",
  })

  const handleStartWork = () => {
    setIsWorking(true)
    setWorkStartTime(new Date())
  }

  const handleEndWork = () => {
    setIsWorking(false)
    setIsOnBreak(false)
    setWorkStartTime(null)
    setBreakStartTime(null)
  }

  const handleStartBreak = () => {
    setIsOnBreak(true)
    setBreakStartTime(new Date())
  }

  const handleEndBreak = () => {
    setIsOnBreak(false)
    setBreakStartTime(null)
  }

  const getCurrentWorkTime = () => {
    if (!workStartTime) return "00:00"
    const now = new Date()
    let workTime = now.getTime() - workStartTime.getTime()

    // Вычитаем время перерыва, если он активен
    if (isOnBreak && breakStartTime) {
      workTime -= now.getTime() - breakStartTime.getTime()
    }

    const hours = Math.floor(workTime / (1000 * 60 * 60))
    const minutes = Math.floor((workTime % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const getCurrentBreakTime = () => {
    if (!breakStartTime) return "00:00"
    const now = new Date()
    const diff = now.getTime() - breakStartTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const timeEntries = [
    {
      date: "2024-01-26",
      start: "09:00",
      end: "18:00",
      break: "1:00",
      total: "8:00",
      status: "Завершен",
      notes: "Работа над проектом A",
    },
    {
      date: "2024-01-25",
      start: "09:15",
      end: "17:45",
      break: "0:45",
      total: "7:45",
      status: "Завершен",
      notes: "Встречи с клиентами",
    },
    {
      date: "2024-01-24",
      start: "09:00",
      end: "18:30",
      break: "1:15",
      total: "8:15",
      status: "Завершен",
      notes: "Переработка по проекту B",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Учет рабочего времени</h1>
                <p className="text-sm text-gray-500">Отметки времени и управление сменами</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Session */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Текущая смена</span>
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("ru-RU", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Time Display */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{getCurrentWorkTime()}</div>
                      <p className="text-sm text-blue-600">Рабочее время</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">{getCurrentBreakTime()}</div>
                      <p className="text-sm text-orange-600">Перерыв</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <Badge variant={isWorking ? (isOnBreak ? "secondary" : "default") : "outline"} className="text-sm">
                      {!isWorking ? "Не работаю" : isOnBreak ? "На перерыве" : "Работаю"}
                    </Badge>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    {!isWorking ? (
                      <Button onClick={handleStartWork} className="w-full bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Начать рабочий день
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {!isOnBreak ? (
                          <Button onClick={handleStartBreak} variant="outline" className="w-full">
                            <Coffee className="w-4 h-4 mr-2" />
                            Начать перерыв
                          </Button>
                        ) : (
                          <Button onClick={handleEndBreak} className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Закончить перерыв
                          </Button>
                        )}
                        <Button onClick={handleEndWork} variant="destructive" className="w-full">
                          <Square className="w-4 h-4 mr-2" />
                          Завершить рабочий день
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Ручной ввод времени</span>
                </CardTitle>
                <CardDescription>Добавить или исправить отметки времени</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Дата</Label>
                      <Input
                        id="date"
                        type="date"
                        value={manualEntry.date}
                        onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                      />
                    </div>
                    <div></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Время начала</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={manualEntry.startTime}
                        onChange={(e) => setManualEntry({ ...manualEntry, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Время окончания</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={manualEntry.endTime}
                        onChange={(e) => setManualEntry({ ...manualEntry, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="breakDuration">Длительность перерыва (мин)</Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      placeholder="60"
                      value={manualEntry.breakDuration}
                      onChange={(e) => setManualEntry({ ...manualEntry, breakDuration: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Примечания</Label>
                    <Textarea
                      id="notes"
                      placeholder="Описание работы, причина корректировки..."
                      value={manualEntry.notes}
                      onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })}
                    />
                  </div>

                  <Button className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить запись
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>История времени</span>
                </CardTitle>
                <CardDescription>Ваши отметки времени за последние дни</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeEntries.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{entry.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("ru-RU", { weekday: "long" })}
                          </div>
                        </div>
                        <Badge variant="default">{entry.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Начало:</span> {entry.start}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Окончание:</span> {entry.end}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Перерыв:</span> {entry.break}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Итого:</span> <strong>{entry.total}</strong>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">{entry.notes}</div>
                      )}

                      <div className="flex justify-end mt-3">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </Button>
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
