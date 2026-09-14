"use client"

import {
    Card,
    CardContent
} from "@/components/ui/card"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCcw,
    FileDown
} from "lucide-react"
import { useMovementsList } from "./useMovementsList"

export function MovementsList() {
    const {
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
        movements,
        totalPages,
        counts,
        loading
    } = useMovementsList()

    const indicators = {
        Entry: {
            label: "Entrada de Stock",
            icon: ArrowDownCircle,
            color: "green"
        },
        Exit: {
            label: "Salida de Stock",
            icon: ArrowUpCircle,
            color: "red"
        },
        Adjustment: {
            label: "Ajuste de Stock",
            icon: RefreshCcw,
            color: "orange"
        }
    }


    return (
        <div className="px-2 py-6 w-full space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-primary">Movimientos de Inventario</h1>
                    <p className="text-muted-foreground text-sm">
                        Historial de entradas, salidas y ajustes de stock
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(indicators).map(([key, { label, icon: Icon, color }]) => (
                    <Card
                        key={key}
                        className={`flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-lg`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={`w-6 h-6 text-${color}-600`} />
                            <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold text-${color}-600`}>
                            {counts[key as keyof typeof counts]}
                        </p>
                    </Card>
                ))}
            </div>


            <Card className="p-6 sm:p-8 space-y-6 shadow-sm rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <Input
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 rounded-md"
                    />
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="p-2 rounded-md">{type}</SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Todos</SelectItem>
                            <SelectItem value="Entrada de Stock">Entrada de Stock</SelectItem>
                            <SelectItem value="Salida de Stock">Salida de Stock</SelectItem>
                            <SelectItem value="Ajuste de Stock">Ajuste de Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 rounded-md" />
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="p-2 rounded-md" />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 [&>th]:py-7">
                            <TableHead>Producto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Comentario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                    {loading ? "Cargando movimientos de inventario..." : "No se encontraron registros."}
                                </TableCell>
                            </TableRow>
                        )}
                        {movements.map((m) => (
                            <TableRow key={m.inventory_id} className="[&>td]:py-5">
                                <TableCell>{m.product_name}</TableCell>
                                <TableCell className={
                                    m.type === "Entrada de Stock" ? "text-green-600 font-medium" :
                                        m.type === "Salida de Stock" ? "text-red-600 font-medium" :
                                            m.type === "Ajuste de Stock" ? "text-orange-400 font-medium" : ""
                                }>{m.type}</TableCell>
                                <TableCell>{m.quantity}</TableCell>
                                <TableCell className="text-blue-400">{new Date(m.date).toLocaleDateString()}</TableCell>
                                <TableCell>{m.user_name}</TableCell>
                                <TableCell className="text-gray-500">{m.supplier_name ?? "—"}</TableCell>
                                <TableCell>{m.comment || "—"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex flex-wrap items-center mt-6 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </span>
                        <Select onValueChange={(value) => {
                            setPerPage(parseInt(value))
                            setPage(1)
                        }}>
                            <SelectTrigger className="w-[80px] p-2 rounded-md">{perPage.toString()}</SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                            ←
                        </Button>
                        <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                            →
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}