import { useState, useCallback } from 'react'

interface RepairSummaryItem {
  date: string
  total_repairs: number
  total_profit: number
}

interface RepairDailySummaryItem {
  repair_id: number
  repair_date: string
  repair_time: string
  technician_name: string
  customer_name: string
  model: string
  description: string
  observations: string
  total_price: number
  spare_part_cost: number
  total_profit: number
}

type ReportData = RepairSummaryItem[] | RepairDailySummaryItem[]

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export const useRepairsReport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReportRaw = useCallback(
    async (from: string, to: string, type: 'day' | 'month' | 'year'): Promise<ReportData> => {
      setLoading(true)
      setError(null)
      try {
        const endpoint = `${apiUrl}/api/reports/repairs-report`
        const res = await fetch(`${endpoint}?from=${from}&to=${to}&type=${type}`)
        if (!res.ok) {
          throw new Error('Error al obtener el reporte')
        }
        const data = await res.json()
        return data
      } catch (err) {
        console.error('Error fetching repairs report:', err)
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