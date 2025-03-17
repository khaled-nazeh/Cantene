"use client"

import { useState } from "react"
import { useData, type Expense } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Trash2, PlusCircle, Search, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id">>({
    name: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "مستلزمات",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categories = ["مستلزمات", "نظافة", "صيانة", "أخرى"]

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount > 0) {
      addExpense(newExpense)
      setNewExpense({
        name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "مستلزمات",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المصروف؟")) {
      deleteExpense(id)
    }
  }

  // تصفية المصروفات
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.name.includes(searchTerm) ||
      expense.category.includes(searchTerm) ||
      expense.amount.toString().includes(searchTerm)

    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true

    return matchesSearch && matchesCategory
  })

  // حساب إجمالي المصروفات
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>المصروفات</CardTitle>
          <CardDescription>إدارة مصروفات الكافتيريا مثل المستلزمات والنظافة</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mr-auto">
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة مصروف
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مصروف جديد</DialogTitle>
              <DialogDescription>إضافة مصروف جديد للكافتيريا</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">المبلغ (ج.م)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    setNewExpense({ ...newExpense, amount: value })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddExpense}>إضافة مصروف</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مصروف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      لا توجد نتائج مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {expense.date}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.amount.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={3} className="font-bold">
                    الإجمالي
                  </TableCell>
                  <TableCell className="font-bold">{totalExpenses.toFixed(2)} ج.م</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

