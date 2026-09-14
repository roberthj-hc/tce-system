"use client"

import {
    Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card"
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { toast as sonner } from "sonner"
import { notify } from "@/lib/notify"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type Supplier = {
    supplier_id: number
    name: string
    contact_name: string
    phone: string
    email: string
    address: string
    active: boolean
}

function highlight(text: string | null | undefined, query: string) {
    if (!text) return ""
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1 || !query) return text

    const start = text.slice(0, index)
    const match = text.slice(index, index + query.length)
    const end = text.slice(index + query.length)

    return (
        <>
            {start}
            <span className="text-green-600 font-semibold">{match}</span>
            {end}
        </>
    )
}

type Props = {
    search: string
    onEdit: (supplier: Supplier) => void
    refresh?: boolean
}

function SupplierList({ search, onEdit, refresh }: Props) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [perPage, setPerPage] = useState(10)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");

    useEffect(() => {
        async function fetchSuppliers() {
            setLoading(true)
            try {
                const res = await fetch(`${apiUrl}/api/suppliers/list?status=${statusFilter}`);
                const data = await res.json();
                setSuppliers(Array.isArray(data) ? data : []);
                if (res.ok) {
                    setSuppliers(data)
                } else {
                    sonner.error("Fallo al cargar proveedores")
                }
            } catch {
                sonner.error("Error del servidor")
            } finally {
                setLoading(false)
            }
        }
        fetchSuppliers()
    }, [refresh, statusFilter])

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${apiUrl}/api/suppliers/delete/${id}`, { method: "DELETE" })
            if (res.ok) {
                notify({
                    type: "warning",
                    title: "Proveedor eliminado",
                    description: `Se eliminó el proveedor: ${id}`,
                    roleId: 2,
                    persist: true
                })
                setSuppliers(prev => prev.filter(s => s.supplier_id !== id))
            } else {
                sonner.error("Fallo al eliminar proveedor")
            }
        } catch {
            sonner.error("Error del servidor")
        }
    }

    const filtered = suppliers.filter(s =>
        Object.values(s).some(val =>
            typeof val === "string" &&
            val.toLowerCase().includes(search.toLowerCase())
        )
    )

    const totalPages = Math.ceil(filtered.length / perPage)
    const visible = filtered.slice((page - 1) * perPage, page * perPage)

    if (loading) return <p className="text-center mt-10 text-muted-foreground">Cargando proveedores...</p>

    return (
        <Card className="p-6 shadow-none">
            <Select onValueChange={(value: "active" | "inactive" | "all") => setStatusFilter(value)}>
                <SelectTrigger className="w-max">
                    {statusFilter === "all"
                        ? "Todos los Estados"
                        : statusFilter === "active"
                            ? "Activos"
                            : "Inactivos"}
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
            </Select>

            <Table className="min-w-full">
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Teléfono</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Correo</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dirección</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visible.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                No se encontraron proveedores.
                            </TableCell>
                        </TableRow>
                    ) : (
                        visible.map(s => (
                            <TableRow key={s.supplier_id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{highlight(s.name, search)}</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{highlight(s.contact_name, search)}</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{highlight(s.phone, search)}</TableCell>
                                <TableCell className="px-4 py-3 truncate max-w-[150px] whitespace-nowrap text-sm text-muted-foreground">{highlight(s.email, search)}</TableCell>
                                <TableCell className="px-4 py-3 truncate max-w-[150px] truncate text-sm text-muted-foreground">{highlight(s.address, search)}</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={s.active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                        {s.active ? "Sí" : "No"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onEdit(s)}>
                                        <Pencil className="size-4 mr-1" />
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(s.supplier_id)}>
                                        <Trash2 className="size-4 mr-1" />
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <div className="flex flex-wrap items-center mt-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                    <Select onValueChange={(v) => {
                        setPerPage(parseInt(v))
                        setPage(1)
                    }}>
                        <SelectTrigger className="w-[80px] p-2">
                            {perPage.toString()}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        ←
                    </Button>
                    <Button
                        variant="ghost"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        →
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default SupplierList