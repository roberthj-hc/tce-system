"use client"

import { useRouter } from "next/navigation"
import { Barcode, Plus, Trash2, Eye } from "lucide-react"
import { useRegisterSale } from "./useRegisterSale"
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner"
import { useState } from "react"
import { RateSwitch } from "@/components/RateSwitch"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const apiUrl = process.env.NEXT_PUBLIC_API_URL

function RegisterSalePage() {
    const router = useRouter()
    const {
        rate,
        useCurrentRate,
        setUseCurrentRate,
        getPricing,
        products,
        productList,
        filteredManualOptions,
        total,
        barcodeInput,
        setBarcodeInput,
        manualQuery,
        handleManualQueryChange,
        manualSelected,
        addByBarcode,
        addManualProduct,
        updatePrice,
        updateQuantity,
        removeProduct,
        confirmSale,
        mode,
        searchTerm,
        showSuggestions,
        saleForm,
        filteredCustomers,
        isNewCustomerMode,
        setSearchTerm,
        setShowSuggestions,
        handleFormChange,
        handleSelectCustomer,
        handleRegisterCustomer,
        handleModeChange,
        suggestionsRef,
        availableCategories,
        availableSections,
        categoryFilter,
        sectionFilter,
        setCategoryFilter,
        setSectionFilter,
        isDetailsOpen,
        selectedProduct,
        setIsDetailsOpen,
        handleViewDetails
    } = useRegisterSale()

    const [scanning, setScanning] = useState(false)

    const { videoRef, startScanner, stopScanner } = useBarcodeScanner((value) => {
        setBarcodeInput(value)
        setScanning(false)
        stopScanner()
        addByBarcode(value)
    })

    const handleRegisterCustomerClick = async () => {
        const newCustomerId = await handleRegisterCustomer();
    };

    return (
        <Card className="p-6 space-y-6 shadow-sm">
            <CardHeader className="p-0 space-y-2">
                <CardTitle className="text-3xl font-bold text-primary">
                    Registrar Venta
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Escanea, busca y añade productos. Asocia un cliente si es necesario.
                </p>
            </CardHeader>

            <CardContent className="p-0 space-y-8">
                <div className="space-y-4 p-4 border rounded-lg bg-background">
                    <h3 className="font-semibold text-lg">Detalles del Cliente</h3>
                    <div className="space-y-2">
                        <Label htmlFor="mode">Modo</Label>
                        <Select value={mode} onValueChange={handleModeChange}>
                            <SelectTrigger className="w-full md:w-1/3">
                                <SelectValue placeholder="Seleccionar modo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin datos de cliente</SelectItem>
                                <SelectItem value="search">Buscar Cliente Existente</SelectItem>
                                <SelectItem value="register">Registrar Nuevo Cliente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === "search" && (
                        <div className="relative space-y-2">
                            <Label htmlFor="search">Buscar Cliente (Nombre, CI o Teléfono)</Label>
                            <Input
                                name="search"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                placeholder="Ej: Juan Pérez, 1234567, 76543210"
                                autoComplete="off"
                                className="w-full"
                            />
                            {showSuggestions && searchTerm && (
                                <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(c => (
                                            <div
                                                key={c.customer_id}
                                                className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
                                                onClick={() => handleSelectCustomer(c)}
                                            >
                                                <p className="font-semibold">{c.name}</p>
                                                <p className="text-xs text-muted-foreground">{c.ci} | {c.phone}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-muted-foreground">No se encontraron clientes.</div>
                                    )}
                                </div>
                            )}
                            {saleForm.customer_id && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                    <span className="font-semibold">Cliente Seleccionado:</span> {saleForm.customer} (ID: {saleForm.customer_id})
                                </p>
                            )}
                        </div>
                    )}

                    {isNewCustomerMode && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="customer">Nombre Completo *</Label>
                                    <Input name="customer" value={saleForm.customer} onChange={handleFormChange} placeholder="Nombre del Cliente" />
                                </div>
                                <div>
                                    <Label htmlFor="ci">CI / ID *</Label>
                                    <Input name="ci" value={saleForm.ci} onChange={handleFormChange} placeholder="Número de Identificación" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Teléfono *</Label>
                                    <Input name="phone" value={saleForm.phone} onChange={handleFormChange} placeholder="Número de Teléfono" />
                                </div>
                                <div>
                                    <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                                    <Input name="email" type="email" value={saleForm.email || ""} onChange={handleFormChange} placeholder="correo@ejemplo.com" />
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={handleRegisterCustomerClick}
                                disabled={!saleForm.customer || !saleForm.ci || !saleForm.phone}
                            >
                                Registrar Cliente
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Añadir Productos</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        addByBarcode();
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-end">
                            <div className="md:col-span-6">
                                <Label htmlFor="barcode" className="mb-2">Código de Barras</Label>
                                <Input
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addByBarcode()}
                                    autoFocus
                                    placeholder="Introduce o escanea el código de barras"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full flex gap-2"
                                    onClick={() => {
                                        setScanning(true)
                                        startScanner()
                                    }}
                                >
                                    <Barcode className="w-4 h-4" />
                                    <span>Escanear Código</span>
                                </Button>
                            </div>
                        </div>
                    </form>
                    {scanning && (
                        <div className="md:col-span-9 mt-4 space-y-2">
                            <video ref={videoRef} className="w-full rounded-lg" />
                            <Button
                                type="button"
                                onClick={() => {
                                    setScanning(false)
                                    stopScanner()
                                }}
                                variant="destructive"
                                className="mt-2"
                            >
                                Detener Escáner
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-end">
                        <div className="md:col-span-2">
                            <Label htmlFor="filter-section" className="mb-2 mt-6">Filtrar por Sección</Label>
                            <Select
                                value={sectionFilter}
                                onValueChange={(value) => setSectionFilter(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todas las secciones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">Todas las secciones</SelectItem>
                                    {availableSections.map((sec) => (
                                        <SelectItem key={sec} value={sec}>
                                            {sec}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="filter-category" className="mb-2">Filtrar por Categoría</Label>
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => setCategoryFilter(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">Todas las categorías</SelectItem>
                                    {availableCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <RateSwitch checked={useCurrentRate} onCheckedChange={setUseCurrentRate} rate={rate} />

                    <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-end">
                        <div className="md:col-span-6">
                            <Label className="mb-2">Buscar Producto</Label>
                            <Input
                                value={manualQuery}
                                onChange={(e) => handleManualQueryChange(e.target.value)}
                                list="product-options"
                                placeholder="Escribe para buscar..."
                            />
                            <datalist id="product-options">
                                {filteredManualOptions.map((p) => (
                                    <option key={p.product_id} value={`${p.name} - ${p.brand}`} />
                                ))}
                            </datalist>
                        </div>
                        <div className="md:col-span-2">
                            <Label>Precio Unitario</Label>
                            <Input value={manualSelected ? getPricing(manualSelected).price : ""} disabled />
                        </div>
                        <div className="md:col-span-1">
                            <Button className="w-full flex gap-2" onClick={() => addManualProduct()} disabled={!manualSelected}>
                                <Plus className="w-4 h-4" />
                                Añadir
                            </Button>
                        </div>
                    </div>
                </div>

                {products.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(p => (
                                    <TableRow key={p.product_id}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-20"
                                                value={p.quantity}
                                                min={1}
                                                onChange={(e) => updateQuantity(p.product_id, parseInt(e.target.value, 10))}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={p.sale_price}
                                                step="0.1"
                                                min="0"
                                                onChange={(e) => updatePrice(p.product_id, parseFloat(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {(p.sale_price * p.quantity).toFixed(2)} Bs
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(p.product_id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver Detalles</span>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => removeProduct(p.product_id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {products.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t gap-4">
                        <div className="text-2xl font-bold text-primary">
                            Total: {total.toFixed(2)} Bs
                        </div>
                        <Button size="lg" className="px-8 w-full md:w-auto" onClick={confirmSale}>
                            Confirmar y Registrar Venta
                        </Button>
                    </div>
                )}
            </CardContent>
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
                                    <p className="text-base">{selectedProduct.barcode}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Precio de Venta</p>
                                    <p className="text-base">{getPricing(selectedProduct).price} Bs</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Stock Actual</p>
                                    <p className="text-base">{selectedProduct.stock}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Stock Mínimo</p>
                                    <p className="text-base">{selectedProduct.stock_minimum}</p>
                                </div>
                                {selectedProduct.description && (
                                    <div className="col-span-2">
                                        <p className="text-sm font-semibold text-muted-foreground">Descripción</p>
                                        <p className="text-base">{selectedProduct.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export default RegisterSalePage