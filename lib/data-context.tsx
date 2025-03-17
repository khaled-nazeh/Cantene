"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type User = {
  id: string
  name: string
  department: string
}

export type Item = {
  id: string
  name: string
  purchasePrice: number // سعر الشراء
  price: number // سعر البيع
  category: string
  amount: number // كمية المخزون
}

export type Expense = {
  id: string
  name: string
  amount: number
  date: string
  category: string
}

export type Purchase = {
  id: string
  userId: string
  itemId: string
  quantity: number
  date: string
  total: number
}

export type CashTransaction = {
  id: string
  amount: number // المبلغ (موجب للإيداع، سالب للسحب)
  description: string
  date: string
  type: "deposit" | "withdrawal" // نوع المعاملة (إيداع أو سحب)
}

type DataContextType = {
  users: User[]
  items: Item[]
  purchases: Purchase[]
  expenses: Expense[]
  cashTransactions: CashTransaction[]
  cashBalance: number
  inventoryValue: number
  totalAssets: number
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, user: Omit<User, "id">) => void
  deleteUser: (id: string) => void
  addItem: (item: Omit<Item, "id">) => void
  updateItem: (id: string, item: Omit<Item, "id">) => void
  deleteItem: (id: string) => void
  updateItemInventory: (id: string, amount: number) => void
  addPurchase: (purchase: Omit<Purchase, "id" | "total">) => void
  deletePurchase: (id: string) => void
  addExpense: (expense: Omit<Expense, "id">) => void
  deleteExpense: (id: string) => void
  addCashTransaction: (transaction: Omit<CashTransaction, "id">) => void
  deleteCashTransaction: (id: string) => void
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// بيانات نموذجية
const sampleUsers: User[] = [
  { id: "user1", name: "أحمد محمد", department: "الإنتاج" },
  { id: "user2", name: "فاطمة علي", department: "الإدارة" },
  { id: "user3", name: "محمود خالد", department: "الصيانة" },
  { id: "user4", name: "سارة أحمد", department: "الموارد البشرية" },
]

const sampleExpenses: Expense[] = [
  {
    id: "exp1",
    name: "سكر",
    amount: 50.0,
    date: "2023-03-15",
    category: "مستلزمات",
  },
  {
    id: "exp2",
    name: "صابون",
    amount: 30.0,
    date: "2023-03-16",
    category: "نظافة",
  },
]

// تحديث العناصر النموذجية لتشمل كمية المخزون
const sampleItems: Item[] = [
  { id: "item1", name: "قهوة", purchasePrice: 10.0, price: 15.0, category: "مشروبات", amount: 20 },
  { id: "item2", name: "ساندويتش", purchasePrice: 25.0, price: 35.0, category: "طعام", amount: 15 },
  { id: "item3", name: "شيبسي", purchasePrice: 7.0, price: 10.0, category: "وجبات خفيفة", amount: 30 },
  { id: "item4", name: "مياه معدنية", purchasePrice: 3.0, price: 5.0, category: "مشروبات", amount: 50 },
]

const samplePurchases: Purchase[] = [
  {
    id: "p1",
    userId: "user1",
    itemId: "item1",
    quantity: 2,
    date: "2023-03-15",
    total: 30.0,
  },
  {
    id: "p2",
    userId: "user2",
    itemId: "item3",
    quantity: 1,
    date: "2023-03-15",
    total: 10.0,
  },
  {
    id: "p3",
    userId: "user3",
    itemId: "item2",
    quantity: 1,
    date: "2023-03-16",
    total: 35.0,
  },
]

