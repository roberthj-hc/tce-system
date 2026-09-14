"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export type Sale = {
  sale_id: number
  sale_date: string
  customer_id: number
  customer_name: string
  seller_id: number
  seller_name: string
  total_sale: number
}

export type Vendor = {
  id: number
  name: string
}

export type SaleDetail = {
  sale_details_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useSalesHistory() {
  const [vendor, setVendor] = useState("Todos")
  const [vendors, setVendors] = useState<string[]>(["Todos"])
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [detailsMap, setDetailsMap] = useState<Record<number, SaleDetail[]>>({})
  const [detailsLoading, setDetailsLoading] = useState<number | null>(null)

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA")
    setFromDate(today)
    setToDate(today)
  }, [])

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/users/sellers`)
        if (!res.ok) throw new Error("Fallo al obtener vendedores")
        const data: Vendor[] = await res.json()
        const names = data.map((v) => v.name)
        setVendors(["Todos", ...names])
      } catch (error) {
        console.error("Error al cargar vendedores:", error)
        toast.error("No se pudieron cargar los vendedores")
      }
    }

    fetchVendors()
  }, [])

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      setError("")

      try {
        const params = new URLSearchParams()
        if (fromDate) params.append("from", fromDate)
        if (toDate) params.append("to", toDate)
        if (vendor !== "Todos") params.append("seller", vendor)

        const res = await fetch(`${apiUrl}/api/sales/list?${params.toString()}`)
        if (!res.ok) throw new Error("Fallo al obtener ventas")
        const data: Sale[] = await res.json()
        setSales(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error al obtener ventas:", err)
        setError("Fallo al obtener ventas")
        toast.error("No se pudieron cargar los datos de ventas")
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [vendor, fromDate, toDate])

  const totalPages = Math.ceil(sales.length / perPage)
  const paginatedSales = sales.slice((page - 1) * perPage, page * perPage)

  const today = new Date().toLocaleDateString("en-CA")
  const currentMonth = today.slice(0, 7)

  const summary = {
    total: sales.reduce((sum, sale) => sum + Number(sale.total_sale || 0), 0),

    today: sales
      .filter((sale) => {
        const saleDate = new Date(sale.sale_date).toLocaleDateString("en-CA")
        return saleDate === today
      })
      .reduce((sum, sale) => sum + Number(sale.total_sale || 0), 0),

    month: sales
      .filter((sale) => {
        const saleDate = new Date(sale.sale_date).toLocaleDateString("en-CA")
        return saleDate.startsWith(currentMonth)
      })
      .reduce((sum, sale) => sum + Number(sale.total_sale || 0), 0),

    count: sales.length,
  }

  const getSaleDetails = async (saleId: number) => {
    if (detailsMap[saleId]) return

    setDetailsLoading(saleId)
    try {
      const res = await fetch(`${apiUrl}/api/sales/details/${saleId}`)
      if (!res.ok) throw new Error("Error al obtener detalles de venta")
      const data: SaleDetail[] = await res.json()
      setDetailsMap((prev) => ({ ...prev, [saleId]: data }))
    } catch (err) {
      toast.error("No se pudieron cargar los detalles de venta")
    } finally {
      setDetailsLoading(null)
    }
  }

  useEffect(() => {
    const preloadDetails = async () => {
      for (const sale of sales) {
        if (!detailsMap[sale.sale_id]) {
          await getSaleDetails(sale.sale_id)
        }
      }
    }
    if (sales.length > 0) {
      preloadDetails()
    }
  }, [sales])

  return {
    vendor,
    setVendor,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    page,
    setPage,
    perPage,
    setPerPage,
    vendors,
    filteredSales: paginatedSales,
    summary,
    totalPages,
    loading,
    error,
    getSaleDetails,
    detailsMap,
    detailsLoading,
  }
}