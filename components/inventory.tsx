"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, ArrowUpDown, Plus, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import axios from "axios"

export default function Inventory() {
  const [items, setItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")

  // **Fetch inventory data from the backend**
  useEffect(() => {
    axios.get<{ id: string; name: string; category: string; amount: number; purchasePrice: number }[]>("/api/inventory")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching inventory:", error))
  }, [])
  

  // **Update inventory in the database**
  const updateItemInventory = async (itemId: string, newAmount: number) => {
    try {
      await axios.put(`/api/inventory/${itemId}`, { amount: newAmount })
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, amount: newAmount } : item
        )
      )
    } catch (error) {
      console.error("Error updating inventory:", error)
    }
  }

  // **Filter items by search term**
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // **Sort items**
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "category":
        comparison = a.category.localeCompare(b.category)
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "purchasePrice":
        comparison = a.purchasePrice - b.purchasePrice
        break
      case "totalValue":
        comparison = a.amount * a.purchasePrice - b.amount * b.purchasePrice
        break
      default:
        comparison = 0
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  // **Toggle sort direction**
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // **Calculate total inventory value**
  const totalInventoryValue = items.reduce((sum, item) => sum + item.purchasePrice * item.amount, 0)

  // **Adjust inventory**
  const handleAdjustInventory = async () => {
    if (!selectedItem || adjustmentAmount <= 0) return

    const item = items.find((i) => i.id === selectedItem)
    if (!item) return

    const newAmount =
      adjustmentType === "add" ? item.amount + adjustmentAmount : Math.max(0, item.amount - adjustmentAmount)

    await updateItemInventory(selectedItem, newAmount)
    setIsAdjustDialogOpen(false)
    setAdjustmentAmount(0)
  }

  // **Open adjust inventory dialog**
  const openAdjustDialog = (itemId: string, type: "add" | "subtract") => {
    setSelectedItem(itemId)
    setAdjustmentType(type)
    setAdjustmentAmount(0)
    setIsAdjustDialogOpen(true)
    }
  

// export default function Inventory() {
//   const { items, updateItemInventory } = useData()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [sortField, setSortField] = useState<string>("name")
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
//   const [selectedItem, setSelectedItem] = useState<string | null>(null)
//   const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0)
//   const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
//   const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")

//   // تصفية العناصر حسب البحث
//   const filteredItems = items.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.category.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   // ترتيب العناصر
//   const sortedItems = [...filteredItems].sort((a, b) => {
//     let comparison = 0

//     switch (sortField) {
//       case "name":
//         comparison = a.name.localeCompare(b.name)
//         break
//       case "category":
//         comparison = a.category.localeCompare(b.category)
//         break
//       case "amount":
//         comparison = a.amount - b.amount
//         break
//       case "purchasePrice":
//         comparison = a.purchasePrice - b.purchasePrice
//         break
//       case "totalValue":
//         comparison = a.amount * a.purchasePrice - b.amount * b.purchasePrice
//         break
//       default:
//         comparison = 0
//     }

//     return sortDirection === "asc" ? comparison : -comparison
//   })

//   // تبديل اتجاه الترتيب
//   const toggleSort = (field: string) => {
//     if (field === sortField) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortField(field)
//       setSortDirection("asc")
//     }
//   }

//   // حساب إجمالي قيمة المخزون
//   const totalInventoryValue = items.reduce((sum, item) => sum + item.purchasePrice * item.amount, 0)

//   // تعديل المخزون
//   const handleAdjustInventory = () => {
//     if (!selectedItem || adjustmentAmount <= 0) return

//     const item = items.find((i) => i.id === selectedItem)
//     if (!item) return

//     const newAmount =
//       adjustmentType === "add" ? item.amount + adjustmentAmount : Math.max(0, item.amount - adjustmentAmount)

//     updateItemInventory(selectedItem, newAmount)
//     setIsAdjustDialogOpen(false)
//     setAdjustmentAmount(0)
//   }

