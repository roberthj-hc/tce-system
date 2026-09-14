"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast as sonner } from "sonner"
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import QRCodeGenerator from 'qrcode';
import { notify } from "@/lib/notify"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export type Category = { category_id: number; name: string; section_id: number }
export type Section = { section_id: number; name: string }
export type Supplier = { supplier_id: number; name: string }

export function useProductForm() {
    const router = useRouter()
    const params = useSearchParams()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [form, setProductForm] = useState({
        name: "",
        barcode: "",
        brand: "",
        category_id: "",
        supplier_id: "",
        price: "",
        cost: "",
        stock: "",
        stock_minimum: "",
        photo: "",
        description: "",
        active: true
    })

    const [sections, setSections] = useState<Section[]>([])
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isFormValid, setIsFormValid] = useState(false)

    const selectedCategory = categories.find(c => String(c.category_id) === form.category_id)
    const selectedSupplier = suppliers.find(s => String(s.supplier_id) === form.supplier_id)

    const isEditing = params.get("edit") === "1"
    const editingId = params.get("id")

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const secRes = await fetch(`${apiUrl}/api/sections/list`)
                const secData = await secRes.json()
                if (secRes.ok) setSections(secData)
                const [catRes, supRes] = await Promise.all([
                    fetch(`${apiUrl}/api/categories/list`),
                    fetch(`${apiUrl}/api/suppliers/list`)
                ])
                const [catData, supData] = await Promise.all([
                    catRes.json(),
                    supRes.json()
                ])
                if (catRes.ok) setCategories(catData)
                if (supRes.ok) setSuppliers(supData)
                if (isEditing && editingId) {
                    const res = await fetch(`${apiUrl}/api/products/${editingId}`)
                    const data = await res.json()
                    if (res.ok) {
                        setProductForm({
                            name: data.name || "",
                            barcode: data.barcode || "",
                            brand: data.brand || "",
                            category_id: String(data.category_id || ""),
                            supplier_id: String(data.supplier_id || ""),
                            price: String(data.price || ""),
                            cost: String(data.cost || ""),
                            stock: String(data.stock || ""),
                            stock_minimum: String(data.stock_minimum || ""),
                            photo: data.photo || "",
                            description: data.description || "",
                            active: Boolean(data.active)
                        })
                    } else {
                        sonner.error(data?.error || "Error al cargar el producto.")
                    }
                }
            } catch {
                sonner.error("Error de conexión con el servidor.")
            }
        }
        fetchInitialData()
    }, [isEditing, editingId])

    useEffect(() => {
        validateForm()
    }, [form])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!form.name) newErrors.name = "El nombre es obligatorio."
        if (!form.brand) newErrors.brand = "La marca es obligatoria."
        if (!form.category_id) newErrors.category_id = "La categoría es obligatoria."
        if (!form.supplier_id) newErrors.supplier_id = "El proveedor es obligatorio."
        if (!form.barcode) newErrors.barcode = "El código de barras es obligatorio."
        if (!form.price) newErrors.price = "El precio es obligatorio."
        if (!form.cost) newErrors.cost = "El costo es obligatorio."
        if (!form.stock) newErrors.stock = "El stock es obligatorio."
        if (!form.stock_minimum) newErrors.stock_minimum = "El stock mínimo es obligatorio."
        if (parseFloat(form.price) < 0) newErrors.price = "El precio no puede ser negativo."
        if (parseFloat(form.cost) < 0) newErrors.cost = "El costo no puede ser negativo."
        if (parseFloat(form.stock) < 0) newErrors.stock = "El stock no puede ser negativo."
        if (parseFloat(form.stock_minimum) < 0) newErrors.stock_minimum = "El stock mínimo no puede ser negativo."
        setErrors(newErrors)
        const isValid = Object.keys(newErrors).length === 0
        setIsFormValid(isValid)
        return isValid
    }

    const [checkingBarcode, setCheckingBarcode] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let validatedValue = value;
        if (["price", "cost", "stock", "stock_minimum"].includes(name)) {
            validatedValue = value.replace(/[^0-9.]/g, '');
            if (validatedValue.startsWith('.')) validatedValue = '0' + validatedValue;
        }
        setProductForm({ ...form, [name]: validatedValue });

        if (name === "barcode" && value.trim().length > 0 && !isEditing) {
            setCheckingBarcode(true);
            try {
                const res = await fetch(`${apiUrl}/api/products/exists?barcode=${encodeURIComponent(value.trim())}`);
                const data = await res.json();

                if (data.exists) {
                    setErrors(prev => ({
                        ...prev,
                        barcode: "Este código de barras ya está registrado."
                    }));
                } else {
                    setErrors(prev => {
                        const { barcode, ...rest } = prev;
                        return rest;
                    });
                }
            } catch (err) {
                console.error("Error verificando el código de barras:", err);
                sonner.error("Error al verificar el código de barras.");
            } finally {
                setCheckingBarcode(false);
            }
        }
    };

    const filteredCategories = selectedSection
        ? categories.filter(c => c.section_id === selectedSection.section_id)
        : categories


    const handleSelectChange = (key: string, value: string) => {
        setProductForm({ ...form, [key]: value })
    }

    const handleCheckboxChange = (checked: boolean) => {
        setProductForm({ ...form, active: checked })
    }

    const triggerFileSelect = () => {
        fileInputRef.current?.click()
    }

    const handlePhotoUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);
        try {
            const res = await fetch(`${apiUrl}/api/products/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setProductForm({ ...form, photo: data.filePath });
                sonner.success("Imagen subida exitosamente.");
            } else {
                sonner.error(data?.error || "Error al subir la imagen.");
            }
        } catch (error) {
            console.error("Error en la subida:", error);
            sonner.error("Error de conexión al subir la imagen.");
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handlePhotoUpload(file);
        }
    };

    const handleGenerateAndDownloadQr = async () => {
        if (!form.name || form.name.trim() === '') {
            sonner.error("Por favor, ingresa el nombre del producto antes de generar el QR.");
            return;
        }
        const uniqueId = uuidv4();
        const productName = form.name;
        const qrData = uniqueId;
        setProductForm(prevForm => ({ ...prevForm, barcode: uniqueId }));
        try {
            const qrSize = 256;
            const padding = 20;
            const fontSize = 24;
            const qrCanvas = document.createElement('canvas');
            await new Promise<void>((resolve, reject) => {
                QRCodeGenerator.toCanvas(qrCanvas, qrData, { width: qrSize }, (error?: Error | null) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            if (!ctx) {
                throw new Error("No se pudo obtener el contexto 2D del canvas.");
            }
            ctx.font = `${fontSize}px Arial`;
            const textMetrics = ctx.measureText(productName);
            const textWidth = textMetrics.width;
            const textHeight = fontSize * 1.2;
            const contentWidth = Math.max(qrSize, textWidth);
            finalCanvas.width = contentWidth + padding * 2;
            finalCanvas.height = qrSize + textHeight + padding * 3;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(productName, finalCanvas.width / 2, padding);
            const qrX = (finalCanvas.width - qrSize) / 2;
            const qrY = padding + textHeight + padding;
            ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
            const imageURL = finalCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `${productName.replace(/\s/g, '_')}_QR.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            sonner.success("Código QR y nombre descargados como imagen PNG.");
        } catch (error: any) {
            console.error("Error al generar o descargar el QR:", error);
            sonner.error("Error al generar o descargar el código QR.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            sonner.error("Por favor, corrige los errores del formulario antes de continuar.")
            return
        }
        if (!isEditing) {
            try {
                const existsRes = await fetch(`${apiUrl}/api/products/exists?barcode=${form.barcode}`)
                const existsData = await existsRes.json()
                if (existsData.exists) {
                    sonner.error("Error: Ya existe un producto con este código de barras.")
                    setErrors(prev => ({ ...prev, barcode: "Este código de barras ya está registrado." }))
                    return
                }
            } catch {
                sonner.error("Error de conexión al verificar el código de barras.")
                return
            }
        }
        try {
            const endpoint = isEditing
                ? `${apiUrl}/api/products/update/${editingId}`
                : `${apiUrl}/api/products/register`
            const method = isEditing ? "PUT" : "POST"

            const token = localStorage.getItem("token");
            let user_id = null;
            if (token) {
                try {
                    const decoded = JSON.parse(atob(token.split(".")[1]));
                    user_id = decoded.id;
                } catch (error) {
                    console.error("Error decodificando token:", error);
                    sonner.error("Error al decodificar el token del usuario.");
                }
            } else {
                sonner.error("Usuario no autenticado.");
                return;
            }
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    user_id
                })
            });

            const data = await res.json()
            if (res.ok) {
                try {
                    notify({
                        type: isEditing ? "info" : "success",
                        title: isEditing ? "Producto actualizado" : "Producto registrado",
                        description: `Se ${isEditing ? "actualizó" : "registró"} el producto: ${data.name || form.name}`,
                        roleId: 2,
                        persist: true
                    })
                } catch (err) {
                    console.error("Error al guardar la notificación:", err)
                }
                if (isEditing) {
                    router.push("/system/products/list")
                } else {
                    setProductForm({
                        name: "",
                        barcode: "",
                        brand: "",
                        category_id: "",
                        supplier_id: "",
                        price: "",
                        cost: "",
                        stock: "",
                        stock_minimum: "",
                        photo: "",
                        description: "",
                        active: true
                    })
                }
            } else {
                sonner.error(data?.error || "Error al guardar el producto.")
            }
        } catch {
            sonner.error("Error del servidor.")
        }
    }

    return {
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
    }
}