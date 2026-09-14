"use client"

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card"
import {
  TrendingUp,
  PackageX,
  Boxes,
  LineChart,
  PieChart as Donut,
  ArrowDown10,
  ArrowUp10
} from "lucide-react"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as ReLineChart,
  Line
} from "recharts"

import { useDashboard } from "./useDashboard"
import { useAuth } from "@/context/AuthContext"

export function Dashboard() {
  const {
    loading,
    summary,
    categorySales,
    weeklySales,
    totalStock,
    topSelling,
    lowestStock
  } = useDashboard()

  const { user } = useAuth()
  const userRole = user?.role_id

  const pieColors = [
    "#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f43f5e", "#22c55e", "#eab308"
  ]

  if (loading) return <div>Cargando dashboard...</div>

  return (
    <>
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        {userRole === 1 && (
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Ventas de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-green-600 p-0 pt-4">
              ${summary.salesToday.toFixed(2)}
            </CardContent>
          </Card>
        )}

        {(userRole === 1 || userRole === 2) && (
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <PackageX className="w-5 h-5 text-red-500" />
                Alertas de Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-red-600 p-0 pt-4">
              {summary.lowStockAlerts} items
            </CardContent>
          </Card>
        )}

        {(userRole === 1 || userRole === 2) && (
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-500" />
                Productos Destacados
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1 p-0 pt-4">
              {summary.topProducts.map((p) => (
                <div key={p.name}>{p.name} ({p.sales} ventas)</div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {userRole === 1 && (
        <>
          <div className="grid auto-rows-min gap-6 md:grid-cols-2 mt-6">
            <Card className="p-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Ventas por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 p-0 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <Donut className="w-5 h-5 text-purple-500" />
                  Distribución de Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 p-0 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalStock}
                      dataKey="stock"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                    >
                      {totalStock.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Ventas Semanales
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={weeklySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
                </ReLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid auto-rows-min gap-6 md:grid-cols-2 mt-6">
        {(userRole === 1 || userRole === 2) && (
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <ArrowDown10 className="w-5 h-5 text-red-500" />
                Productos con Stock Más Bajo
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={lowestStock}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {(userRole === 1 || userRole === 2) && (
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-2">
                <ArrowUp10 className="w-5 h-5 text-green-500" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}