"use client"

import { useState, useEffect } from "react"
import { toast as sonner } from "sonner"
import { useBarcodeScanner } from "../../../../hooks/useBarcodeScanner"

export type Product = {
  product_id: number
  name: string
  barcode: string
}

export type Supplier = {
  supplier_id: number
  name: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useAdjustForm() {
  const todayLocal = new Date().toLocaleDateString("sv-SE")
  const [form, setForm] = useState({
    product_id: -1,
    supplier_id: -1,
    type: "",
    quantity: "",
    date: new Date().toLocaleDateString("sv-SE"),
    comment: "",
    user_id: ""
  })

  const [manualDate, setManualDate] = useState(false)
  const types = ["Entrada de Stock", "Salida de Stock", "Ajuste de Stock"]
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [barcodeInput, setBarcodeInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  const { videoRef, startScanner, stopScanner } = useBarcodeScanner((code: string) => {
    setBarcodeInput(code)
    handleScan(code)
    setScanning(false)
    stopScanner()
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]))
        const user_id = decoded.id
        setForm(prev => ({ ...prev, user_id }))
      } catch {
        sonner.error("Formato de token inválido")
      }
    } else {
      sonner.warning("Usuario no autenticado")
    }
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${apiUrl}/api/products/list`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        sonner.error("Error al cargar productos")
      }
    }

    async function fetchSuppliers() {
      try {
        const res = await fetch(`${apiUrl}/api/suppliers/list`)
        const data = await res.json()
        setSuppliers(Array.isArray(data) ? data : [])
      } catch {
        sonner.error("Error al cargar proveedores")
      }
    }

    fetchProducts()
    fetchSuppliers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "date") setManualDate(true)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelect = (field: string, value: string) => {
    const numericValue = Number(value)
    if (field === "product_id") {
      const selected = products.find(p => p.product_id === numericValue)
      if (selected) {
        setForm(prev => ({ ...prev, product_id: selected.product_id }))
        setBarcodeInput(selected.barcode)
      }
    } else if (field === "supplier_id") {
      const selected = suppliers.find(s => s.supplier_id === numericValue)
      if (selected) {
        setForm(prev => ({ ...prev, supplier_id: selected.supplier_id }))
      }
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcodeInput(e.target.value)
  }

  const handleScan = (code?: string) => {
    const barcode = code || barcodeInput.trim()
    if (!barcode) {
      sonner.warning("Por favor, introduce un código de barras")
      return
    }

    const matched = products.find(p => p.barcode === barcode)
    if (!matched) {
      sonner.error("Producto no encontrado")
      setForm(prev => ({ ...prev, product_id: -1 }))
      return
    }

    setForm(prev => ({ ...prev, product_id: matched.product_id }))
    sonner.success(`Producto "${matched.name}" seleccionado`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.product_id === -1 || !form.type || !form.quantity || !form.user_id) {
      sonner.error("Por favor, rellena todos los campos obligatorios")
      return
    }

    const today = new Date()
    const time = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`
    const finalDate = manualDate ? `${form.date} 00:00:00` : `${form.date} ${time}`

    const supplier_id = form.type === "Entrada de Stock"
      ? form.supplier_id !== -1
        ? form.supplier_id
        : (() => {
          sonner.error("Por favor, selecciona un proveedor válido para Entrada de Stock")
          return null
        })()
      : null

    if (form.type === "Entrada de Stock" && supplier_id === null) return

    setLoading(true)

    if (Number(form.quantity) <= 0) {
      sonner.error("La cantidad debe ser mayor que cero");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/inventory/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          product_id: form.product_id,
          supplier_id,
          quantity: Number(form.quantity),
          date: finalDate
        })
      })

      if (!res.ok) {
        const error = await res.json()
        sonner.error(error.message || "Fallo al enviar el ajuste")
      } else {
        const data = await res.json();
        sonner.success(`Movimiento registrado. Nuevo stock: ${data.newStock}`);
        setForm({
          product_id: -1,
          supplier_id: -1,
          type: "",
          quantity: "",
          date: new Date().toLocaleDateString("sv-SE"),
          comment: "",
          user_id: form.user_id
        })
        setBarcodeInput("")
        setManualDate(false)
      }
    } catch {
      sonner.error("Error del servidor durante el envío")
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    types,
    products,
    suppliers,
    barcodeInput,
    loading,
    scanning,
    videoRef,
    setScanning,
    startScanner,
    stopScanner,
    handleChange,
    handleSelect,
    handleBarcodeInput,
    handleScan,
    handleSubmit
  }
}