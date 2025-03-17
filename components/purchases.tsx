"use client"

import { useState } from "react"
import { useData, type Purchase } from "@/lib/data-context"
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
import { Trash2, ShoppingBag, Search, Calendar, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Purchases() {
  const { users, items, purchases, addPurchase, deletePurchase } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPurchase, setNewPurchase] = useState<Omit<Purchase, "id" | "total">>({
    userId: "",
    itemId: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddPurchase = () => {
    if (newPurchase.userId && newPurchase.itemId && newPurchase.quantity > 0) {
      try {
        // التحقق من توفر المخزون
        const item = items.find((i) => i.id === newPurchase.itemId)
        if (item && item.amount < newPurchase.quantity) {
          setError(`المخزون غير كافٍ. المتوفر: ${item.amount} وحدة`)
          return
        }

        addPurchase(newPurchase)
        setNewPurchase({
          userId: "",
          itemId: "",
          quantity: 1,
          date: new Date().toISOString().split("T")[0],
        })
        setError(null)
        setIsAddDialogOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
      }
    }
  }

  const handleDeletePurchase = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الشراء؟")) {
      deletePurchase(id)
    }
  }

  // الحصول على قائمة التواريخ الفريدة
  const uniqueDates = [...new Set(purchases.map((p) => p.date))].sort().reverse()

  // تصفية المشتريات
  const filteredPurchases = purchases.filter((purchase) => {
    const user = users.find((u) => u.id === purchase.userId)
    const item = items.find((i) => i.id === purchase.itemId)

    const matchesSearch =
      (user?.name && user.name.includes(searchTerm)) ||
      (item?.name && item.name.includes(searchTerm)) ||
      purchase.quantity.toString().includes(searchTerm) ||
      purchase.total.toString().includes(searchTerm)

    const matchesDate = dateFilter ? purchase.date === dateFilter : true
    const matchesUser = userFilter ? purchase.userId === userFilter : true

    return matchesSearch && matchesDate && matchesUser
  })

  // الحصول على الحروف الأولى من اسم المستخدم
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // التحقق من توفر المخزون للمنتج المحدد
  const selectedItem = items.find((i) => i.id === newPurchase.itemId)
  const isInventoryLow = selectedItem && selectedItem.amount < newPurchase.quantity

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>المشتريات</CardTitle>
          <CardDescription>تسجيل وإدارة مشتريات الكافتيريا</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mr-auto">
              <ShoppingBag className="h-4 w-4 ml-2" />
              إضافة شراء
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة شراء جديد</DialogTitle>
              <DialogDescription>تسجيل شراء جديد في الكافتيريا</DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user">المستخدم</Label>
                <Select
                  value={newPurchase.userId}
                  onValueChange={(value) => setNewPurchase({ ...newPurchase, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item">المنتج</Label>
                <Select
                  value={newPurchase.itemId}
                  onValueChange={(value) => setNewPurchase({ ...newPurchase, itemId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر منتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.price.toFixed(2)} ج.م) - المخزون: {item.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newPurchase.quantity}
                  onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number.parseInt(e.target.value) })}
                />
                {isInventoryLow && (
                  <p className="text-sm text-red-500">
                    تحذير: المخزون المتوفر ({selectedItem?.amount} وحدة) أقل من الكمية المطلوبة
                  </p>
                )}
                {selectedItem && (
                  <p className="text-sm text-muted-foreground">المخزون المتوفر: {selectedItem.amount} وحدة</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={newPurchase.date}
                  onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPurchase}>إضافة شراء</Button>
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
                placeholder="بحث في المشتريات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={dateFilter || "all"}
                onValueChange={(value) => setDateFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="جميع التواريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={userFilter || "all"}
                onValueChange={(value) => setUserFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="جميع المستخدمين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      لا توجد نتائج مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => {
                    const user = users.find((u) => u.id === purchase.userId)
                    const item = items.find((i) => i.id === purchase.itemId)
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {purchase.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user && (
                              <Avatar className="h-6 w-6 bg-primary text-primary-foreground">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                            )}
                            {user?.name || "مستخدم غير معروف"}
                          </div>
                        </TableCell>
                        <TableCell>{item?.name || "منتج غير معروف"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-secondary/10 text-secondary">
                            {purchase.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{purchase.total.toFixed(2)} ج.م</TableCell>
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePurchase(purchase.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

