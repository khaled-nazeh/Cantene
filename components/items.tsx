"use client"

import { useState } from "react"
import { useData, type Item } from "@/lib/data-context"
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
import { Pencil, Trash2, PlusCircle, Search, Coffee, Utensils, Cookie, MoreHorizontal, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Items() {
  const { items, purchases, addItem, updateItem, deleteItem, updateItemInventory } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<Omit<Item, "id">>({
    name: "",
    purchasePrice: 0, // سعر الشراء
    price: 0, // سعر البيع
    category: "وجبات خفيفة",
    amount: 0, // كمية المخزون
  })
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [inventoryItem, setInventoryItem] = useState<Item | null>(null)
  const [newInventoryAmount, setNewInventoryAmount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categories = ["مشروبات", "طعام", "وجبات خفيفة", "أخرى"]

  const handleAddItem = () => {
    if (newItem.name && newItem.price > 0) {
      addItem(newItem)
      setNewItem({ name: "", purchasePrice: 0, price: 0, category: "وجبات خفيفة", amount: 0 })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditItem = () => {
    if (editingItem && editingItem.name && editingItem.price > 0) {
      const originalItem = items.find((item) => item.id === editingItem.id)
      updateItem(editingItem.id, {
        name: editingItem.name,
        purchasePrice: editingItem.purchasePrice,
        price: editingItem.price,
        category: editingItem.category,
        amount: originalItem ? originalItem.amount : editingItem.amount, // Mantener la cantidad original
      })
      setEditingItem(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleUpdateInventory = () => {
    if (inventoryItem && newInventoryAmount >= 0) {
      updateItemInventory(inventoryItem.id, newInventoryAmount)
      setInventoryItem(null)
      setNewInventoryAmount(0)
      setIsInventoryDialogOpen(false)
    }
  }

  const handleDeleteItem = (id: string) => {
    // التحقق مما إذا كان المنتج لديه مشتريات
    const itemPurchases = purchases.filter((p) => p.itemId === id)
    if (itemPurchases.length > 0) {
      alert("لا يمكن حذف منتج له مشتريات. يرجى حذف المشتريات أولاً.")
      return
    }

    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج؟")) {
      deleteItem(id)
    }
  }

  const startEditItem = (item: Item) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const startUpdateInventory = (item: Item) => {
    setInventoryItem(item)
    setNewInventoryAmount(item.amount)
    setIsInventoryDialogOpen(true)
  }

  // تصفية المنتجات حسب البحث والفئة
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.includes(searchTerm) ||
      item.category.includes(searchTerm) ||
      item.price.toString().includes(searchTerm) ||
      item.amount.toString().includes(searchTerm)

    const matchesCategory = categoryFilter ? item.category === categoryFilter : true

    return matchesSearch && matchesCategory
  })

  // الحصول على أيقونة الفئة
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "مشروبات":
        return <Coffee className="h-4 w-4" />
      case "طعام":
        return <Utensils className="h-4 w-4" />
      case "وجبات خفيفة":
        return <Cookie className="h-4 w-4" />
      default:
        return <MoreHorizontal className="h-4 w-4" />
    }
  }

  // الحصول على لون الفئة
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "مشروبات":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "طعام":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "وجبات خفيفة":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // حساب هامش الربح
  const calculateProfitMargin = (purchasePrice: number, sellingPrice: number) => {
    if (purchasePrice === 0) return 0
    return ((sellingPrice - purchasePrice) / purchasePrice) * 100
  }

  // حساب إجمالي قيمة المخزون
  const totalInventoryValue = filteredItems.reduce((sum, item) => sum + item.purchasePrice * item.amount, 0)

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>المنتجات</CardTitle>
          <CardDescription>إدارة منتجات الكافتيريا وأسعارها والمخزون</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mr-auto">
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
              <DialogDescription>إضافة منتج جديد إلى مخزون الكافتيريا</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">سعر الشراء (ج.م)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.purchasePrice}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    setNewItem({ ...newItem, purchasePrice: value })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">سعر البيع (ج.م)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    setNewItem({ ...newItem, price: value })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">كمية المخزون</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={newItem.amount}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    setNewItem({ ...newItem, amount: value })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">الفئة</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
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
              <Button onClick={handleAddItem}>إضافة منتج</Button>
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
                placeholder="بحث عن منتج..."
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

          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                إجمالي قيمة المخزون
              </h3>
              <div className="text-2xl font-bold">{totalInventoryValue.toFixed(2)} ج.م</div>
            </div>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">جدول المنتجات</TabsTrigger>
              <TabsTrigger value="inventory">المخزون</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>سعر الشراء</TableHead>
                      <TableHead>سعر البيع</TableHead>
                      <TableHead>هامش الربح</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          لا توجد نتائج مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.purchasePrice.toFixed(2)} ج.م</TableCell>
                          <TableCell>{item.price.toFixed(2)} ج.م</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {calculateProfitMargin(item.purchasePrice, item.price).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`flex w-fit items-center gap-1 ${getCategoryColor(item.category)}`}
                            >
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left">
                            <Button variant="ghost" size="icon" onClick={() => startEditItem(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5}>إجمالي المنتجات</TableCell>
                      <TableCell>{filteredItems.length}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>كمية المخزون</TableHead>
                      <TableHead>سعر الشراء</TableHead>
                      <TableHead>القيمة الإجمالية</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          لا توجد نتائج مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`flex w-fit items-center gap-1 ${getCategoryColor(item.category)}`}
                            >
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.amount > 0 ? "outline" : "destructive"}
                              className={item.amount > 0 ? "bg-green-100 text-green-800" : ""}
                            >
                              {item.amount} وحدة
                            </Badge>
                          </TableCell>
                          <TableCell>{item.purchasePrice.toFixed(2)} ج.م</TableCell>
                          <TableCell className="font-medium">
                            {(item.purchasePrice * item.amount).toFixed(2)} ج.م
                          </TableCell>
                          <TableCell className="text-left">
                            <Button variant="ghost" size="icon" onClick={() => startUpdateInventory(item)}>
                              <Package className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4}>إجمالي قيمة المخزون</TableCell>
                      <TableCell className="font-bold">{totalInventoryValue.toFixed(2)} ج.م</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المنتج</DialogTitle>
              <DialogDescription>تحديث معلومات المنتج</DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">الاسم</Label>
                  <Input
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-purchasePrice">سعر الشراء (ج.م)</Label>
                  <Input
                    id="edit-purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItem.purchasePrice}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      setEditingItem({ ...editingItem, purchasePrice: value })
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">سعر البيع (ج.م)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItem.price}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      setEditingItem({ ...editingItem, price: value })
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">الفئة</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
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
            )}
            <DialogFooter>
              <Button onClick={handleEditItem}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحديث المخزون</DialogTitle>
              <DialogDescription>تعديل كمية المخزون للمنتج</DialogDescription>
            </DialogHeader>
            {inventoryItem && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-medium">{inventoryItem.name}</h3>
                  <Badge
                    variant="outline"
                    className={`flex w-fit items-center gap-1 ${getCategoryColor(inventoryItem.category)}`}
                  >
                    {getCategoryIcon(inventoryItem.category)}
                    {inventoryItem.category}
                  </Badge>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current-amount">الكمية الحالية</Label>
                  <Input id="current-amount" value={inventoryItem.amount} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-amount">الكمية الجديدة</Label>
                  <Input
                    id="new-amount"
                    type="number"
                    min="0"
                    value={newInventoryAmount}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      setNewInventoryAmount(value)
                    }}
                  />
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  {newInventoryAmount > inventoryItem.amount ? (
                    <p className="text-sm">
                      <span className="font-medium">إضافة للمخزون: </span>
                      <span className="text-green-600">{newInventoryAmount - inventoryItem.amount} وحدة</span>
                    </p>
                  ) : newInventoryAmount < inventoryItem.amount ? (
                    <p className="text-sm">
                      <span className="font-medium">خصم من المخزون: </span>
                      <span className="text-red-600">{inventoryItem.amount - newInventoryAmount} وحدة</span>
                    </p>
                  ) : (
                    <p className="text-sm">
                      <span className="text-muted-foreground">لا تغيير في المخزون</span>
                    </p>
                  )}
                  {newInventoryAmount !== inventoryItem.amount && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">التكلفة: </span>
                      <span className={newInventoryAmount > inventoryItem.amount ? "text-red-600" : "text-green-600"}>
                        {((newInventoryAmount - inventoryItem.amount) * inventoryItem.purchasePrice).toFixed(2)} ج.م
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateInventory}>تحديث المخزون</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

