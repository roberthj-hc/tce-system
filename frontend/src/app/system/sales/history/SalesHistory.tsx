"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import React from "react"
import {
    Card,
    CardHeader,
    CardTitle,
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
import { FileDown, CalendarDays, BarChart2, UserCheck, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useSalesHistory } from "./useSalesHistory"
import { SaleInvoiceDownloadButton } from "./components/SaleInvoiceDownloadButton"
import { Download } from 'lucide-react'
import { useAuth } from "@/context/AuthContext"

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

function SalesHistoryPage() {
    const {
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
        filteredSales,
        summary,
        totalPages,
        getSaleDetails,
        detailsMap,
        detailsLoading,
    } = useSalesHistory()

    const [expandedId, setExpandedId] = useState<number | null>(null)

    useEffect(() => {
        if (expandedId !== null) getSaleDetails(expandedId)
    }, [expandedId])

      const { user } = useAuth()
      const userRole = user?.role_id

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-primary">Historial de Ventas</h1>
                    <p className="text-muted-foreground text-sm">
                        Registros de ventas con filtro y vista previa de detalles
                    </p>
                </div>
                <Link href="/system/sales/register">
                    <Button className="gap-2 px-4 py-2">
                        <Plus className="w-4 h-4" /> Nueva Venta
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard label="Total Filtrado" value={`${Number(summary.total || 0).toFixed(2)} Bs`} icon={<BarChart2 className="w-6 h-6 text-green-600" />} />
                <SummaryCard label="Ventas de Hoy" value={`${Number(summary.today || 0).toFixed(2)} Bs`} icon={<CalendarDays className="w-6 h-6 text-yellow-600" />} />
                <SummaryCard label="Ventas del Mes" value={`${Number(summary.month || 0).toFixed(2)} Bs`} icon={<CalendarDays className="w-6 h-6 text-blue-600" />} />
                <SummaryCard label="Registros Encontrados" value={`${summary.count}`} icon={<UserCheck className="w-6 h-6 text-slate-600" />} />
            </div>

            <Card className="p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <Select onValueChange={(v) => {
                        setVendor(v)
                        setPage(1)
                    }}>
                        <SelectTrigger>{vendor}</SelectTrigger>
                        <SelectContent>
                            {vendors.map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value)
                            setPage(1)
                        }}
                    />
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 [&>th]:py-7">
                            <TableHead>Fecha</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.map(sale => (
                            <React.Fragment key={sale.sale_id}>
                                <TableRow key={sale.sale_id} className="[&>td]:py-5">
                                    <TableCell>{new Date(sale.sale_date).toLocaleString("es-BO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false
                                    })}</TableCell>
                                    <TableCell>{sale.seller_name}</TableCell>
                                    <TableCell>
                                        {detailsLoading === sale.sale_id ? (
                                            <span className="text-sm text-muted-foreground">Cargando...</span>
                                        ) : detailsMap[sale.sale_id]?.length ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {detailsMap[sale.sale_id].map(d => (
                                                    <li key={d.product_id} className="text-sm">
                                                        {d.product_name} ({d.quantity})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Sin detalles de productos</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-green-600 font-semibold">
                                        {formatSmartNumber(Number(sale.total_sale || 0))} Bs
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === sale.sale_id ? null : sale.sale_id
                                                )
                                            }
                                        >
                                            {expandedId === sale.sale_id ? "Ocultar" : "Ver"} Detalles
                                        </Button>

                                        <SaleInvoiceDownloadButton sale={sale} />

                                    </TableCell>
                                </TableRow>

                                {expandedId === sale.sale_id && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="bg-muted/10">
                                            <div className="p-4 space-y-3">
                                                <p className="text-sm font-semibold text-muted-foreground mb-2">Detalles de Venta:</p>
                                                {detailsLoading === sale.sale_id ? (
                                                    <p className="text-sm text-muted-foreground">Cargando detalles...</p>
                                                ) : detailsMap[sale.sale_id]?.length ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/30 [&>th]:py-5">
                                                                <TableHead>Producto</TableHead>
                                                                <TableHead>Cantidad</TableHead>
                                                                <TableHead>Precio Unitario</TableHead>
                                                                <TableHead>Total</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {detailsLoading === sale.sale_id && (
                                                                <p className="text-sm text-muted-foreground">Cargando detalles...</p>
                                                            )}
                                                            {detailsMap[sale.sale_id].map((d) => (
                                                                <TableRow key={`${sale.sale_id}-${d.product_id}`} className="[&>td]:py-4">
                                                                    <TableCell>{d.product_name}</TableCell>
                                                                    <TableCell>{d.quantity}</TableCell>
                                                                    <TableCell>{formatSmartNumber(Number(d.unit_price || 0))} Bs</TableCell>
                                                                    <TableCell>{formatSmartNumber(Number((d.unit_price * d.quantity)))} Bs</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No hay detalles para esta venta</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
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
                            <SelectTrigger className="w-[80px]">{perPage.toString()}</SelectTrigger>
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

export default SalesHistoryPage

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon: React.ReactNode
}) {
    return (
        <div className="border rounded-md p-4 bg-muted/20 flex items-center gap-4">
            {icon}
            <div>
                <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </div>
    )
}