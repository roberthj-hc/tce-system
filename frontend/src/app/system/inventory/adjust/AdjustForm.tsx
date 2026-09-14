"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Barcode,
  Save,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings2
} from "lucide-react"
import { useAdjustForm } from "./useAdjustForm"
import clsx from "clsx"

function AdjustForm() {
  const {
    form,
    types,
    products,
    suppliers,
    barcodeInput,
    loading,
    handleChange,
    handleSelect,
    handleBarcodeInput,
    handleScan,
    handleSubmit
  } = useAdjustForm()

  const movementConfig = {
    "Entrada de Stock": {
      color: "text-green-600",
      icon: <ArrowDownCircle className="w-6 h-6 text-green-600" />,
      button: "bg-green-600 hover:bg-green-700"
    },
    "Salida de Stock": {
      color: "text-red-600",
      icon: <ArrowUpCircle className="w-6 h-6 text-red-600" />,
      button: "bg-red-600 hover:bg-red-700"
    },
    "Ajuste de Stock": {
      color: "text-yellow-600",
      icon: <Settings2 className="w-6 h-6 text-yellow-600" />,
      button: "bg-yellow-500 hover:bg-yellow-600"
    }
  }[form.type] || {
    color: "text-muted-foreground",
    bg: "bg-muted/20",
    icon: <Settings2 className="w-6 h-6 text-muted-foreground" />,
    button: "bg-primary hover:bg-primary/90"
  }

  return (
    <div className="w-full p-0 sm:p-4">
      <Card className={clsx("p-6 sm:p-8 space-y-6 shadow-none transition-colors", movementConfig.bg)}>
        <CardHeader className="space-y-3 pb-4 p-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {movementConfig.icon}
            <div>
              <CardTitle className={clsx("text-2xl sm:text-3xl font-bold tracking-tight", movementConfig.color)}>
                {form.type ? form.type : "Registrar Movimiento de Inventario"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Controla las entradas, salidas o ajustes de tu inventario en tiempo real.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Movimiento *</Label>
                <Select onValueChange={(value) => handleSelect("type", value)} value={form.type}>
                  <SelectTrigger id="type" className="w-full">
                    {form.type || "Seleccionar"}
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {form.type === "Entrada de Stock" && (
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Proveedor *</Label>
                <Select onValueChange={(value) => handleSelect("supplier_id", value)} value={String(form.supplier_id)}>
                  <SelectTrigger id="supplier_id" className="w-full">
                    {suppliers.find(s => s.supplier_id === form.supplier_id)?.name || "Seleccionar"}
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-9 gap-6 items-end">
              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="product_id">Producto *</Label>
                <Select onValueChange={(value) => handleSelect("product_id", value)} value={String(form.product_id)}>
                  <SelectTrigger id="product_id" className="w-full">
                    {products.find(p => p.product_id === form.product_id)?.name || "Seleccionar"}
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.product_id} value={String(p.product_id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={barcodeInput}
                  onChange={handleBarcodeInput}
                  placeholder="Introducir código de barras"
                />
              </div>
              <div className="md:col-span-2 pt-1 md:pt-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleScan()}
                  className="w-full gap-1"
                >
                  <Barcode className="w-4 h-4" />
                  Escanear
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="1"
                className="font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comentario o Razón</Label>
              <Textarea
                id="comment"
                name="comment"
                value={form.comment}
                onChange={handleChange}
                placeholder="Notas opcionales o razón para el ajuste"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className={clsx("gap-2 text-white", movementConfig.button)}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? "Enviando..." : "Registrar Movimiento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdjustForm