"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Coffee, Users, ShoppingBag, CreditCard, TrendingUp, DollarSign, Package, Wallet } from "lucide-react"

export default function Dashboard() {
  const { users, items, purchases, expenses, cashBalance, inventoryValue, totalAssets } = useData()

  // حساب إجمالي المبيعات
  const totalSales = purchases.reduce((sum, purchase) => sum + purchase.total, 0)

  // الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]

  // حساب مبيعات اليوم
  const todaySales = purchases
    .filter((purchase) => purchase.date === today)
    .reduce((sum, purchase) => sum + purchase.total, 0)

  // حساب إجمالي المصروفات
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // حساب الأرباح
  const itemProfits = items.map((item) => {
    const itemPurchases = purchases.filter((p) => p.itemId === item.id)
    const soldQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)
    const revenue = itemPurchases.reduce((sum, p) => sum + p.total, 0)
    const cost = soldQuantity * item.purchasePrice
    const profit = revenue - cost

    return {
      id: item.id,
      name: item.name,
      soldQuantity,
      revenue,
      cost,
      profit,
    }
  })

  // حساب إجمالي الأرباح
  const totalProfit = itemProfits.reduce((sum, item) => sum + item.profit, 0)

  // حساب صافي الربح (بعد خصم المصروفات)
  const netProfit = totalProfit - totalExpenses

  // الحصول على أكثر المنتجات مبيعًا
  const itemSales = items
    .map((item) => {
      const itemPurchases = purchases.filter((p) => p.itemId === item.id)
      const totalQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)
      const totalRevenue = itemPurchases.reduce((sum, p) => sum + p.total, 0)
      return {
        id: item.id,
        name: item.name,
        quantity: totalQuantity,
        revenue: totalRevenue,
      }
    })
    .sort((a, b) => b.quantity - a.quantity)

  // إعداد البيانات للرسم البياني
  const chartData = items
    .map((item) => {
      const itemPurchases = purchases.filter((p) => p.itemId === item.id)
      return {
        name: item.name,
        value: itemPurchases.reduce((sum, p) => sum + p.quantity, 0),
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // ألوان للرسم البياني
  const COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]

  // تجميع المشتريات حسب الفئة
  const categoryData = items.reduce(
    (acc, item) => {
      const itemPurchases = purchases.filter((p) => p.itemId === item.id)
      const totalRevenue = itemPurchases.reduce((sum, p) => sum + p.total, 0)

      if (!acc[item.category]) {
        acc[item.category] = 0
      }
      acc[item.category] += totalRevenue
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }))

  // إعداد بيانات الأرباح للرسم البياني
  const profitChartData = itemProfits
    .filter((item) => item.profit !== 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      profit: item.profit,
    }))

  // إعداد بيانات المخزون للرسم البياني
  const inventoryChartData = items
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount * b.purchasePrice - a.amount * a.purchasePrice)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      value: item.amount * item.purchasePrice,
    }))

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">مستخدم مسجل في النظام</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Coffee className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">منتج متاح في الكافتيريا</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات اليوم</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي مبيعات اليوم</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي المبيعات الكلية</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalProfit.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">الربح من المبيعات</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">المصروفات الإضافية</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inventoryValue.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">قيمة المنتجات في المخزون</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalAssets.toFixed(2)} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">النقدية + قيمة المخزون</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>أكثر المنتجات مبيعًا</CardTitle>
            <CardDescription>المنتجات ذات أعلى حجم مبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "الكمية المباعة",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>توزيع المبيعات حسب الفئة</CardTitle>
            <CardDescription>نسبة المبيعات لكل فئة من المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} ج.م`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>أعلى المنتجات ربحًا</CardTitle>
            <CardDescription>المنتجات التي تحقق أعلى ربح</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                profit: {
                  label: "الربح (ج.م)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>أعلى المنتجات في المخزون</CardTitle>
            <CardDescription>المنتجات ذات أعلى قيمة في المخزون</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "القيمة (ج.م)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>أحدث المشتريات في الكافتيريا</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد مشتريات مسجلة بعد</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {purchases
                  .slice(-6)
                  .reverse()
                  .map((purchase) => {
                    const user = users.find((u) => u.id === purchase.userId)
                    const item = items.find((i) => i.id === purchase.itemId)
                    return (
                      <div key={purchase.id} className="bg-muted/30 p-4 rounded-lg">
                        <div className="font-medium">{user?.name || "مستخدم غير معروف"}</div>
                        <div className="text-sm text-muted-foreground">
                          اشترى {purchase.quantity}x {item?.name || "منتج غير معروف"}
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                          <span>{purchase.date}</span>
                          <span className="font-medium">{purchase.total.toFixed(2)} ج.م</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

