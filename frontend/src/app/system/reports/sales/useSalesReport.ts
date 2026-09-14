import { useState, useCallback } from 'react'

interface SalesSummaryItem {
  date: string
  total_sales: number
  total_profit: number
}

interface SalesDetailedItem {
  sale_id: number
  seller_name: string
  sale_date: string
  total_sale: number
  total_profit: number
  products: {
    product_name: string
    category_name: string
    quantity: number
    unit_price: number
    cost: number
    profit: number
  }[]
}

interface SalesDailySummaryItem {
  sale_id: number
  sale_date: string
  sale_time: string
  seller_name: string
  total_sale: number
  total_profit: number
}

type ReportData = SalesSummaryItem[] | SalesDetailedItem[] | SalesDailySummaryItem[]

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export const useSalesReport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReportRaw = useCallback(
    async (from: string, to: string, type: 'day' | 'month' | 'year', detailed: boolean): Promise<ReportData> => {
      setLoading(true)
      setError(null)
      try {
        const endpoint = `${apiUrl}/api/reports/sales-report`
        const res = await fetch(`${endpoint}?from=${from}&to=${to}&type=${type}&detailed=${detailed}`)
        if (!res.ok) {
          throw new Error('Error al obtener el reporte')
        }
        const data = await res.json()
        return data
      } catch (err) {
        console.error('Error fetching sales report:', err)
        setError('Error al generar el reporte.')
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, error, fetchReportRaw }
}
