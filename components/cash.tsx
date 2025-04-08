"use client"

import { useState } from "react"
import { useData, type CashTransaction } from "@/lib/data-context"
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
import {
  Trash2,
  PlusCircle,
  Search,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  TrendingUp,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import axios from "axios"

export default function Cash() {
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([])
  const [cashBalance, setCashBalance] = useState(0)
  const [inventoryValue, setInventoryValue] = useState(0)
  const [totalAssets, setTotalAssets] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState<Omit<CashTransaction, "id">>({
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "deposit",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  // Fetch data from the backend
  useEffect(() => {
    axios.get("/api/cash")
      .then((response) => {
        setCashTransactions(response.data.cashTransactions)
        setCashBalance(response.data.cashBalance)
        setInventoryValue(response.data.inventoryValue)
        setTotalAssets(response.data.totalAssets)
      })
      .catch((error) => console.error("Error fetching data:", error))
  }, [])

  const handleAddTransaction = () => {
    if (newTransaction.description && newTransaction.amount !== 0) {
      const amount =
        newTransaction.type === "deposit"
          ? Math.abs(Number(newTransaction.amount))
          : -Math.abs(Number(newTransaction.amount))

      axios.post("/api/cash", { ...newTransaction, amount })
        .then((response) => {
          setCashTransactions([...cashTransactions, response.data])
          setCashBalance(prev => prev + amount)
          setTotalAssets(prev => prev + amount)
          setIsAddDialogOpen(false)
          setNewTransaction({
            amount: 0,
            description: "",
            date: new Date().toISOString().split("T")[0],
            type: "deposit",
          })
        })
        .catch((error) => console.error("Error adding transaction:", error))
    } else {
      alert("Please fill in all fields correctly.")
    }
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المعاملة؟")) {
      axios.delete(`/api/cash/${id}`)
        .then(() => {
          const updatedTransactions = cashTransactions.filter((t) => t.id !== id)
          setCashTransactions(updatedTransactions)
          setCashBalance(updatedTransactions.reduce((sum, t) => sum + t.amount, 0))
          setTotalAssets(cashBalance + inventoryValue)
        })
        .catch((error) => console.error("Error deleting transaction:", error))
    }
  }

  // Filter transactions based on search and type filter
  const filteredTransactions = cashTransactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm)

      const matchesType = typeFilter ? transaction.type === typeFilter : true

      return matchesSearch && matchesType
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
// export default function Cash() {
//   const { cashTransactions, cashBalance, inventoryValue, totalAssets, addCashTransaction, deleteCashTransaction } =
//     useData()
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [newTransaction, setNewTransaction] = useState<Omit<CashTransaction, "id">>({
//     amount: 0,
//     description: "",
//     date: new Date().toISOString().split("T")[0],
//     type: "deposit",
//   })
//   const [searchTerm, setSearchTerm] = useState("")
//   const [typeFilter, setTypeFilter] = useState<string | null>(null)

//   const handleAddTransaction = () => {
//     if (newTransaction.description && newTransaction.amount !== 0) {
//       try {
//         // Asegurarse de que el monto sea un número válido
//         const amount =
//           newTransaction.type === "deposit"
//             ? Math.abs(Number(newTransaction.amount))
//             : -Math.abs(Number(newTransaction.amount))

//         addCashTransaction({
//           ...newTransaction,
//           amount,
//         })

//         setNewTransaction({
//           amount: 0,
//           description: "",
//           date: new Date().toISOString().split("T")[0],
//           type: "deposit",
//         })

//         setIsAddDialogOpen(false)
//       } catch (err) {
//         console.error("Error al añadir transacción:", err)
//       }
//     } else {
//       alert("Por favor, complete todos los campos correctamente")
//     }
//   }

//   const handleDeleteTransaction = (id: string) => {
//     if (confirm("هل أنت متأكد من رغبتك في حذف هذه المعاملة؟")) {
//       deleteCashTransaction(id)
//     }
//   }

//   // تصفية المعاملات
//   const filteredTransactions = cashTransactions
//     .filter((transaction) => {
//       const matchesSearch =
//         transaction.description.includes(searchTerm) || transaction.amount.toString().includes(searchTerm)

//       const matchesType = typeFilter ? transaction.type === typeFilter : true

//       return matchesSearch && matchesType
//     })
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>النقدية والأصول</CardTitle>
          <CardDescription>إدارة النقدية ومراقبة الأصول</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mr-auto">
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة معاملة نقدية
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة معاملة نقدية</DialogTitle>
              <DialogDescription>تسجيل إيداع أو سحب نقدي</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">نوع المعاملة</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: "deposit" | "withdrawal") =>
                    setNewTransaction({ ...newTransaction, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">إيداع</SelectItem>
                    <SelectItem value="withdrawal">سحب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">المبلغ (ج.م)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={Math.abs(newTransaction.amount)}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    setNewTransaction({ ...newTransaction, amount: value })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTransaction}>إضافة معاملة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  رصيد النقدية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{cashBalance.toFixed(2)} ج.م</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  قيمة المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{inventoryValue.toFixed(2)} ج.م</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  إجمالي الأصول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">{totalAssets.toFixed(2)} ج.م</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المعاملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="جميع المعاملات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المعاملات</SelectItem>
                <SelectItem value="deposit">إيداعات</SelectItem>
                <SelectItem value="withdrawal">مسحوبات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      لا توجد نتائج مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {transaction.date}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === "deposit"
                              ? "bg-green-100 text-green-800 flex items-center gap-1"
                              : "bg-red-100 text-red-800 flex items-center gap-1"
                          }
                        >
                          {transaction.type === "deposit" ? (
                            <>
                              <ArrowUpRight className="h-3 w-3" />
                              إيداع
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="h-3 w-3" />
                              سحب
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={transaction.amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>الإجمالي</TableCell>
                  <TableCell className="font-bold">{cashBalance.toFixed(2)} ج.م</TableCell>
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

