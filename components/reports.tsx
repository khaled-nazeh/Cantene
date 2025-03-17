"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Printer, FileText, User, DollarSign, TrendingUp, ArrowDownUp } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Reports() {
  const { users, items, purchases, expenses } = useData()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  function getCurrentMonth() {
    return new Date().getMonth() + 1
  }

  function getCurrentYear() {
    return new Date().getFullYear()
  }

  // إنشاء مصفوفة الأشهر
  const months = [
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ]

  // إنشاء مصفوفة السنوات (السنة الحالية و5 سنوات سابقة)
  const currentYear = getCurrentYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  // تصفية المشتريات للشهر والسنة المحددين
  const filteredPurchases = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date)
    return purchaseDate.getMonth() + 1 === selectedMonth && purchaseDate.getFullYear() === selectedYear
  })

  // تصفية المصروفات للشهر والسنة المحددين
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear
  })

  // حساب إجماليات المستخدم للشهر
  const userTotals = users
    .map((user) => {
      const userPurchases = filteredPurchases.filter((p) => p.userId === user.id)
      const totalSpent = userPurchases.reduce((sum, p) => sum + p.total, 0)

      // الحصول على تفاصيل المنتجات
      const itemBreakdown = items
        .map((item) => {
          const itemPurchases = userPurchases.filter((p) => p.itemId === item.id)
          const itemTotal = itemPurchases.reduce((sum, p) => sum + p.total, 0)
          const itemQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)

          return {
            itemId: item.id,
            itemName: item.name,
            quantity: itemQuantity,
            total: itemTotal,
          }
        })
        .filter((item) => item.quantity > 0)

      return {
        userId: user.id,
        userName: user.name,
        department: user.department,
        totalSpent,
        itemBreakdown,
      }
    })
    .filter((user) => user.totalSpent > 0)

  // حساب المجموع الكلي للمبيعات
  const totalSales = userTotals.reduce((sum, user) => sum + user.totalSpent, 0)

  // حساب إجمالي المصروفات
  const totalExpensesAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // حساب الأرباح
  const itemProfits = items
    .map((item) => {
      const itemPurchases = filteredPurchases.filter((p) => p.itemId === item.id)
      const soldQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)
      const revenue = itemPurchases.reduce((sum, p) => sum + p.total, 0)
      const cost = soldQuantity * item.purchasePrice
      const profit = revenue - cost

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        soldQuantity,
        revenue,
        cost,
        profit,
        profitMargin: cost > 0 ? (profit / cost) * 100 : 0,
      }
    })
    .filter((item) => item.soldQuantity > 0)

  // حساب إجمالي الأرباح
  const totalProfit = itemProfits.reduce((sum, item) => sum + item.profit, 0)

  // حساب صافي الربح (بعد خصم المصروفات)
  const netProfit = totalProfit - totalExpensesAmount

  // معالجة طباعة التقرير
  const handlePrintReport = () => {
    window.print()
  }

  // معالجة التصدير إلى CSV
  const handleExportCSV = () => {
    // إنشاء محتوى CSV
    let csvContent = "المستخدم,القسم,المبلغ الإجمالي\n"

    userTotals.forEach((user) => {
      csvContent += `${user.userName},${user.department},${user.totalSpent.toFixed(2)} ج.م\n`
    })

    // إنشاء رابط التنزيل
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `تقرير-الكافتيريا-${selectedYear}-${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      <CardHeader>
        <CardTitle>التقارير الشهرية</CardTitle>
        <CardDescription>عرض وتصدير تقارير الإنفاق والأرباح الشهرية للكافتيريا</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid gap-2">
              <Label htmlFor="month">الشهر</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">السنة</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 mr-auto">
              <Button variant="outline" onClick={handlePrintReport} className="flex gap-2">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="flex gap-2">
                <Download className="h-4 w-4" />
                تصدير CSV
              </Button>
            </div>
          </div>

          <div className="print:block" id="report-content">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">
                  تقرير الكافتيريا - {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </h2>
              </div>
              <div className="text-muted-foreground text-sm">
                تاريخ التقرير: {new Date().toLocaleDateString("ar-EG")}
              </div>
            </div>

            {filteredPurchases.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">لم يتم العثور على مشتريات</h3>
                <p className="text-muted-foreground">لم يتم العثور على مشتريات لهذه الفترة</p>
              </div>
            ) : (
              <>
                {/* ملخص الأرباح */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      ملخص الأرباح
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1">إجمالي المبيعات</div>
                        <div className="text-2xl font-bold">{totalSales.toFixed(2)} ج.م</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-red-600 mb-1">إجمالي المصروفات</div>
                        <div className="text-2xl font-bold">{totalExpensesAmount.toFixed(2)} ج.م</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">إجمالي الربح</div>
                        <div className="text-2xl font-bold">{totalProfit.toFixed(2)} ج.م</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 mb-1">صافي الربح</div>
                        <div className="text-2xl font-bold">{netProfit.toFixed(2)} ج.م</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="users" className="mb-8">
                  <TabsList className="mb-4">
                    <TabsTrigger value="users">المستخدمين</TabsTrigger>
                    <TabsTrigger value="items">المنتجات</TabsTrigger>
                    <TabsTrigger value="expenses">المصروفات</TabsTrigger>
                  </TabsList>

                  <TabsContent value="users">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          ملخص المستخدمين
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>المستخدم</TableHead>
                                <TableHead>القسم</TableHead>
                                <TableHead className="text-left">المبلغ الإجمالي</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userTotals.map((user) => (
                                <TableRow key={user.userId}>
                                  <TableCell>
                                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                      <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                                    </Avatar>
                                  </TableCell>
                                  <TableCell className="font-medium">{user.userName}</TableCell>
                                  <TableCell>{user.department}</TableCell>
                                  <TableCell className="text-left font-medium">
                                    {user.totalSpent.toFixed(2)} ج.م
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={3} className="font-bold">
                                  المجموع الكلي
                                </TableCell>
                                <TableCell className="text-left font-bold">{totalSales.toFixed(2)} ج.م</TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="items">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ArrowDownUp className="h-5 w-5 text-primary" />
                          تحليل أرباح المنتجات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>المنتج</TableHead>
                                <TableHead>الفئة</TableHead>
                                <TableHead>الكمية المباعة</TableHead>
                                <TableHead>الإيرادات</TableHead>
                                <TableHead>التكلفة</TableHead>
                                <TableHead>الربح</TableHead>
                                <TableHead>هامش الربح</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {itemProfits.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell>{item.soldQuantity}</TableCell>
                                  <TableCell>{item.revenue.toFixed(2)} ج.م</TableCell>
                                  <TableCell>{item.cost.toFixed(2)} ج.م</TableCell>
                                  <TableCell className={item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                                    {item.profit.toFixed(2)} ج.م
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                      {item.profitMargin.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter>
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={4} className="font-bold">
                                  المجموع الكلي
                                </TableCell>
                                <TableCell className="font-bold">
                                  {itemProfits.reduce((sum, item) => sum + item.cost, 0).toFixed(2)} ج.م
                                </TableCell>
                                <TableCell className="font-bold">{totalProfit.toFixed(2)} ج.م</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="expenses">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          المصروفات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {filteredExpenses.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            لا توجد مصروفات مسجلة لهذه الفترة
                          </div>
                        ) : (
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>التاريخ</TableHead>
                                  <TableHead>الاسم</TableHead>
                                  <TableHead>الفئة</TableHead>
                                  <TableHead>المبلغ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredExpenses.map((expense) => (
                                  <TableRow key={expense.id}>
                                    <TableCell>{expense.date}</TableCell>
                                    <TableCell className="font-medium">{expense.name}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{expense.amount.toFixed(2)} ج.م</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow className="bg-muted/30">
                                  <TableCell colSpan={3} className="font-bold">
                                    المجموع الكلي
                                  </TableCell>
                                  <TableCell className="font-bold">{totalExpensesAmount.toFixed(2)} ج.م</TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      تفاصيل المشتريات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {userTotals.map((user) => (
                        <div key={user.userId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                              <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{user.userName}</h4>
                              <p className="text-sm text-muted-foreground">{user.department}</p>
                            </div>
                            <div className="mr-auto font-bold">{user.totalSpent.toFixed(2)} ج.م</div>
                          </div>
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المنتج</TableHead>
                                  <TableHead>الكمية</TableHead>
                                  <TableHead className="text-left">المبلغ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {user.itemBreakdown.map((item) => (
                                  <TableRow key={item.itemId}>
                                    <TableCell>{item.itemName}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-left">{item.total.toFixed(2)} ج.م</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

