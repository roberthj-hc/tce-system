import { useEffect, useState } from "react"
import { toast as sonner } from "sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export type Summary = {
  salesToday: number
  lowStockAlerts: number
  profitToday: number
  topProducts: { name: string; sales: number }[]
}

export type CategorySalesItem = {
  category: string
  sales: number
}

export type WeeklySalesItem = {
  day: string
  sales: number
}

export type StockItem = {
  name: string
  stock: number
}

export type TopSellingItem = {
  name: string
  sales: number
}

export function useDashboard() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary>({
    salesToday: 0,
    lowStockAlerts: 0,
    profitToday: 0,
    topProducts: []
  })
  const [exchangeRate, setExchangeRate] = useState<{ price: number; date: string } | null>(null)

  const [categorySales, setCategorySales] = useState<CategorySalesItem[]>([])
  const [weeklySales, setWeeklySales] = useState<WeeklySalesItem[]>([])
  const [totalStock, setTotalStock] = useState<StockItem[]>([])
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([])
  const [lowestStock, setLowestStock] = useState<StockItem[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/dashboard`)
        const data = await response.json()

        if (!data || typeof data !== "object") {
          throw new Error("Invalid dashboard response")
        }

        setSummary(data.summary)
        setExchangeRate(data.exchangeRate ?? null)
        setCategorySales(data.categorySales)
        setWeeklySales(data.weeklySales)
        setTotalStock(data.totalStock)
        setTopSelling(data.topSelling)

        const sortedStock = [...data.totalStock]
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 10)
        setLowestStock(sortedStock)

      } catch (error: any) {
        sonner.error("Error loading dashboard data")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return {
    loading,
    exchangeRate,
    summary,
    categorySales,
    weeklySales,
    totalStock,
    topSelling,
    lowestStock
  }
}