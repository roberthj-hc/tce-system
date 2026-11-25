"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useBarcodeScanner } from "../../../../hooks/useBarcodeScanner"
import { useMemo } from "react";
import { useCurrentRate } from "@/hooks/useCurrentRate"
import { effectivePricing } from "@/lib/pricing"

export type Product = {
    product_id: number
    name: string
    barcode: string
    price: number
    brand: string;
    category: string;
    section: string;
    cost: number;
    cost_usd?: number | null;
    margin_percent?: number | null;
    exchange_rate?: number | null;
    stock: number;
    stock_minimum: number;
    active: boolean;
    photo?: string;
    description?: string;
}

export type SaleProduct = {
    product_id: number
    name: string
    barcode: string
    sale_price: number
    quantity: number
    // true si el vendedor editó el precio a mano (el switch ya no lo recalcula)
    price_edited?: boolean
}

export type Customer = {
    customer_id: number
    name: string
    ci: string
    phone: string
    email?: string
}

type SaleForm = {
    customer_id?: number
    customer: string
    ci: string
    phone: string
    email?: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useRegisterSale() {
    const router = useRouter()

    // Tipo de cambio más reciente (activado por defecto)
    const rate = useCurrentRate()
    const [useCurrentRate_, setUseCurrentRate] = useState(true)
    const getPricing = (p: Product) => effectivePricing(p, useCurrentRate_, rate)

    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableSections, setAvailableSections] = useState<string[]>([]);

    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [sectionFilter, setSectionFilter] = useState<string>("All");

    const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
    const [filteredSections, setFilteredSections] = useState<string[]>([]);

    const [products, setProducts] = useState<SaleProduct[]>([])
    const [productList, setProductList] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [sellerId, setSellerId] = useState<number | null>(null)

    const [barcodeInput, setBarcodeInput] = useState("")
    const [manualQuery, setManualQuery] = useState("")
    const [manualSelected, setManualSelected] = useState<Product | null>(null)
    const [scanning, setScanning] = useState(false)

    const [mode, setMode] = useState<"none" | "search" | "register">("none")
    const [searchTerm, setSearchTerm] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [saleForm, setSaleForm] = useState<SaleForm>({
        customer: "",
        ci: "",
        phone: "",
        email: ""
    })
    const suggestionsRef = useRef<HTMLDivElement>(null)

    const total = products.reduce((sum, p) => sum + p.sale_price * p.quantity, 0)
    const isNewCustomerMode = mode === "register"

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ci.includes(searchTerm) ||
        c.phone.includes(searchTerm)
    )

    const filteredProducts = useMemo(() => {
        return productList.filter(product => {
            if (sectionFilter !== "All" && product.section !== sectionFilter) return false;
            if (categoryFilter !== "All" && product.category !== categoryFilter) return false;
            return true;
        });
    }, [productList, sectionFilter, categoryFilter]);


    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { videoRef, startScanner, stopScanner } = useBarcodeScanner((code: string) => {
        setBarcodeInput(code)
        setTimeout(() => addByBarcode(code), 100)
        setScanning(false)
        stopScanner()
    })

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split(".")[1]))
                setSellerId(decoded.id)
            } catch (error) {
                console.error("Error al decodificar el token:", error)
                toast.error("Sesión inválida.")
                router.push("/auth/login")
            }
        } else {
            toast.warning("Usuario no autenticado.")
            router.push("/auth/login")
        }

        fetchProductList()
        fetchCustomers()
    }, [router])

    const fetchProductList = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/products/list`)
            const data: Product[] = await res.json()
            if (res.ok) {
                setProductList(data)
                const categories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
                const sections = Array.from(new Set(data.map(p => p.section))).filter(Boolean);
                setAvailableCategories(categories)
                setAvailableSections(sections)
            } else {
                toast.error("La lista de productos no pudo ser cargada.")
            }
        } catch {
            toast.error("Error al conectar con el servidor para obtener productos.")
        }
    };

    const filteredManualOptions = useMemo(() => {
        return filteredProducts.filter(p =>
            p.name.toLowerCase().includes(manualQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(manualQuery.toLowerCase()) ||
            p.barcode.toLowerCase().includes(manualQuery.toLowerCase())
        );
    }, [filteredProducts, manualQuery]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/customers/list`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
            const data = await res.json()
            if (res.ok) {
                setCustomers(data)
            } else {
                toast.error("Error al cargar la lista de clientes.")
            }
        } catch (error) {
            console.error("Error al obtener clientes:", error)
            toast.error("Error del servidor al cargar clientes.")
        }
    }

    const handleViewDetails = (productId: number) => {
        const fullProduct = productList.find(p => p.product_id === productId);
        if (fullProduct) {
            setSelectedProduct(fullProduct);
            setIsDetailsOpen(true);
        }
    };

    const handleRegisterCustomer = async (): Promise<number | undefined> => {
        const customerData = {
            name: saleForm.customer,
            ci: saleForm.ci,
            phone: saleForm.phone,
            email: saleForm.email || undefined
        }

        try {
            const res = await fetch(`${apiUrl}/api/customers/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(customerData)
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("¡Cliente registrado con éxito!")
                await fetchCustomers()
                setSaleForm(prev => ({ ...prev, customer_id: data.customer_id }))
                setMode("search")
                return data.customer_id
            } else {
                toast.error(data?.error || "Error al registrar el cliente.")
                return undefined
            }
        } catch (error) {
            console.error("Error de servidor en registro de cliente:", error)
            toast.error("Error de servidor en registro de cliente.")
            return undefined
        }
    }

    const addProductToSale = (productToAdd: Product) => {
        const existingProduct = products.find(p => p.product_id === productToAdd.product_id)

        if (existingProduct) {
            setProducts(products.map(p =>
                p.product_id === productToAdd.product_id
                    ? { ...p, quantity: p.quantity + 1 }
                    : p
            ))
        } else {
            const newSaleProduct: SaleProduct = {
                product_id: productToAdd.product_id,
                name: productToAdd.name,
                barcode: productToAdd.barcode,
                sale_price: getPricing(productToAdd).price,
                quantity: 1
            }
            setProducts([...products, newSaleProduct])
        }
    }

    const addByBarcode = (code?: string) => {
        const codeToFind = code || barcodeInput
        if (!codeToFind) return

        const found = productList.find(p => p.barcode === codeToFind)
        if (found) {
            addProductToSale(found)
            toast.success(`${found.name} agregado.`)
        } else {
            toast.error("Producto no encontrado por código de barras.")
        }
        setBarcodeInput("")
    }

    const addManualProduct = (productToAdd?: Product) => {
        const product = productToAdd || manualSelected;
        if (product) {
            const found = productList.find(p => p.product_id === product.product_id);
            if (found) {
                addProductToSale(found);
                toast.success(`${found.name} agregado.`);
            }
            setManualSelected(null);
            setManualQuery("");
        } else {
            toast.error("Por favor, selecciona un producto válido.");
        }
    };

    const removeProduct = (productId: number) => {
        setProducts(prevProducts => prevProducts.filter(p => p.product_id !== productId))
        toast.info("Producto eliminado de la venta.")
    }

    const updatePrice = (id: number, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return
        setProducts(products.map(p =>
            p.product_id === id ? { ...p, sale_price: newPrice, price_edited: true } : p
        ))
    }

    // Al cambiar el switch o llegar el tipo de cambio, se recalculan las líneas cuyo precio no se editó a mano
    useEffect(() => {
        setProducts(prev => prev.map(line => {
            if (line.price_edited) return line
            const prod = productList.find(x => x.product_id === line.product_id)
            return prod ? { ...line, sale_price: effectivePricing(prod, useCurrentRate_, rate).price } : line
        }))
    }, [useCurrentRate_, rate, productList])

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (isNaN(newQuantity) || newQuantity <= 0) {
            removeProduct(productId)
            return
        }
        setProducts(products.map(p =>
            p.product_id === productId ? { ...p, quantity: newQuantity } : p
        ))
    }

    const handleManualQueryChange = (query: string) => {
        setManualQuery(query);
        const found = productList.find(p =>
            p.name.toLowerCase() === query.toLowerCase() ||
            p.brand.toLowerCase() === query.toLowerCase() ||
            p.barcode.toLowerCase() === query.toLowerCase()
        );

        if (found) {
            setManualSelected(found);
        } else {
            const suggestionFound = productList.find(p => `${p.name} - ${p.brand}` === query);
            if (suggestionFound) {
                setManualSelected(suggestionFound);
                addProductToSale(suggestionFound);
                setManualQuery("");
            } else {
                setManualSelected(null);
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSaleForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectCustomer = (customer: Customer) => {
        setSearchTerm(customer.name)
        setSaleForm({
            customer_id: customer.customer_id,
            customer: customer.name,
            ci: customer.ci,
            phone: customer.phone,
            email: customer.email || ""
        })
        setShowSuggestions(false)
    }

    const handleModeChange = (value: "none" | "search" | "register") => {
        setMode(value)
        setSaleForm({ customer: "", ci: "", phone: "", email: "" })
        setSearchTerm("")
        setShowSuggestions(false)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (sectionFilter !== "All") {
            const categoriesInSection = productList
                .filter(p => p.section === sectionFilter)
                .map(p => p.category)
                .filter(Boolean);

            const uniqueCategories = Array.from(new Set(categoriesInSection));
            setAvailableCategories(uniqueCategories);

            if (!uniqueCategories.includes(categoryFilter)) {
                setCategoryFilter("All");
            }
        } else {
            const categories = productList.map(p => p.category).filter(Boolean);
            setAvailableCategories(Array.from(new Set(categories)));
        }
    }, [sectionFilter, productList]);

    useEffect(() => {
        if (categoryFilter !== "All") {
            const sectionsInCategory = productList
                .filter(p => p.category === categoryFilter)
                .map(p => p.section)
                .filter(Boolean);

            const uniqueSections = Array.from(new Set(sectionsInCategory));
            setAvailableSections(uniqueSections);

            if (!uniqueSections.includes(sectionFilter)) {
                setSectionFilter("All");
            }
        } else {
            const sections = productList.map(p => p.section).filter(Boolean);
            setAvailableSections(Array.from(new Set(sections)));
        }
    }, [categoryFilter, productList]);

    const confirmSale = async () => {
        if (products.length === 0) {
            toast.error("No hay productos en la venta.")
            return
        }
        if (!sellerId) {
            toast.error("No se pudo identificar al vendedor. Por favor, inicie sesión de nuevo.")
            return
        }

        try {
            const salePayload = {
                sale: {
                    seller_id: sellerId,
                    customer_id: saleForm.customer_id || null,
                    total,
                    use_current_rate: useCurrentRate_
                },
                details: products.map(p => ({
                    product_id: p.product_id,
                    quantity: p.quantity,
                    unit_price: p.sale_price
                }))
            }

            const res = await fetch(`${apiUrl}/api/sales/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(salePayload)
            })

            const data = await res.json()

            if (res.ok && data.saleId) {
                toast.success(`Venta #${data.saleId} registrada con éxito.`)
                setProducts([])
                handleModeChange("none")
            } else {
                const errorMessage = data.message
                    ? `${data.error}: ${data.message}`
                    : data.error || "Error al registrar la venta."
                toast.error(errorMessage)
                console.error(data)
            }
        } catch (err) {
            toast.error("Error inesperado al registrar la venta.")
            console.error(err)
        }
    }

    return {
        rate,
        useCurrentRate: useCurrentRate_,
        setUseCurrentRate,
        getPricing,
        products,
        productList,
        total,
        barcodeInput,
        manualQuery,
        manualSelected,
        scanning,
        mode,
        searchTerm,
        showSuggestions,
        saleForm,
        filteredCustomers,
        isNewCustomerMode,
        suggestionsRef,
        availableCategories,
        availableSections,
        categoryFilter,
        sectionFilter,
        setCategoryFilter,
        setSectionFilter,
        filteredManualOptions,
        setBarcodeInput,
        handleManualQueryChange,
        setScanning,
        setSearchTerm,
        setShowSuggestions,
        handleFormChange,
        addByBarcode,
        addManualProduct,
        updatePrice,
        updateQuantity,
        removeProduct,
        confirmSale,
        handleSelectCustomer,
        handleRegisterCustomer,
        handleModeChange,
        videoRef,
        startScanner,
        stopScanner,
        isDetailsOpen,
        selectedProduct,
        setIsDetailsOpen,
        handleViewDetails
    }
}