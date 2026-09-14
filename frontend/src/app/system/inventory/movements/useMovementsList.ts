import { useEffect, useState } from "react"
import { toast as sonner } from "sonner"
import Papa from "papaparse"

export type Inventory = {
    inventory_id: number
    product_id: number
    product_name: string
    supplier_id: number | null
    supplier_name: string | null
    type: "Entrada de Stock" | "Salida de Stock" | "Ajuste de Stock"
    quantity: number
    date: string
    comment: string
    user_id: number
    user_name: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useMovementsList() {
    const [search, setSearch] = useState("")
    const [type, setType] = useState("All")
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [movements, setMovements] = useState<Inventory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/inventory/list`)
                const data: Inventory[] = await res.json()
                if (!Array.isArray(data)) {
                    sonner.error("Los movimientos de inventario no pudieron ser cargados")
                    setMovements([])
                } else {
                    setMovements(data)
                }
            } catch {
                sonner.error("Error al cargar movimientos de inventario")
            } finally {
                setLoading(false)
            }
        }

        fetchMovements()
    }, [])

    const filteredMovements = movements.filter((m) => {
        const searchMatch = (m.product_name ?? "").toLowerCase().includes(search.toLowerCase())
        const typeMatch = type === "All" || m.type === type
        const fromMatch = !from || m.date >= from
        const toMatch = !to || m.date <= to
        return searchMatch && typeMatch && fromMatch && toMatch
    })

    const totalPages = Math.ceil(filteredMovements.length / perPage)
    const visibleMovements = filteredMovements.slice((page - 1) * perPage, page * perPage)

    const counts = {
        Entry: filteredMovements.filter(m => m.type === "Entrada de Stock").length,
        Exit: filteredMovements.filter(m => m.type === "Salida de Stock").length,
        Adjustment: filteredMovements.filter(m => m.type === "Ajuste de Stock").length
    }

    const exportCSV = () => {
        try {
            const csv = Papa.unparse(filteredMovements, {
                columns: [
                    "product_name", "type", "quantity", "date", "user_name", "supplier_name", "comment"
                ]
            })
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", "inventory_movements.csv")
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            sonner.success("CSV exportado exitosamente")
        } catch {
            sonner.error("Fallo al exportar CSV")
        }
    }

    return {
        search,
        setSearch,
        type,
        setType,
        from,
        setFrom,
        to,
        setTo,
        page,
        setPage,
        perPage,
        setPerPage,
        movements: visibleMovements,
        filteredCount: filteredMovements.length,
        totalPages,
        loading,
        counts,
        exportCSV
    }
}