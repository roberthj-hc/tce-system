import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export type Repair = {
    repair_id: number;
    user_id: number;
    customer_id: number;
    model: string;
    total_price: number;
    deposit: number;
    spare_part_cost: number;
    balance: number;
    profit: number;
    status: string;
    received_at: string;
    delivered_at: string | null;
    description: string;
    observations: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_ci: string;
    user_name: string;
    user_email: string;
};

export type RepairDetails = {
    description: string;
    observations: string;
    received_at: string;
    delivered_at: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    user_name: string;
    user_email: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type SortableColumns = 'model' | 'total_price' | 'deposit' | 'spare_part_cost' | 'balance' | 'profit' | 'status' | 'received_at' | 'delivered_at';

export function useRepairList() {
    const [allRepairs, setAllRepairs] = useState<Repair[]>([]);
    const [edited, setEdited] = useState<Record<number, Partial<Repair>>>({});
    const [detailsMap, setDetailsMap] = useState<Record<number, RepairDetails>>({});
    const [detailsLoading, setDetailsLoading] = useState<number | null>(null);

    const [statusFilter, setStatusFilter] = useState("All");
    const [statuses, setStatuses] = useState<string[]>(["All"]);
    const [fromDate, setFromDate] = useState(getToday());
    const [toDate, setToDate] = useState(getToday());

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [columnFilter, setColumnFilter] = useState<string>("all");
    const [sortColumn, setSortColumn] = useState<SortableColumns | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        const fetchRepairs = async () => {
            try {
                const params = new URLSearchParams();
                params.append("from", fromDate);
                params.append("to", toDate);
                const res = await fetch(`${apiUrl}/api/repairs/list-detailed?${params.toString()}`);
                const data: Repair[] = await res.json();
                setAllRepairs(Array.isArray(data) ? data : []);
                const uniqueStatuses = Array.from(new Set(data.map(r => r.status)));
                setStatuses(["All", ...uniqueStatuses]);
            } catch {
                toast.error("Error al cargar reparaciones");
            }
        };
        fetchRepairs();
    }, [fromDate, toDate]);


    const filteredRepairs = useMemo(() => {
        let result = allRepairs;
        if (statusFilter !== "All") {
            result = result.filter(r => r.status === statusFilter);
        }
        if (search) {
            const lowercasedSearch = search.toLowerCase();
            result = result.filter(r => {
                const getField = (field: string) => {
                    const repair = r as any;
                    switch (field) {
                        case 'model': return repair.model;
                        case 'total': return repair.total_price;
                        case 'deposito': return repair.deposit;
                        case 'repuesto': return repair.spare_part_cost;
                        case 'saldo': return repair.balance;
                        case 'efectivo': return repair.profit;
                        case 'nombre del cliente': return repair.customer_name;
                        case 'email del cliente': return repair.customer_email;
                        case 'numero del cliente': return repair.customer_phone;
                        case 'ci del cliente': return repair.customer_ci;
                        default: return '';
                    }
                };
                const fieldsToSearch = columnFilter === 'all'
                    ? ['model', 'total', 'deposito', 'repuesto', 'saldo', 'efectivo', 'nombre del cliente', 'email del cliente', 'numero del cliente', 'ci del cliente']
                    : [columnFilter];

                return fieldsToSearch.some(field => {
                    const value = getField(field);
                    return String(value).toLowerCase().includes(lowercasedSearch);
                });
            });
        }
        return result;
    }, [allRepairs, statusFilter, search, columnFilter]);

    const sortedRepairs = useMemo(() => {
        if (!sortColumn) return filteredRepairs;

        return [...filteredRepairs].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue || '').toLowerCase();
            const bString = String(bValue || '').toLowerCase();

            if (sortDirection === 'asc') {
                return aString.localeCompare(bString);
            } else {
                return bString.localeCompare(aString);
            }
        });
    }, [filteredRepairs, sortColumn, sortDirection]);

    const totalPages = Math.ceil(sortedRepairs.length / perPage);
    const paginatedRepairs = sortedRepairs.slice((page - 1) * perPage, page * perPage);

    const summary = useMemo(() => {
        return {
            totalSparePartCost: sortedRepairs.reduce((sum, r) => sum + Number(r.spare_part_cost || 0), 0),
            totalProfit: sortedRepairs.reduce((sum, r) => {
                if (r.status === 'delivered') {
                    return sum + Number(r.profit || 0);
                } else {
                    return sum - Number(r.spare_part_cost || 0);
                }
            }, 0),
            count: sortedRepairs.length,
            total: sortedRepairs.reduce((sum, r) => sum + Number(r.total_price || 0), 0),
        };
    }, [sortedRepairs]);

    const handleEditChange = (id: number, field: keyof Repair, value: string | number) => {
        setEdited(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
        if (field === "status") {
            fetch(`${apiUrl}/api/repairs/update-status/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: value })
            }).then(res => {
                if (res.ok) {
                    toast.success("Estado actualizado");
                    setAllRepairs(prev =>
                        prev.map(repair =>
                            repair.repair_id === id
                                ? {
                                    ...repair,
                                    status: value as string,
                                    delivered_at: value === "delivered" ? new Date().toISOString() : null
                                }
                                : repair
                        )
                    );
                } else {
                    toast.error("Error al actualizar el estado");
                }
            }).catch(() => toast.error("Error del servidor"));
        }
    };

    const confirmChanges = async (id: number) => {
        const changes = edited[id];
        if (!changes) return;
        const filteredChanges = Object.fromEntries(
            Object.entries(changes)
                .filter(([_, value]) => value !== undefined && value !== null)
                .filter(([key]) => key !== "status")
        );
        try {
            const res = await fetch(`${apiUrl}/api/repairs/update-fields/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filteredChanges)
            });
            const updatedRepair: Repair = await res.json();
            if (res.ok) {
                toast.success("Cambios guardados");
                setAllRepairs(prev =>
                    prev.map(r =>
                        r.repair_id === id
                            ? { ...r, ...updatedRepair }
                            : r
                    )
                );
                setEdited(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                });
            } else {
                toast.error("Error al guardar cambios");
            }
        } catch {
            toast.error("Error del servidor");
        }
    };

    const getRepairDetails = async (id: number) => {
        return;
    };

    const handleSort = (column: SortableColumns) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return {
        repairs: paginatedRepairs,
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
    };
}