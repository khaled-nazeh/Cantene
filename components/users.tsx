"use client"

import { useState } from "react"
import { useData, type User } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, UserPlus, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Users() {
  const { users, purchases, addUser, updateUser, deleteUser } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ name: "", department: "" })
  const [editingUser, setEditingUser] = useState<User | null>({ id: "", name: "", department: "" })
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddUser = () => {
    if (newUser.name && newUser.department) {
      addUser(newUser)
      setNewUser({ name: "", department: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditUser = () => {
    if (editingUser && editingUser.name && editingUser.department) {
      updateUser(editingUser.id, {
        name: editingUser.name,
        department: editingUser.department,
      })
      setEditingUser(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteUser = (id: string) => {
    // التحقق مما إذا كان المستخدم لديه مشتريات
    const userPurchases = purchases.filter((p) => p.userId === id)
    if (userPurchases.length > 0) {
      alert("لا يمكن حذف مستخدم لديه مشتريات. يرجى حذف مشترياته أولاً.")
      return
    }

    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المستخدم؟")) {
      deleteUser(id)
    }
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  // حساب إجمالي الإنفاق لكل مستخدم
  const userSpending = users.map((user) => {
    const userPurchases = purchases.filter((p) => p.userId === user.id)
    const totalSpent = userPurchases.reduce((sum, p) => sum + p.total, 0)
    return {
      ...user,
      totalSpent,
    }
  })

  // تصفية المستخدمين حسب البحث
  const filteredUsers = userSpending.filter(
    (user) => user.name.includes(searchTerm) || user.department.includes(searchTerm),
  )

  // الحصول على الحروف الأولى من اسم المستخدم
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>إدارة موظفي المصنع الذين يستخدمون الكافتيريا</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mr-auto" variant="default">
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>إضافة موظف جديد إلى نظام الكافتيريا</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">القسم</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>إضافة مستخدم</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>إجمالي الإنفاق</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    لا توجد نتائج مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.totalSpent.toFixed(2)} ج.م</TableCell>
                    <TableCell className="text-left">
                      <Button variant="ghost" size="icon" onClick={() => startEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المستخدم</DialogTitle>
              <DialogDescription>تحديث معلومات المستخدم</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">الاسم</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">القسم</Label>
                  <Input
                    id="edit-department"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditUser}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

