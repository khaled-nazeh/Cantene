"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import Users from "@/components/users"
import Items from "@/components/items"
import Purchases from "@/components/purchases"
import Reports from "@/components/reports"
import Expenses from "@/components/expenses"
import Cash from "@/components/cash"
import { Coffee, UsersIcon, ShoppingBag, Receipt, BarChart3, DollarSign, Wallet, Package, Lock } from "lucide-react"
import { useData } from "@/lib/data-context"
import LoadingSpinner from "@/components/loading-spinner"
import Inventory from "@/components/inventory"
import { useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { loading, error } = useData()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [authenticatedTabs, setAuthenticatedTabs] = useState<Record<string, boolean>>({
    purchases: true, // La pestaña de compras está desbloqueada por defecto
  })
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState(false)

  const handleTabAuth = (tabValue: string) => {
    if (passwordInput === "P@ssw0rd") {
      setAuthenticatedTabs((prev) => ({ ...prev, [tabValue]: true }))
      setPasswordInput("")
      setPasswordError(false)
      return true
    }

    setPasswordError(true)
    return false
  }

  const handleTabClick = (tabValue: string) => {
    if (tabValue === "purchases" || authenticatedTabs[tabValue]) {
      setActiveTab(tabValue)
    } else {
      setActiveTab(tabValue)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="py-6 px-4 md:px-6 glass-effect sticky top-0 z-10 border-b shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center ">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">نظام إداره كانتين MMC</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 gap-2 mb-8 p-1 rounded-xl bg-muted/50">
            {["dashboard", "users", "items", "inventory", "purchases", "expenses", "cash", "reports"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-white rounded-lg py-3 flex gap-2 items-center justify-center"
              >
                {tab === "dashboard" && <BarChart3 className="h-4 w-4" />}
                {tab === "users" && <UsersIcon className="h-4 w-4" />}
                {tab === "items" && <Coffee className="h-4 w-4" />}
                {tab === "inventory" && <Package className="h-4 w-4" />}
                {tab === "purchases" && <ShoppingBag className="h-4 w-4" />}
                {tab === "expenses" && <DollarSign className="h-4 w-4" />}
                {tab === "cash" && <Wallet className="h-4 w-4" />}
                {tab === "reports" && <Receipt className="h-4 w-4" />}
                <span className="hidden md:inline">
                  {tab === "dashboard" && "لوحة التحكم"}
                  {tab === "users" && "المستخدمين"}
                  {tab === "items" && "المنتجات"}
                  {tab === "inventory" && "المخزون"}
                  {tab === "purchases" && "المشتريات"}
                  {tab === "expenses" && "المصروفات"}
                  {tab === "cash" && "النقدية"}
                  {tab === "reports" && "التقارير"}
                </span>
                {tab !== "purchases" && !authenticatedTabs[tab] && (
                  <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4">
            {["dashboard", "users", "items", "inventory", "purchases", "expenses", "cash", "reports"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {tab === "purchases" || authenticatedTabs[tab] ? (
                  <>
                    {tab === "dashboard" && <Dashboard />}
                    {tab === "users" && <Users />}
                    {tab === "items" && <Items />}
                    {tab === "inventory" && <Inventory />}
                    {tab === "purchases" && <Purchases />}
                    {tab === "expenses" && <Expenses />}
                    {tab === "cash" && <Cash />}
                    {tab === "reports" && <Reports />}
                  </>
                ) : (
                  <Card className="p-6">
                    <div className="text-center mb-6">
                      <Lock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <CardTitle className="mb-2">هذه الصفحة محمية بكلمة مرور</CardTitle>
                      <p className="text-muted-foreground">يرجى إدخال كلمة المرور للوصول إلى هذه الصفحة</p>
                    </div>
                    <div className="max-w-sm mx-auto space-y-4">
                      <Input
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className={passwordError ? "border-red-500" : ""}
                      />
                      {passwordError && <p className="text-red-500 text-sm">كلمة المرور غير صحيحة</p>}
                      <Button onClick={() => handleTabAuth(tab)} className="w-full">
                        تأكيد
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>

      <footer className="container mx-auto mt-auto py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} تم التطوير بواسطة مركز التأمين الفني MMC جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}

