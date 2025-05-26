"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Users, Clock, TrendingUp, ArrowLeft, Filter, Search } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [department, setDepartment] = useState("")

  const availableReports = [
    {
      id: 1,
      name: "Отчет по рабочему времени",
      description: "Детальный отчет по отработанным часам сотрудников",
      type: "Время",
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      name: "Отчет по переработкам",
      description: "Анализ сверхурочных часов и переработок",
      type: "Переработки",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 3,
      name: "Отчет по отпускам",
      description: "Статистика по отпускам и больничным",
      type: "Отпуска",
      icon: Calendar,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 4,
      name: "Отчет по персоналу",
      description: "Общая информация о сотрудниках и их активности",
      type: "Персонал",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const generatedReports = [
    {
      id: 1,
      name: "Отчет по рабочему времени - Январь 2024",
      type: "Время",
      department: "Все отделы",
      period: "01.01.2024 - 31.01.2024",
      generated: "01.02.2024 10:30",
      size: "2.3 MB",
      format: "Excel",
    },
    {
      id: 2,
      name: "Отчет по переработкам - IT отдел",
      type: "Переработки",
      department: "IT",
      period: "01.01.2024 - 31.01.2024",
      generated: "31.01.2024 16:45",
      size: "1.1 MB",
      format: "Excel",
    },
    {
      id: 3,
      name: "Квартальный отчет по отпускам",
      type: "Отпуска",
      department: "Все отделы",
      period: "01.10.2023 - 31.12.2023",
      generated: "05.01.2024 09:15",
      size: "890 KB",
      format: "PDF",
    },
  ]

  const handleGenerateReport = () => {
    // Логика генерации отчета
    console.log("Generating report:", { reportType, dateFrom, dateTo, department })
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
                        <SelectItem value="personnel">Персонал</SelectItem>
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
                    <Label htmlFor="department">Отдел</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все отделы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все отделы</SelectItem>
                        <SelectItem value="it">IT-отдел</SelectItem>
                        <SelectItem value="hr">HR-отдел</SelectItem>
                        <SelectItem value="sales">Отдел продаж</SelectItem>
                        <SelectItem value="design">Отдел дизайна</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleGenerateReport} className="w-full" disabled={!reportType}>
                    <FileText className="w-4 h-4 mr-2" />
                    Сгенерировать отчет
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reports */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Быстрые отчеты</CardTitle>
                <CardDescription>Готовые шаблоны отчетов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableReports.map((report) => {
                    const IconComponent = report.icon
                    return (
                      <Button
                        key={report.id}
                        variant="outline"
                        className="w-full h-auto p-4 flex items-start space-x-3"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm">{report.name}</p>
                          <p className="text-xs text-muted-foreground">{report.description}</p>
                        </div>
                      </Button>
                    )
                  })}
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
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Фильтр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Поиск
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{report.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>Отдел: {report.department}</span>
                            <span>Период: {report.period}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <div>Создан: {report.generated}</div>
                          <div>
                            Размер: {report.size} • Формат: {report.format}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Просмотр
                          </Button>
                          <Button size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Скачать
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Аналитическая сводка</CardTitle>
                <CardDescription>Ключевые показатели за текущий месяц</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2,340</div>
                    <p className="text-sm text-blue-600">Часов отработано</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">156</div>
                    <p className="text-sm text-orange-600">Часов переработок</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <p className="text-sm text-green-600">Дней отпуска</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <p className="text-sm text-purple-600">Эффективность</p>
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