// معاملات النقدية النموذجية
const sampleCashTransactions: CashTransaction[] = [
  {
    id: "cash1",
    amount: 1000.0,
    description: "رأس المال الأولي",
    date: "2023-03-01",
    type: "deposit",
  },
  {
    id: "cash2",
    amount: -200.0,
    description: "شراء مستلزمات",
    date: "2023-03-10",
    type: "withdrawal",
  },
]

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // حساب رصيد النقدية
  const cashBalance = cashTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  // حساب قيمة المخزون
  const inventoryValue = items.reduce((sum, item) => sum + item.purchasePrice * item.amount, 0)

  // حساب إجمالي الأصول (النقدية + المخزون)
  const totalAssets = cashBalance + inventoryValue

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        // تحميل البيانات من localStorage
        loadFromLocalStorage()
        setLoading(false)
      } catch (err) {
        console.error("خطأ في تحميل البيانات:", err)
        setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
        setLoading(false)
      }
    }

    function loadFromLocalStorage() {
      if (typeof window !== "undefined") {
        // تحميل المستخدمين
        const savedUsers = localStorage.getItem("cafeteria-users")
        setUsers(savedUsers ? JSON.parse(savedUsers) : sampleUsers)

        // تحميل المنتجات
        const savedItems = localStorage.getItem("cafeteria-items")
        setItems(savedItems ? JSON.parse(savedItems) : sampleItems)

        // تحميل المشتريات
        const savedPurchases = localStorage.getItem("cafeteria-purchases")
        setPurchases(savedPurchases ? JSON.parse(savedPurchases) : samplePurchases)

        // تحميل المصروفات
        const savedExpenses = localStorage.getItem("cafeteria-expenses")
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : sampleExpenses)

        // تحميل معاملات النقدية
        const savedCashTransactions = localStorage.getItem("cafeteria-cash")
        setCashTransactions(savedCashTransactions ? JSON.parse(savedCashTransactions) : sampleCashTransactions)
      } else {
        setUsers(sampleUsers)
        setItems(sampleItems)
        setPurchases(samplePurchases)
        setExpenses(sampleExpenses)
        setCashTransactions(sampleCashTransactions)
      }
    }

    loadData()
  }, [])

  // حفظ البيانات في localStorage عند تغييرها
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafeteria-users", JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafeteria-items", JSON.stringify(items))
    }
  }, [items])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafeteria-purchases", JSON.stringify(purchases))
    }
  }, [purchases])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafeteria-expenses", JSON.stringify(expenses))
    }
  }, [expenses])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafeteria-cash", JSON.stringify(cashTransactions))
    }
  }, [cashTransactions])

  // إضافة مستخدم جديد
  const addUser = (user: Omit<User, "id">) => {
    try {
      const newUser = { ...user, id: generateId() }
      setUsers([...users, newUser])
    } catch (err) {
      console.error("خطأ في إضافة المستخدم:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // تحديث مستخدم
  const updateUser = (id: string, user: Omit<User, "id">) => {
    try {
      setUsers(users.map((u) => (u.id === id ? { ...user, id } : u)))
    } catch (err) {
      console.error("خطأ في تحديث المستخدم:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // حذف مستخدم
  const deleteUser = (id: string) => {
    try {
      // التحقق مما إذا كان المستخدم لديه مشتريات
      const userPurchases = purchases.filter((p) => p.userId === id)
      if (userPurchases.length > 0) {
        throw new Error("لا يمكن حذف مستخدم لديه مشتريات. يرجى حذف مشترياته أولاً.")
      }

      setUsers(users.filter((user) => user.id !== id))
    } catch (err) {
      console.error("خطأ في حذف المستخدم:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
      throw err
    }
  }

  // إضافة مصروف جديد
  const addExpense = (expense: Omit<Expense, "id">) => {
    try {
      const newExpense = { ...expense, id: generateId() }
      setExpenses([...expenses, newExpense])

      // إضافة معاملة نقدية مقابلة
      addCashTransaction({
        amount: -expense.amount,
        description: `مصروف: ${expense.name}`,
        date: expense.date,
        type: "withdrawal",
      })
    } catch (err) {
      console.error("خطأ في إضافة المصروف:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // حذف مصروف
  const deleteExpense = (id: string) => {
    try {
      const expense = expenses.find((e) => e.id === id)
      if (expense) {
        setExpenses(expenses.filter((expense) => expense.id !== id))

        // إضافة معاملة نقدية مقابلة لإلغاء المصروف
        addCashTransaction({
          amount: expense.amount, // إعادة المبلغ (إيجابي)
          description: `إلغاء مصروف: ${expense.name}`,
          date: new Date().toISOString().split("T")[0],
          type: "deposit",
        })
      }
    } catch (err) {
      console.error("خطأ في حذف المصروف:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // إضافة منتج جديد
  const addItem = (item: Omit<Item, "id">) => {
    try {
      const newItem = { ...item, id: generateId() }
      setItems([...items, newItem])

      // إذا تم شراء مخزون جديد، أضف معاملة نقدية
      if (item.amount > 0) {
        const totalCost = item.amount * item.purchasePrice
        addCashTransaction({
          amount: -totalCost,
          description: `شراء مخزون: ${item.name} (${item.amount} وحدة)`,
          date: new Date().toISOString().split("T")[0],
          type: "withdrawal",
        })
      }
    } catch (err) {
      console.error("خطأ في إضافة المنتج:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // تحديث منتج
  const updateItem = (id: string, item: Omit<Item, "id">) => {
    try {
      const existingItem = items.find((i) => i.id === id)
      if (existingItem) {
        // إذا تغيرت كمية المخزون، أضف معاملة نقدية للفرق
        if (existingItem.amount !== item.amount) {
          const amountDifference = item.amount - existingItem.amount
          if (amountDifference !== 0) {
            const costDifference = amountDifference * item.purchasePrice
            addCashTransaction({
              amount: -costDifference,
              description: `تعديل مخزون: ${item.name} (${amountDifference > 0 ? "+" : ""}${amountDifference} وحدة)`,
              date: new Date().toISOString().split("T")[0],
              type: costDifference > 0 ? "withdrawal" : "deposit",
            })
          }
        }
      }

      setItems(items.map((i) => (i.id === id ? { ...item, id } : i)))
    } catch (err) {
      console.error("خطأ في تحديث المنتج:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // تحديث مخزون المنتج
  const updateItemInventory = (id: string, amount: number) => {
    try {
      const item = items.find((i) => i.id === id)
      if (!item) throw new Error("المنتج غير موجود")

      const amountDifference = amount - item.amount
      if (amountDifference !== 0) {
        const costDifference = amountDifference * item.purchasePrice

        // تحديث المخزون
        setItems(items.map((i) => (i.id === id ? { ...i, amount } : i)))

        // إضافة معاملة نقدية للفرق
        addCashTransaction({
          amount: -costDifference,
          description: `تعديل مخزون: ${item.name} (${amountDifference > 0 ? "+" : ""}${amountDifference} وحدة)`,
          date: new Date().toISOString().split("T")[0],
          type: costDifference > 0 ? "withdrawal" : "deposit",
        })
      }
    } catch (err) {
      console.error("خطأ في تحديث المخزون:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // حذف منتج
  const deleteItem = (id: string) => {
    try {
      // التحقق مما إذا كان المنتج لديه مشتريات
      const itemPurchases = purchases.filter((p) => p.itemId === id)
      if (itemPurchases.length > 0) {
        throw new Error("لا يمكن حذف منتج له مشتريات. يرجى حذف المشتريات أولاً.")
      }

      const item = items.find((i) => i.id === id)
      if (item && item.amount > 0) {
        // إضافة معاملة نقدية لاسترداد قيمة المخزون
        const inventoryValue = item.amount * item.purchasePrice
        addCashTransaction({
          amount: inventoryValue,
          description: `استرداد قيمة مخزون: ${item.name} (${item.amount} وحدة)`,
          date: new Date().toISOString().split("T")[0],
          type: "deposit",
        })
      }

      setItems(items.filter((item) => item.id !== id))
    } catch (err) {
      console.error("خطأ في حذف المنتج:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
      throw err
    }
  }

  // إضافة مشتراة جديدة
  const addPurchase = (purchase: Omit<Purchase, "id" | "total">) => {
    try {
      const item = items.find((i) => i.id === purchase.itemId)
      if (!item) throw new Error("المنتج غير موجود")

      // التحقق من توفر المخزون
      if (item.amount < purchase.quantity) {
        throw new Error(`المخزون غير كافٍ. المتوفر: ${item.amount} وحدة`)
      }

      const total = item.price * purchase.quantity
      const newPurchase = {
        ...purchase,
        id: generateId(),
        total,
      }

      // تحديث المخزون
      setItems(items.map((i) => (i.id === purchase.itemId ? { ...i, amount: i.amount - purchase.quantity } : i)))

      // إضافة المشتراة
      setPurchases([...purchases, newPurchase])

      // إضافة معاملة نقدية للمبيعات
      addCashTransaction({
        amount: total,
        description: `مبيعات: ${item.name} (${purchase.quantity} وحدة)`,
        date: purchase.date,
        type: "deposit",
      })
    } catch (err) {
      console.error("خطأ في إضافة المشتراة:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
      throw err
    }
  }

  // حذف مشتراة
  const deletePurchase = (id: string) => {
    try {
      const purchase = purchases.find((p) => p.id === id)
      if (!purchase) throw new Error("المشتراة غير موجودة")

      const item = items.find((i) => i.id === purchase.itemId)
      if (!item) throw new Error("المنتج غير موجود")

      // إعادة المخزون
      setItems(items.map((i) => (i.id === purchase.itemId ? { ...i, amount: i.amount + purchase.quantity } : i)))

      // حذف المشتراة
      setPurchases(purchases.filter((p) => p.id !== id))

      // إضافة معاملة نقدية لإلغاء المبيعات
      addCashTransaction({
        amount: -purchase.total,
        description: `إلغاء مبيعات: ${item.name} (${purchase.quantity} وحدة)`,
        date: new Date().toISOString().split("T")[0],
        type: "withdrawal",
      })
    } catch (err) {
      console.error("خطأ في حذف المشتراة:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // إضافة معاملة نقدية
  const addCashTransaction = (transaction: Omit<CashTransaction, "id">) => {
    try {
      const newTransaction = { ...transaction, id: generateId() }
      setCashTransactions([...cashTransactions, newTransaction])
    } catch (err) {
      console.error("خطأ في إضافة معاملة نقدية:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  // حذف معاملة نقدية
  const deleteCashTransaction = (id: string) => {
    try {
      setCashTransactions(cashTransactions.filter((t) => t.id !== id))
    } catch (err) {
      console.error("خطأ في حذف معاملة نقدية:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير معروف")
    }
  }

  return (
    <DataContext.Provider
      value={{
        users,
        items,
        purchases,
        expenses,
        cashTransactions,
        cashBalance,
        inventoryValue,
        totalAssets,
        addUser,
        updateUser,
        deleteUser,
        addItem,
        updateItem,
        deleteItem,
        updateItemInventory,
        addPurchase,
        deletePurchase,
        addExpense,
        deleteExpense,
        addCashTransaction,
        deleteCashTransaction,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("يجب استخدام useData داخل DataProvider")
  }
  return context
}

