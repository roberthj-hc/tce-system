import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast as sonner } from "sonner"

export type Customer = {
    customer_id: number
    name: string
    ci: string
    email: string
    phone: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useCustomerList() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/customers/list`)
                const data: Customer[] = await res.json()
                if (!Array.isArray(data)) {
                    sonner.error("Error al obtener clientes")
                    setCustomers([])
                } else {
                    setCustomers(data)
                }
            } catch {
                sonner.error("Error del servidor al obtener clientes")
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [])

    const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.ci.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / perPage)
    const visible = filtered.slice((page - 1) * perPage, page * perPage)

    const handleEdit = (customer: Customer) => {
        router.push(`/system/customers/register?edit=1&id=${customer.customer_id}`)
    }

    const deleteCustomer = async (id: number) => {
        if (!confirm("¿Realmente quieres eliminar a este cliente?")) return

        try {
            const res = await fetch(`${apiUrl}/api/customers/delete/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setCustomers(prev => prev.filter(c => c.customer_id !== id))
                sonner.success("Cliente eliminado exitosamente")
            } else {
                const data = await res.json()
                sonner.error(data?.error || "Error al eliminar cliente")
            }
        } catch {
            sonner.error("Error del servidor al eliminar cliente")
        }
    }

    return {
        search,
        setSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        customers: visible,
        totalPages,
        loading,
        handleEdit,
        deleteCustomer,
        filteredCount: filtered.length
    }
}
