"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Barcode, Image as ImageIcon, QrCode, Settings2 } from "lucide-react"
import { useProductForm } from "./useProductForm"
import ExchangeRateDialog from "./ExchangeRateDialog"
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner"
import { useState } from "react"
import { useRouter } from "next/navigation"

function ProductForm() {
    const {
        rate,
        appliedRate,
        handleRateChanged,
        handleUseCurrentRate,
        form,
        categories,
        suppliers,
        selectedCategory,
        selectedSupplier,
        isEditing,
        editingId,
        fileInputRef,
        handleChange,
        handleSelectChange,
        handleCheckboxChange,
        triggerFileSelect,
        handleFileChange,
        handleSubmit,
        handleGenerateAndDownloadQr,
        isFormValid,
        errors,
        checkingBarcode,
        filteredCategories,
        sections,
        setSelectedSection,
        selectedSection
    } = useProductForm()

    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [rateDialogOpen, setRateDialogOpen] = useState(false)
    const { videoRef, startScanner, stopScanner } = useBarcodeScanner((value) => {
        handleChange({ target: { name: "barcode", value } } as React.ChangeEvent<HTMLInputElement>)
        setScanning(false)
        stopScanner()
    })

    return (
        <Card className="p-2 space-y-6 shadow-sm">
            <CardHeader className="space-y-2">
                <CardTitle className="mt-4 text-3xl font-bold text-primary tracking-tight">
                    {isEditing ? `Editar producto #${editingId}` : "Registrar producto"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {isEditing ? "Actualiza los detalles del producto existente" : "Ingresa los detalles para registrar un nuevo producto"}
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-10">
                    <fieldset className="space-y-6 border-b pb-6">
                        <legend className="text-lg font-semibold text-primary">Información Básica</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input name="name" value={form.name} onChange={handleChange} />
                                {errors.name && <p className="text-muted-foreground text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Marca *</Label>
                                <Input name="brand" value={form.brand} onChange={handleChange} />
                                {errors.brand && <p className="text-muted-foreground text-sm">{errors.brand}</p>}
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="space-y-6 border-b pb-6">
                        <legend className="text-lg font-semibold text-primary">Clasificación</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="section_id">Sección</Label>
                                <Select
                                    onValueChange={(v) => {
                                        const sec = sections.find(s => String(s.section_id) === v) || null
                                        setSelectedSection(sec)
                                    }}
                                    value={selectedSection?.section_id ? String(selectedSection.section_id) : ""}
                                >
                                    <SelectTrigger className="w-full">{selectedSection?.name || "Seleccionar sección"}</SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => (
                                            <SelectItem key={s.section_id} value={String(s.section_id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoría *</Label>
                                <Select onValueChange={(v) => handleSelectChange("category_id", v)} value={form.category_id}>
                                    <SelectTrigger className="w-full">{selectedCategory?.name || "Seleccionar categoría"}</SelectTrigger>
                                    <SelectContent>
                                        {filteredCategories.map((c) => (
                                            <SelectItem key={c.category_id} value={String(c.category_id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.category_id && <p className="text-muted-foreground text-sm">{errors.category_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">Proveedor *</Label>
                                <Select onValueChange={(v) => handleSelectChange("supplier_id", v)} value={form.supplier_id}>
                                    <SelectTrigger className="w-full">{selectedSupplier?.name || "Seleccionar proveedor"}</SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.supplier_id && <p className="text-muted-foreground text-sm">{errors.supplier_id}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 col-span-1 lg:col-span-1">
                                <Label htmlFor="barcode">Código de Barras *</Label>
                                <Input
                                    name="barcode"
                                    value={form.barcode}
                                    onChange={handleChange}
                                    disabled={checkingBarcode}
                                />
                                {checkingBarcode && (
                                    <p className="text-xs text-blue-500">Verificando código de barras...</p>
                                )}
                                {errors.barcode && (
                                    <p className="text-red-500 text-sm">{errors.barcode}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 col-span-1 sm:col-span-1 lg:col-span-2 items-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex items-center gap-2 h-10 px-4"
                                    onClick={() => {
                                        setScanning(true)
                                        startScanner()
                                    }}
                                >
                                    <Barcode className="w-4 h-4 flex-shrink-0" />
                                    <span>Escanear</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="default"
                                    className="flex items-center gap-2 h-10 px-4"
                                    onClick={handleGenerateAndDownloadQr}
                                >
                                    <QrCode className="w-4 h-4 flex-shrink-0" />
                                    <span>Generar QR</span>
                                </Button>
                            </div>
                            {scanning && (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4">
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
                                        Detener escaneo
                                    </Button>
                                </div>
                            )}
                        </div>
                    </fieldset>
                    <fieldset className="space-y-6 border-b pb-6">
                        <legend className="text-lg font-semibold text-primary">Precios y Stock</legend>
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3">
                            <div className="text-sm space-y-1">
                                {rate ? (
                                    <>
                                        <div>
                                            Tipo de cambio vigente:{" "}
                                            <span className="font-semibold">1 USD = Bs. {rate}</span>
                                        </div>
                                        {isEditing && form.cost_usd !== "" && appliedRate && appliedRate !== rate && (
                                            <div className="text-amber-600">
                                                Este producto está calculado con 1 USD = Bs. {Math.round(appliedRate * 10000) / 10000}.{" "}
                                                <button
                                                    type="button"
                                                    className="underline font-medium"
                                                    onClick={handleUseCurrentRate}
                                                >
                                                    Recalcular con el vigente
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-amber-600">
                                        No hay tipo de cambio configurado. Regístralo para calcular el costo en Bs.
                                    </span>
                                )}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => setRateDialogOpen(true)}>
                                <Settings2 className="w-4 h-4 mr-2" />
                                Configurar tipo de cambio
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cost_usd">Costo (USD)</Label>
                                <Input type="number" name="cost_usd" value={form.cost_usd} onChange={handleChange} step="any" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Costo (Bs) *</Label>
                                <Input type="number" name="cost" value={form.cost} onChange={handleChange} step="any" />
                                {errors.cost && <p className="text-muted-foreground text-sm">{errors.cost}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="margin_percent">Margen (%)</Label>
                                <Input type="number" name="margin_percent" value={form.margin_percent} onChange={handleChange} step="any" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio de venta (Bs) *</Label>
                                <Input type="number" name="price" value={form.price} onChange={handleChange} step="any" />
                                {errors.price && <p className="text-muted-foreground text-sm">{errors.price}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            El tipo de cambio es referencial: sugiere el costo (costo USD × tipo de cambio) y el precio (costo × (1 + margen)),
                            pero se guardan los valores en Bs que ves aquí, y todos son editables (si cambias el precio, se ajusta el margen).
                            En ventas puedes elegir usar el tipo de cambio más reciente o el registrado con el producto.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock inicial *</Label>
                                <Input
                                    type="number"
                                    name="stock"
                                    value={form.stock}
                                    onChange={handleChange}
                                    disabled={isEditing}
                                />
                                {errors.stock && (
                                    <p className="text-muted-foreground text-sm">{errors.stock}</p>
                                )}
                                {isEditing && (
                                    <p className="text-xs text-muted-foreground italic">
                                        El stock se ajusta desde el módulo de inventario.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock_minimum">Stock mínimo *</Label>
                                <Input type="number" name="stock_minimum" value={form.stock_minimum} onChange={handleChange} />
                                {errors.stock_minimum && <p className="text-muted-foreground text-sm">{errors.stock_minimum}</p>}
                            </div>
                            <div className="flex justify-end items-center h-full">
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={form.active} onCheckedChange={(checked) => handleCheckboxChange(!!checked)} />
                                    <Label htmlFor="active" className="text-sm">Producto activo</Label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="space-y-6">
                        <legend className="text-lg font-semibold text-primary">Contenido Multimedia del Producto</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="photo">Foto del producto</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        name="photo"
                                        value={form.photo}
                                        onChange={handleChange}
                                        placeholder="Subir..."
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <Button type="button" variant="secondary" onClick={triggerFileSelect}>
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Subir
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="rounded-md shadow-sm"
                            />
                        </div>
                    </fieldset>
                    <div className="flex justify-end gap-4">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.push("/system/products/list")}
                                className="px-6"
                            >
                                Cancelar edición
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className="px-6"
                            disabled={!isFormValid}
                        >
                            {isEditing ? "Guardar cambios" : "Guardar producto"}
                        </Button>
                    </div>
                </form>
                <ExchangeRateDialog
                    open={rateDialogOpen}
                    onOpenChange={setRateDialogOpen}
                    onChanged={handleRateChanged}
                />
            </CardContent>
        </Card>
    )
}

export default ProductForm