//   // فتح نافذة تعديل المخزون
//   const openAdjustDialog = (itemId: string, type: "add" | "subtract") => {
//     setSelectedItem(itemId)
//     setAdjustmentType(type)
//     setAdjustmentAmount(0)
//     setIsAdjustDialogOpen(true)
//   }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            المخزون
          </CardTitle>
          <CardDescription>إدارة ومراقبة مخزون المنتجات</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المخزون..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-2">
              <span className="text-sm font-medium">إجمالي قيمة المخزون:</span>
              <span className="text-lg font-bold text-primary">{totalInventoryValue.toFixed(2)} ج.م</span>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("name")}>
                    <div className="flex items-center gap-1">
                      المنتج
                      {sortField === "name" && (
                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("category")}>
                    <div className="flex items-center gap-1">
                      الفئة
                      {sortField === "category" && (
                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("amount")}>
                    <div className="flex items-center gap-1">
                      الكمية
                      {sortField === "amount" && (
                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("purchasePrice")}>
                    <div className="flex items-center gap-1">
                      سعر الشراء
                      {sortField === "purchasePrice" && (
                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("totalValue")}>
                    <div className="flex items-center gap-1">
                      القيمة الإجمالية
                      {sortField === "totalValue" && (
                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>سعر البيع</TableHead>
                  <TableHead className="text-left">تعديل المخزون</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      لا توجد نتائج مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.amount > 0 ? "outline" : "destructive"}
                          className={item.amount > 0 ? "bg-green-100 text-green-800" : ""}
                        >
                          {item.amount} وحدة
                        </Badge>
                      </TableCell>
                      <TableCell>{item.purchasePrice.toFixed(2)} ج.م</TableCell>
                      <TableCell className="font-medium">{(item.purchasePrice * item.amount).toFixed(2)} ج.م</TableCell>
                      <TableCell>{item.price.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-left">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-green-50 hover:bg-green-100 text-green-600"
                            onClick={() => openAdjustDialog(item.id, "add")}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600"
                            onClick={() => openAdjustDialog(item.id, "subtract")}
                            disabled={item.amount <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>الإجمالي</TableCell>
                  <TableCell className="font-bold">{totalInventoryValue.toFixed(2)} ج.م</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{adjustmentType === "add" ? "إضافة للمخزون" : "خصم من المخزون"}</DialogTitle>
              <DialogDescription>
                {adjustmentType === "add"
                  ? "أدخل الكمية التي تريد إضافتها للمخزون"
                  : "أدخل الكمية التي تريد خصمها من المخزون"}
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{items.find((i) => i.id === selectedItem)?.name}</h3>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    المخزون الحالي: {items.find((i) => i.id === selectedItem)?.amount} وحدة
                  </Badge>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustment-amount">الكمية</Label>
                  <Input
                    id="adjustment-amount"
                    type="number"
                    min="1"
                    value={adjustmentAmount}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      setAdjustmentAmount(value)
                    }}
                  />
                </div>
                {adjustmentType === "add" && (
                  <div className="grid gap-2">
                    <Label htmlFor="adjustment-reason">سبب الإضافة</Label>
                    <Select defaultValue="purchase">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب الإضافة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">شراء جديد</SelectItem>
                        <SelectItem value="return">مرتجع</SelectItem>
                        <SelectItem value="correction">تصحيح خطأ</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {adjustmentType === "subtract" && (
                  <div className="grid gap-2">
                    <Label htmlFor="adjustment-reason">سبب الخصم</Label>
                    <Select defaultValue="damage">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب الخصم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damage">تالف</SelectItem>
                        <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                        <SelectItem value="correction">تصحيح خطأ</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm">
                    {adjustmentType === "add" ? (
                      <>
                        <span className="font-medium">إضافة للمخزون: </span>
                        <span className="text-green-600">{adjustmentAmount} وحدة</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">خصم من المخزون: </span>
                        <span className="text-red-600">{adjustmentAmount} وحدة</span>
                      </>
                    )}
                  </p>
                  {adjustmentAmount > 0 && selectedItem && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">التكلفة: </span>
                      <span className={adjustmentType === "add" ? "text-red-600" : "text-green-600"}>
                        {(adjustmentAmount * (items.find((i) => i.id === selectedItem)?.purchasePrice || 0)).toFixed(2)}{" "}
                        ج.م
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleAdjustInventory}>
                {adjustmentType === "add" ? "إضافة للمخزون" : "خصم من المخزون"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

