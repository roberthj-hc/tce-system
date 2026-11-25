import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast as sonner } from "sonner"
import { useCurrentRate } from "@/hooks/useCurrentRate"
import { effectivePricing } from "@/lib/pricing"

export type Product = {
    product_id: number
    name: string
    barcode: string
    brand: string
    price: number
    cost: number
    cost_usd: number | null
    margin_percent: number | null
    exchange_rate: number | null
    stock: number
    stock_minimum: number
    photo: string
    description: string
    active: boolean
    category: string
    category_id: number
    section: string
    supplier: string
    supplier_id: number
}

export type Category = {
    category_id: number
    name: string
    description: string
}

export type ColumnFilter = "all" | keyof Pick<Product, 'name' | 'brand' | 'barcode' | 'supplier' | 'category' | 'description' | 'price' | 'cost' | 'stock'>;

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useProductList() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [categories, setCategories] = useState<Category[]>([])
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [rawProducts, setProducts] = useState<Product[]>([])
    // Switch de tipo de cambio más reciente (activado por defecto): solo cambia lo que se muestra
    const rate = useCurrentRate()
    const [useCurrentRateSwitch, setUseCurrentRateSwitch] = useState(true)
    const products = rawProducts.map((p) => {
        const e = effectivePricing(p, useCurrentRateSwitch, rate)
        return e.usesRate ? { ...p, price: e.price, cost: e.cost } : p
    })
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active")
    const [columnFilter, setColumnFilter] = useState<ColumnFilter>("all")
    const [sectionFilter, setSectionFilter] = useState("All");
    const [sections, setSections] = useState<string[]>([]);

    const [sortColumn, setSortColumn] = useState<keyof Product | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: keyof Product) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(`${apiUrl}/api/categories/list`)
                const data = await res.json()
                if (!Array.isArray(data)) {
                    sonner.error("No se pudo cargar la lista de categorías")
                    setCategories([])
                } else {
                    setCategories(data)
                }
            } catch {
                sonner.error("Error al cargar categorías")
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/products/list?status=${statusFilter}`)
                const data: Product[] = await res.json()
                if (!Array.isArray(data)) {
                    sonner.error("No se pudo cargar la lista de productos")
                    setProducts([])
                } else {
                    setProducts(data)
                }
            } catch {
                sonner.error("Error al cargar productos")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [statusFilter])

    useEffect(() => {
        const validSections = rawProducts
            .map(p => p.section)
            .filter((section): section is string => typeof section === "string" && section.trim() !== "");

        const uniqueSections = [...new Set(validSections)];
        setSections(uniqueSections);
    }, [rawProducts]);

    const filtered = products.filter((p) => {
        let textMatch = false;
        if (!search) {
            textMatch = true;
        } else {
            const lowercasedSearch = search.toLowerCase();
            if (columnFilter === "all") {
                textMatch =
                    p.name.toLowerCase().includes(lowercasedSearch) ||
                    p.brand.toLowerCase().includes(lowercasedSearch) ||
                    p.barcode.toLowerCase().includes(lowercasedSearch) ||
                    p.supplier.toLowerCase().includes(lowercasedSearch) ||
                    p.description.toLowerCase().includes(lowercasedSearch) ||
                    p.category.toLowerCase().includes(lowercasedSearch) ||
                    String(p.price).includes(lowercasedSearch) ||
                    String(p.cost).includes(lowercasedSearch) ||
                    String(p.stock).includes(lowercasedSearch);
            } else {
                const valueToFilter = String(p[columnFilter as keyof Product]).toLowerCase();
                textMatch = valueToFilter.includes(lowercasedSearch);
            }
        }
        const categoryMatch = categoryFilter === "All" || p.category === categoryFilter
        const sectionMatch = sectionFilter === "All" || p.section === sectionFilter;

        return textMatch && categoryMatch && sectionMatch;
    })

    const sortedProducts = [...filtered];

    if (sortColumn) {
        sortedProducts.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            const aString = String(aValue || '');
            const bString = String(bValue || '');

            if (sortDirection === 'asc') {
                return aString.localeCompare(bString);
            } else {
                return bString.localeCompare(aString);
            }
        });
    }

    const totalPages = Math.ceil(sortedProducts.length / perPage);
    const visible = sortedProducts.slice((page - 1) * perPage, page * perPage);

    const handleEdit = (product: Product) => {
        router.push(`/system/products/register?edit=1&id=${product.product_id}`)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return
        try {
            const res = await fetch(`${apiUrl}/api/products/delete/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setProducts(prev => prev.filter(p => p.product_id !== id))
                sonner.success("Producto eliminado exitosamente")
            } else {
                const data = await res.json()
                sonner.error(data?.error || "Error al eliminar el producto")
            }
        } catch {
            sonner.error("Error del servidor")
        }
    }

    const mostPopularCategory = (() => {
        const map: Record<string, number> = {}
        filtered.forEach((p) => {
            map[p.category] = (map[p.category] || 0) + 1
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    })()

    const totalStock = filtered.reduce((acc, p) => acc + p.stock, 0)
    const averageStock = Math.round(totalStock / Math.max(filtered.length, 1))

    return {
        rate,
        useCurrentRateSwitch,
        setUseCurrentRateSwitch,
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        categories,
        sectionFilter,
        setSectionFilter,
        sections,
        page,
        setPage,
        perPage,
        setPerPage,
        products: visible,
        totalPages,
        loading,
        statusFilter,
        setStatusFilter,
        handleEdit,
        handleDelete,
        mostPopularCategory,
        totalStock,
        averageStock,
        filteredCount: filtered.length,
        columnFilter,
        setColumnFilter,
        handleSort,
        sortColumn,
        sortDirection,
    }
}