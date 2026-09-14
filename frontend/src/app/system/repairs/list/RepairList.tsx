"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
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
import { ClipboardEdit, Eye, BarChart2, UserCheck, Plus, TrendingUp } from "lucide-react"
import { useRepairList, SortableColumns } from "./useRepairList"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

function formatSmartNumber(value: number): string {
    return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

function RepairList() {
    const {
        repairs,
        edited,
        handleEditChange,
        confirmChanges,
        getRepairDetails,
        detailsMap,
        detailsLoading,
        statusFilter,
        setStatusFilter,
        statuses,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        page,
        setPage,
        perPage,
        setPerPage,
        totalPages,
        summary,
        search,
        setSearch,
        columnFilter,
        setColumnFilter,
        handleSort,
        sortColumn,
        sortDirection,
    } = useRepairList()

    const router = useRouter()
    const [expandedId, setExpandedId] = useState<number | null>(null)

    const handleExpandRow = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const statusColors: Record<string, string> = {
        received: "text-gray-500",
        "in progress": "text-orange-500",
        "ready for pickup": "text-blue-500",
        delivered: "text-green-600",
        canceled: "text-red-600"
    };

    const TableHeaderCell = ({ column, label }: { column: SortableColumns, label: string }) => (
        <TableHead
            className="cursor-pointer select-none hover:text-primary transition-colors duration-200"
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center gap-1">
                {label}
                {sortColumn === column && (sortDirection === 'asc' ? '▲' : '▼')}
            </div>
        </TableHead>
    );

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const { user } = useAuth()
    const userRole = user?.role_id

    const totalGlobalProfit = summary.totalProfit;

    return (
        <div className="space-y-6 p-2">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-primary">Lista de Reparaciones</h1>
                    <p className="text-muted-foreground text-sm">
                        Administre y vea sus reparaciones activas en tiempo real
                    </p>
                </div>
                <Link href="/system/repairs/register">
                    <Button className="gap-2 px-4 py-2">
                        <Plus className="w-4 h-4" /> Nueva Solicitud
                    </Button>
                </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-md">
                <Input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-auto min-w-[280px] max-w-full px-3 py-2"
                />

                <Select value={columnFilter} onValueChange={setColumnFilter}>
                    <SelectTrigger className="inline-flex w-auto min-w-[160px] px-3 py-2 bg-muted text-foreground border border-border rounded-md">
                        {columnFilter}
                    </SelectTrigger>
                    <SelectContent className="bg-muted text-foreground">
                        <SelectItem value="all">Todo</SelectItem>
                        <SelectItem value="model">Modelo</SelectItem>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="deposito">Depósito</SelectItem>
                        <SelectItem value="repuesto">Repuesto</SelectItem>
                        <SelectItem value="saldo">Saldo</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="nombre del cliente">Nombre del Cliente</SelectItem>
                        <SelectItem value="email del cliente">Email del Cliente</SelectItem>
                        <SelectItem value="numero del cliente">Número del Cliente</SelectItem>
                        <SelectItem value="ci del cliente">CI del Cliente</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={(v: string) => setStatusFilter(v)}>
                    <SelectTrigger className="inline-flex w-auto min-w-[140px] px-3 py-2 bg-muted text-foreground border border-border rounded-md">
                        {statusFilter}
                    </SelectTrigger>
                    <SelectContent className="bg-muted text-foreground">
                        {statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-4 ml-auto">
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)}
                        className="w-auto min-w-[140px] px-3 py-2"
                    />
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)}
                        className="w-auto min-w-[140px] px-3 py-2"
                    />
                </div>
            </div>

            <Card className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 [&>th]:py-6">
                            <TableHeaderCell column="model" label="Modelo" />
                            <TableHeaderCell column="total_price" label="Total" />
                            <TableHeaderCell column="deposit" label="Depósito" />
                            <TableHeaderCell column="spare_part_cost" label="Repuesto" />
                            <TableHeaderCell column="balance" label="Saldo" />
                            {userRole === 1 && (
                                <TableHeaderCell column="profit" label="Efectivo" />
                            )}
                            <TableHeaderCell column="status" label="Estado" />
                            <TableHeaderCell column="received_at" label="Recibido" />
                            <TableHeaderCell column="delivered_at" label="Entregado" />
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {repairs.map(r => {
                            const edit = edited[r.repair_id] || {}
                            const statusClass = statusColors[r.status] ?? "text-muted-foreground"
                            const receivedTime = r.received_at ? new Date(r.received_at).toLocaleTimeString(undefined, timeOptions) : '—'
                            const deliveredTime = r.delivered_at ? new Date(r.delivered_at).toLocaleTimeString(undefined, timeOptions) : '—'

                            return (
                                <React.Fragment key={r.repair_id}>
                                    <TableRow>
                                        <TableCell>{r.model}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="min-w-[80px] max-w-full sm:w-12"
                                                value={formatSmartNumber(Number(edit.total_price ?? r.total_price))}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleEditChange(r.repair_id, "total_price", parseFloat(e.target.value))
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="min-w-[80px] max-w-full sm:w-12"
                                                value={formatSmartNumber(Number(edit.deposit ?? r.deposit))}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleEditChange(r.repair_id, "deposit", parseFloat(e.target.value))
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="min-w-[80px] max-w-full sm:w-12"
                                                value={formatSmartNumber(Number(edit.spare_part_cost ?? r.spare_part_cost))}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleEditChange(r.repair_id, "spare_part_cost", parseFloat(e.target.value))
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-blue-700">
                                            {formatSmartNumber(Number(r.balance || 0))} Bs
                                        </TableCell>
                                        {userRole === 1 && (
                                            <TableCell className="font-medium text-green-700">
                                                {formatSmartNumber(Number(r.profit || 0))} Bs
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Select
                                                value={edit.status ?? r.status}
                                                onValueChange={(value: string) => handleEditChange(r.repair_id, "status", value)}
                                            >
                                                <SelectTrigger className={statusClass}>
                                                    {edit.status ?? r.status}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(statusColors).map(status => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{receivedTime}</TableCell>
                                        <TableCell>{deliveredTime}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                variant="default"
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                onClick={() => confirmChanges(r.repair_id)}
                                                disabled={!edited[r.repair_id] || Object.keys(edited[r.repair_id]).length === 0}
                                            >
                                                <ClipboardEdit className="w-4 h-4 mr-1" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleExpandRow(r.repair_id)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedId === r.repair_id && (
                                        <TableRow>
                                            <TableCell colSpan={10} className="bg-muted/10">
                                                <div className="p-4 space-y-4 text-sm rounded-md border border-muted">
                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">Descripción:</span> {r.description}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">Observaciones:</span> {r.observations}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">Fecha de Entrega:</span>{" "}
                                                            {r.delivered_at ? new Date(r.delivered_at!).toLocaleTimeString(undefined, timeOptions) : "—"}
                                                        </p>
                                                    </div>

                                                    <hr className="border-muted" />

                                                    <div className="space-y-1">
                                                        <p className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">Cliente:</span> {r.customer_name} (
                                                            {r.customer_email}, {r.customer_phone}, CI: {r.customer_ci})
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">Usuario:</span> {r.user_name}
                                                        </p>
                                                    </div>

                                                    <hr className="border-muted" />

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push(`/system/repairs/register?edit=1&id=${r.repair_id}`)}
                                                        className="mt-2"
                                                    >
                                                        Editar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                    )}
                                </React.Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
                <div className="flex flex-wrap items-center mt-6 gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </span>
                        <Select onValueChange={(value: string) => {
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
                    <div className="flex items-center gap-2 text-foreground ml-auto">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span>Total Efectivo:</span>
                        <span className="text-green-600 dark:text-green-400">{formatSmartNumber(Number(totalGlobalProfit.toFixed(2)))} Bs</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

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

export default RepairList