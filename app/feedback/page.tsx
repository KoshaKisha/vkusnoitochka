"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("")

  const feedbackHistory = [
    {
      id: 1,
      type: "Предложение",
      subject: "Улучшение системы учета времени",
      message: "Предлагаю добавить возможность автоматического учета времени через интеграцию с календарем...",
      date: "2024-01-25 14:30",
      status: "Рассмотрено",
      response: "Спасибо за предложение! Мы рассмотрим возможность добавления данной функции в следующем обновлении.",
      priority: "Средний",
    },
    {
      id: 2,
      type: "Жалоба",
      subject: "Проблема с отображением отчетов",
      message: "При генерации месячного отчета система выдает ошибку. Не могу скачать отчет за декабрь.",
      date: "2024-01-20 09:15",
      status: "Решено",
      response: "Проблема была исправлена. Теперь отчеты генерируются корректно.",
      priority: "Высокий",
    },
    {
      id: 3,
      type: "Вопрос",
      subject: "Как изменить график работы?",
      message: "Подскажите, как можно изменить свой рабочий график в системе?",
      date: "2024-01-18 16:45",
      status: "В обработке",
      response: null,
      priority: "Низкий",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Логика отправки обратной связи
    console.log("Feedback submitted:", { feedbackType, subject, message, priority })
    // Очистка формы
    setFeedbackType("")
    setSubject("")
    setMessage("")
    setPriority("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Решено":
      case "Рассмотрено":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "В обработке":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Решено":
      case "Рассмотрено":
        return "bg-green-100 text-green-800"
      case "В обработке":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Высокий":
        return "bg-red-100 text-red-800"
      case "Средний":
        return "bg-yellow-100 text-yellow-800"
      case "Низкий":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Обратная связь</h1>
                <p className="text-sm text-gray-500">Отправьте отзыв, предложение или сообщите о проблеме</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Новое сообщение</CardTitle>
                <CardDescription>Опишите вашу проблему, предложение или вопрос</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="feedbackType">Тип обращения</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип обращения" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">Предложение</SelectItem>
                        <SelectItem value="complaint">Жалоба</SelectItem>
                        <SelectItem value="question">Вопрос</SelectItem>
                        <SelectItem value="bug">Сообщение об ошибке</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите приоритет" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="urgent">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Тема</Label>
                    <Input
                      id="subject"
                      placeholder="Краткое описание проблемы или предложения"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea
                      id="message"
                      placeholder="Подробно опишите вашу проблему, предложение или вопрос..."
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={!feedbackType || !subject || !message}>
                    <Send className="w-4 h-4 mr-2" />
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Часто задаваемые вопросы</CardTitle>
                <CardDescription>Возможно, ответ на ваш вопрос уже есть</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Как изменить пароль?
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Как подать заявку на отпуск?
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Как исправить отметки времени?
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Как скачать отчет?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>История обращений</CardTitle>
                <CardDescription>Ваши предыдущие сообщения и их статус</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackHistory.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">{feedback.type}</Badge>
                            <Badge className={getPriorityColor(feedback.priority)}>{feedback.priority}</Badge>
                          </div>
                          <h3 className="font-medium">{feedback.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feedback.message.length > 100
                              ? `${feedback.message.substring(0, 100)}...`
                              : feedback.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(feedback.status)}
                          <Badge className={getStatusColor(feedback.status)}>{feedback.status}</Badge>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">Отправлено: {feedback.date}</div>

                      {feedback.response && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-900">Ответ службы поддержки:</span>
                          </div>
                          <p className="text-sm text-blue-800">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
                <CardDescription>Альтернативные способы связи</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email службы поддержки:</span>
                    <p className="text-muted-foreground">support@company.ru</p>
                  </div>
                  <div>
                    <span className="font-medium">Телефон:</span>
                    <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                  </div>
                  <div>
                    <span className="font-medium">Часы работы:</span>
                    <p className="text-muted-foreground">Пн-Пт: 9:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
