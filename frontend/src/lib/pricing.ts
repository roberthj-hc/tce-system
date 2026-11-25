// El tipo de cambio es REFERENCIAL: cada producto tiene su costo y precio en Bs registrados.
// Con el "tipo de cambio más reciente" activado, los productos con costo en USD sugieren
// costo = costo USD x tipo de cambio vigente y precio = costo x (1 + margen).
// Con el switch desactivado se usan el costo y precio con los que se registró el producto.

export type PricedProduct = {
    price: number | string
    cost: number | string
    cost_usd?: number | string | null
    margin_percent?: number | string | null
    exchange_rate?: number | string | null
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function effectivePricing(
    p: PricedProduct,
    useCurrentRate: boolean,
    rate: number | null
): { price: number; cost: number; usesRate: boolean } {
    const price = Number(p.price)
    const cost = Number(p.cost)
    const usd = p.cost_usd != null ? Number(p.cost_usd) : null
    if (!useCurrentRate || !rate || usd === null || Number.isNaN(usd)) {
        return { price, cost, usesRate: false }
    }
    const newCost = round2(usd * rate)
    if (p.margin_percent != null && !Number.isNaN(Number(p.margin_percent))) {
        return { price: round2(newCost * (1 + Number(p.margin_percent) / 100)), cost: newCost, usesRate: true }
    }
    // sin margen guardado: se escala el precio registrado según la variación del tipo de cambio
    const base = p.exchange_rate != null ? Number(p.exchange_rate) : 0
    return { price: base > 0 ? round2((price * rate) / base) : price, cost: newCost, usesRate: true }
}
