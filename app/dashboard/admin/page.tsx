"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent, } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  User,
  Crown,
  LogOut,
  Edit,
} from "lucide-react"

export default function AdminDashboard() {
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [employees, setEmployees] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false)
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false)
  const [profile, setProfile] = useState<{ id: number; firstName: string; lastName: string; email: string } | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee" as "employee" | "hr" | "admin",
    password: "",
    confirmPassword: "",
  })
  const [editEmployee, setEditEmployee] = useState({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    role: "employee" as "employee" | "hr" | "admin",
    changePassword: false,
    newPassword: "",
    confirmPassword: "",
  })
  const [employeeError, setEmployeeError] = useState("")
  const [editEmployeeError, setEditEmployeeError] = useState("")
  useEffect(() => {
  const init = async () => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)

      try {
        const [profileRes, employeesRes] = await Promise.all([
          fetch("/api/profile", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }),
          fetch("/api/hr/employees"),
        ])

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        } else {
          console.error("Ошибка загрузки профиля")
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          setEmployees(employeesData)
        } else {
          console.error("Ошибка получения сотрудников")
        }
      } catch (error) {
        console.error("Ошибка при инициализации:", error)
      }
    }
  }
    init()
  }, [])

  // Get role icon and color
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

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "all" || employee.role === selectedRole

    return matchesSearch && matchesRole
  })

  // Validate new employee form
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

  // Validate edit employee form
  const validateEditEmployee = () => {
    if (!editEmployee.firstName.trim()) {
      setEditEmployeeError("Введите имя")
      return false
    }
    if (!editEmployee.lastName.trim()) {
      setEditEmployeeError("Введите фамилию")
      return false
    }
    if (!editEmployee.email.trim()) {
      setEditEmployeeError("Введите email")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmployee.email)) {
      setEditEmployeeError("Введите корректный email")
      return false
    }
    if (editEmployee.changePassword) {
      if (!editEmployee.newPassword) {
        setEditEmployeeError("Введите новый пароль")
        return false
      }
      if (editEmployee.newPassword.length < 6) {
        setEditEmployeeError("Пароль должен содержать минимум 6 символов")
        return false
      }
      if (editEmployee.newPassword !== editEmployee.confirmPassword) {
        setEditEmployeeError("Пароли не совпадают")
        return false
      }
    }
    return true
  }

  // Handle employee creation
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

  // Handle employee editing
  const handleEditEmployee = async () => {
    if (!validateEditEmployee()) return

    try {
      const updateData: any = {
        firstName: editEmployee.firstName,
        lastName: editEmployee.lastName,
        email: editEmployee.email,
        role: editEmployee.role,
      }

      if (editEmployee.changePassword) {
        updateData.password = editEmployee.newPassword
      }

      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        // Update local state
        setEmployees(
          employees.map((emp) =>
            emp.id === editEmployee.id
              ? {
                  ...emp,
                  firstName: editEmployee.firstName,
                  lastName: editEmployee.lastName,
                  name: `${editEmployee.lastName} ${editEmployee.firstName[0]}.`,
                  email: editEmployee.email,
                  userRole: editEmployee.role,
                }
              : emp,
          ),
        )

        setIsEditEmployeeDialogOpen(false)
        setEditEmployeeError("")
      } else {
        const error = await res.json()
        setEditEmployeeError(error.message || "Ошибка при обновлении сотрудника")
      }
    } catch (error) {
      setEditEmployeeError("Ошибка при обновлении сотрудника")
    }
  }

  // Open edit dialog
  const openEditDialog = (employee: (typeof employees)[0]) => {
    setEditEmployee({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      changePassword: false,
      newPassword: "",
      confirmPassword: "",
    })
    setEditEmployeeError("")
    setIsEditEmployeeDialogOpen(true)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Панель администратора</h1>
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

        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
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

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole("all")
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
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
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
        </Tabs>
      </div>

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

      {/* Edit Employee Dialog */}
      <Dialog open={isEditEmployeeDialogOpen} onOpenChange={setIsEditEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
            <DialogDescription>Измените информацию о сотруднике</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="editFirstName">Имя</Label>
                <Input
                  id="editFirstName"
                  value={editEmployee.firstName}
                  onChange={(e) => {
                    setEditEmployee({ ...editEmployee, firstName: e.target.value })
                    setEditEmployeeError("")
                  }}
                  placeholder="Введите имя"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editLastName">Фамилия</Label>
                <Input
                  id="editLastName"
                  value={editEmployee.lastName}
                  onChange={(e) => {
                    setEditEmployee({ ...editEmployee, lastName: e.target.value })
                    setEditEmployeeError("")
                  }}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmployee.email}
                onChange={(e) => {
                  setEditEmployee({ ...editEmployee, email: e.target.value })
                  setEditEmployeeError("")
                }}
                placeholder="Введите email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="editRole">Роль в системе</Label>
              <Select
                value={editEmployee.role}
                onValueChange={(value: "employee" | "hr" | "admin") => {
                  setEditEmployee({ ...editEmployee, role: value })
                  setEditEmployeeError("")
                }}
              >
                <SelectTrigger id="editRole">
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

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={editEmployee.changePassword}
                  onChange={(e) => {
                    setEditEmployee({
                      ...editEmployee,
                      changePassword: e.target.checked,
                      newPassword: "",
                      confirmPassword: "",
                    })
                    setEditEmployeeError("")
                  }}
                  className="rounded"
                />
                <Label htmlFor="changePassword">Изменить пароль</Label>
              </div>

              {editEmployee.changePassword && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editNewPassword">Новый пароль</Label>
                    <Input
                      id="editNewPassword"
                      type="password"
                      value={editEmployee.newPassword}
                      onChange={(e) => {
                        setEditEmployee({ ...editEmployee, newPassword: e.target.value })
                        setEditEmployeeError("")
                      }}
                      placeholder="Введите новый пароль"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="editConfirmPassword">Подтвердите пароль</Label>
                    <Input
                      id="editConfirmPassword"
                      type="password"
                      value={editEmployee.confirmPassword}
                      onChange={(e) => {
                        setEditEmployee({ ...editEmployee, confirmPassword: e.target.value })
                        setEditEmployeeError("")
                      }}
                      placeholder="Повторите новый пароль"
                    />
                  </div>
                </div>
              )}
            </div>

            {editEmployeeError && <p className="text-sm text-red-600">{editEmployeeError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEmployeeDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditEmployee}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
