"use client"

import Link from "next/link"
import {
    Card,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { SelectTrigger } from "@/components/ui/select"
import { SelectContent } from "@/components/ui/select"
import { SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table"
import {
    Pencil,
    Trash2,
    PackageCheck,
    Boxes,
    Layers,
    TrendingUp,
    Plus
} from "lucide-react"
import { useProductList, Product, ColumnFilter } from "./useProductList"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { RateSwitch } from "@/components/RateSwitch"

function formatSmartNumber(value: number): string {
    return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function ProductList() {
    const { user, loading } = useAuth()
    const {
        rate, useCurrentRateSwitch, setUseCurrentRateSwitch,
        search, setSearch,
        categoryFilter, setCategoryFilter,
        categories,
        sectionFilter,
        setSectionFilter,
        sections,
        page, setPage,
        perPage, setPerPage,
        products,
        totalPages,
        handleEdit, handleDelete,
        statusFilter, setStatusFilter,
        mostPopularCategory,
        totalStock,
        averageStock,
        filteredCount,
        columnFilter,
        setColumnFilter,
        handleSort,
        sortColumn,
        sortDirection,
    } = useProductList()

    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product)
        setIsDetailsOpen(true)
    }

    if (loading) {
        return <div>Cargando...</div>
    }
    const isAdmin = user?.role_id === 1

    const columnLabels = {
        all: "Todas las Columnas",
        name: "Nombre",
        brand: "Marca",
        barcode: "Código de Barras",
        supplier: "Proveedor",
        category: "Categoría",
        description: "Descripción",
        price: "Precio",
        cost: "Costo",
        stock: "Stock",
    };

    return (
        <>
            <div className="p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-primary">Lista de Productos</h1>
                    <p className="text-muted-foreground text-sm">
                        Administra y visualiza el inventario de tus accesorios electrónicos
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/system/products/register">
                        <Button className="gap-2 px-4 py-2">
                            <Plus className="w-4 h-4" /> Nuevo Producto
                        </Button>
                    </Link>
                )}
            </div>

            <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                <Metric icon={<PackageCheck className="w-6 h-6 text-blue-600" />} label="Total Productos" value={filteredCount} />
                <Metric icon={<Boxes className="w-6 h-6 text-green-600" />} label="Stock Total" value={totalStock} />
                <Metric icon={<Layers className="w-6 h-6 text-purple-600" />} label="Categoría Más Común" value={mostPopularCategory} />
                <Metric icon={<TrendingUp className="w-6 h-6 text-pink-600" />} label="Stock Promedio" value={averageStock} />
            </div>

            <Card className="p-4 space-y-6 shadow-sm mt-6">
                <RateSwitch checked={useCurrentRateSwitch} onCheckedChange={setUseCurrentRateSwitch} rate={rate} />
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            placeholder="Buscar en todos los campos..."
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            className="w-[280px]"
                        />
                        <Select onValueChange={(value: ColumnFilter) => setColumnFilter(value)}>
                            <SelectTrigger className="w-max text-sm text-muted-foreground">
                                {columnLabels[columnFilter]}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="name">Nombre</SelectItem>
                                <SelectItem value="brand">Marca</SelectItem>
                                <SelectItem value="barcode">Código de Barras</SelectItem>
                                <SelectItem value="supplier">Proveedor</SelectItem>
                                <SelectItem value="category">Categoría</SelectItem>
                                <SelectItem value="description">Descripción</SelectItem>
                                <SelectItem value="price">Precio</SelectItem>
                                <SelectItem value="cost">Costo</SelectItem>
                                <SelectItem value="stock">Stock</SelectItem>
                            </SelectContent>
                        </Select>
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
                        <Select onValueChange={(value) => setCategoryFilter(value)}>
                            <SelectTrigger className="w-max">
                                {categoryFilter === "All" ? "Todas las Categorías" : categoryFilter}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">Todas</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.category_id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => setSectionFilter(value)}>
                            <SelectTrigger className="w-max">
                                {sectionFilter === "All" ? "Todas las Secciones" : sectionFilter}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">Todas</SelectItem>
                                {sections.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 [&>th]:py-4 [&>th]:px-3 [&>th]:text-sm [&>th]:font-medium">
                            {([
                                { key: "name", label: "Nombre", width: "min-w-[140px]" },
                                { key: "brand", label: "Marca", width: "min-w-[120px]" },
                                { key: "price", label: "Precio", width: "min-w-[100px]" },
                                { key: "cost", label: "Costo", width: "min-w-[100px]" },
                                { key: "stock", label: "Stock", width: "min-w-[100px]" },
                            ] as { key: keyof Product; label: string; width: string }[]).map(({ key, label, width }) => (
                                <TableHead
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    aria-sort={sortColumn === key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                                    className={`cursor-pointer select-none transition-colors duration-200 hover:text-primary ${width}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {label}
                                        <span className="w-4 text-xs text-muted-foreground">
                                            {sortColumn === key && (sortDirection === "asc" ? "▲" : "▼")}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-muted-foreground min-w-[100px]">Activo</TableHead>
                            <TableHead className="text-center text-muted-foreground min-w-[160px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>


                    <TableBody>
                        {products.map((prod: Product) => (
                            <TableRow key={prod.product_id} className="[&>td]:py-4 align-top">
                                <TableCell>{prod.name}</TableCell>
                                <TableCell className="max-w-[120px] truncate">{prod.brand}</TableCell>
                                <TableCell className="text-green-600">Bs. {formatSmartNumber(Number(prod.price))}</TableCell>
                                <TableCell className="text-blue-400">
                                    Bs. {formatSmartNumber(Number(prod.cost))}
                                    {prod.cost_usd != null && (
                                        <span className="block text-xs text-muted-foreground">
                                            $ {formatSmartNumber(Number(prod.cost_usd))}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-orange-600">{prod.stock}</TableCell>
                                <TableCell>
                                    {prod.active ? (
                                        <span className="text-green-600 font-semibold">Sí</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">No</span>
                                    )}
                                </TableCell>
                                <TableCell className="flex justify-center gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleViewDetails(prod)}
                                        className="gap-1 px-3"
                                    >
                                        <Eye className="w-4 h-4" /> Detalles
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(prod)}
                                                className="gap-1 px-3"
                                            >
                                                <Pencil className="w-4 h-4" /> Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(prod.product_id)}
                                                className="gap-1 px-3"
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar
                                            </Button>
                                        </>)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>

                <div className="flex items-center mt-2 gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                        <Select onValueChange={(v) => {
                            setPerPage(parseInt(v))
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
                        <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</Button>
                        <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</Button>
                    </div>
                </div>

            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-xl p-6">
                    <DialogHeader>
                        <DialogTitle>Detalles del Producto</DialogTitle>
                        <DialogDescription>
                            Información completa del producto seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="space-y-4 pt-4">
                            {selectedProduct.photo && (
                                <div className="flex justify-center">
                                    <img
                                        src={`${apiUrl}${selectedProduct.photo}`}
                                        alt={selectedProduct.name}
                                        className="w-48 h-48 object-cover rounded-md shadow-lg"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Nombre</p>
                                    <p className="text-base">{selectedProduct.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Marca</p>
                                    <p className="text-base">{selectedProduct.brand}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Código de Barras</p>
                                    <p className="text-base text-yellow-600 font-mono">{selectedProduct.barcode}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Categoría</p>
                                    <p className="text-base">{selectedProduct.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Proveedor</p>
                                    <p className="text-base">{selectedProduct.supplier}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Precio de Venta</p>
                                    <p className="text-base text-green-600">Bs. {selectedProduct.price}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Costo</p>
                                    <p className="text-base text-blue-400">Bs. {selectedProduct.cost}</p>
                                </div>
                                {selectedProduct.cost_usd != null && (
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Costo (USD)</p>
                                        <p className="text-base text-blue-400">
                                            $ {Number(selectedProduct.cost_usd)}
                                            {selectedProduct.exchange_rate != null && (
                                                <span className="text-xs text-muted-foreground">
                                                    {" "}(a Bs. {Number(selectedProduct.exchange_rate)} por USD)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                {selectedProduct.margin_percent != null && (
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Margen</p>
                                        <p className="text-base">{Number(selectedProduct.margin_percent)} %</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Stock Actual</p>
                                    <p className="text-base text-orange-600">{selectedProduct.stock}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Stock Mínimo</p>
                                    <p className="text-base">{selectedProduct.stock_minimum}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Estado</p>
                                    <p className="text-base">
                                        {selectedProduct.active ? (
                                            <span className="text-green-600 font-semibold">Activo</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">Inactivo</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {selectedProduct.description && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-muted-foreground">Descripción</p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedProduct.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

function Metric({
    icon,
    label,
    value
}: {
    icon: React.ReactNode
    label: string
    value: string | number
}) {
    return (
        <div className="bg-muted/20 border rounded-md p-4 flex items-center gap-4">
            {icon}
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </div>
    )
}