"use client"

import { useState, useMemo } from 'react'
import { parseISO, format, startOfMonth, endOfMonth, startOfYear, endOfYear, parse } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText, Loader2, CalendarDays, DollarSign, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { es } from 'date-fns/locale'
import { ReportDownloadButton } from './components/ReportDownloadButton'
import { useRepairsReport } from './useRepairsReport'
import { useAuth } from "@/context/AuthContext"

interface RepairSummaryItem {
  date: string
  total_repairs: number
  total_profit: number
}

interface RepairDailySummaryItem {
  repair_id: number
  repair_date: string
  repair_time: string
  technician_name: string
  customer_name: string
  model: string
  description: string
  observations: string
  status: string
  total_price: number
  spare_part_cost: number
  total_profit: number
}

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatDateWithDay = (isoDate: string) => {
  const date = parseISO(isoDate);
  const day = capitalize(format(date, 'EEEE', { locale: es }));
  const dayNumber = format(date, 'dd', { locale: es });
  return `${dayNumber} - ${day}`;
};

const formatMonthLabel = (isoDate: string) => {
  const date = parseISO(isoDate);
  return capitalize(format(date, 'MMMM', { locale: es }));
};

export default function RepairsReport() {
  const [reportType, setReportType] = useState<'day' | 'month' | 'year'>('day')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'))

  const [dailySummary, setDailySummary] = useState<RepairDailySummaryItem[]>([])
  const [generalReport, setGeneralReport] = useState<RepairSummaryItem[]>([])

  const { loading, error, fetchReportRaw } = useRepairsReport()
  const [hasQueried, setHasQueried] = useState(false)

  const { user } = useAuth()

  const clearReportData = () => {
    setDailySummary([])
    setGeneralReport([])
    setHasQueried(false)
  }

  const handleGenerateReport = async () => {
    clearReportData();
    let from, to
    switch (reportType) {
      case 'day':
        from = selectedDate
        to = selectedDate
        break
      case 'month':
        const parsedMonth = parse(selectedMonth, 'yyyy-MM', new Date())
        const localMonth = new Date(parsedMonth.getFullYear(), parsedMonth.getMonth(), 1)
        from = format(startOfMonth(localMonth), 'yyyy-MM-dd')
        to = format(endOfMonth(localMonth), 'yyyy-MM-dd')
        break
      case 'year':
        const parsedYear = parse(`${selectedYear}`, 'yyyy', new Date())
        const localYear = new Date(parsedYear.getFullYear(), 0, 1)
        from = format(startOfYear(localYear), 'yyyy-MM-dd')
        to = format(endOfYear(localYear), 'yyyy-MM-dd')
        break
      default:
        return
    }

    toast.info("Generando reporte...", { icon: <Loader2 className="animate-spin" /> });

    const data = await fetchReportRaw(from, to, reportType)

    if (error) {
      toast.error("Error al generar el reporte", { description: error });
    } else if (!data || data.length === 0) {
      toast.info("No se encontraron resultados para el reporte.", { icon: "📊" });
    } else {
      toast.success("Reporte generado exitosamente!");
    }

    if (reportType === 'day') {
      setDailySummary(data as RepairDailySummaryItem[])
    } else {
      setGeneralReport(data as RepairSummaryItem[])
    }

    setHasQueried(true)
  }

  const getReportTitle = useMemo(() => {
    switch (reportType) {
      case 'day':
        return `Reporte del Día`
      case 'month':
        const monthDate = selectedMonth ? parse(selectedMonth, 'yyyy-MM', new Date()) : new Date()
        return `Reporte del Mes de ${format(monthDate, 'MMMM yyyy', { locale: es })}`
      case 'year':
        return `Reporte del Año ${selectedYear}`
      default:
        return 'Reporte de Reparaciones'
    }
  }, [reportType, selectedMonth, selectedYear])

  const report =
    reportType === 'day'
      ? dailySummary
      : generalReport

  const totalGlobalRepairs = useMemo(() => {
    if (reportType === 'day') {
      return dailySummary.reduce((sum, item) => sum + item.total_price, 0);
    } else {
      return generalReport.reduce((sum, item) => sum + item.total_repairs, 0);
    }
  }, [reportType, dailySummary, generalReport]);

  const totalGlobalProfit = useMemo(() => {
    if (reportType === 'day') {
      return dailySummary.reduce((sum, item) => {
        if (item.status === 'delivered') {
          return sum + item.total_profit;
        } else {
          return sum - item.spare_part_cost; // si no se entrega se resta el repuesto
        }
      }, 0);
    } else {
      return generalReport.reduce((sum, item) => sum + item.total_profit, 0);
    }
  }, [reportType, dailySummary, generalReport]);

  return (
    <div className="min-h-screen p-2 w-full bg-background text-foreground flex justify-center">
      <div className="w-full mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Reporte de Reparaciones</h1>
        </div>

        <Card className="shadow-lg border-border rounded-xl">
          <CardHeader className="text-muted-foreground rounded-t-xl py-4 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CalendarDays className="h-6 w-6" /> Configuración del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label htmlFor="report-type" className="block text-sm font-semibold text-foreground">Tipo de Reporte</label>
                <Select value={reportType} onValueChange={(value) => {
                  setReportType(value as 'day' | 'month' | 'year');
                  clearReportData();
                }}>
                  <SelectTrigger id="report-type" className="w-full bg-input border-border">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="day">Día</SelectItem>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="year">Año</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'day' && (
                <div className="space-y-2">
                  <label htmlFor="select-date" className="block text-sm font-semibold text-foreground">Seleccionar Fecha</label>
                  <Input
                    type="date"
                    id="select-date"
                    value={selectedDate}
                    onChange={e => {
                      setSelectedDate(e.target.value)
                      clearReportData()
                    }}
                    className="bg-input border-border"
                  />
                </div>
              )}
              {reportType === 'month' && (
                <div className="space-y-2">
                  <label htmlFor="select-month" className="block text-sm font-semibold text-foreground">Seleccionar Mes</label>
                  <Input
                    type="month"
                    id="select-month"
                    value={selectedMonth}
                    onChange={e => {
                      setSelectedMonth(e.target.value)
                      clearReportData()
                    }}
                    className="bg-input border-border"
                  />
                </div>
              )}
              {reportType === 'year' && (
                <div className="space-y-2">
                  <label htmlFor="select-year" className="block text-sm font-semibold text-foreground">Seleccionar Año</label>
                  <Input
                    type="number"
                    id="select-year"
                    value={selectedYear}
                    onChange={e => {
                      setSelectedYear(e.target.value)
                      clearReportData()
                    }}
                    min="2000"
                    max={new Date().getFullYear()}
                    className="bg-input border-border"
                  />
                </div>
              )}

              <div className="col-span-1 md:col-span-3 lg:col-span-1 flex justify-end items-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full px-8 py-2 text-lg bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" /> Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-md text-center shadow-sm">
            <p className="font-medium">¡Error!</p>
            <p>{error}</p>
          </div>
        )}

        {hasQueried && !loading && Array.isArray(report) && report.length === 0 && (
          <Card className="shadow-lg border-l-4 border-yellow-500 bg-yellow-50/20 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            <CardContent className="p-4 text-center flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" /> No se encontraron resultados para los criterios seleccionados.
            </CardContent>
          </Card>
        )}

        {Array.isArray(report) && report.length > 0 && (
          <Card className="shadow-lg border-border rounded-xl">
            <CardHeader className="text-muted-foreground rounded-t-xl py-4 flex-row justify-between items-center border-b">
              <CardTitle className="text-xl">{getReportTitle}</CardTitle>
              <ReportDownloadButton
                report={report}
                reportType={reportType}
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                username={user?.name || "Usuario desconocido"}
              />
            </CardHeader>
            <CardContent className="p-6">
              {reportType === 'day' ? (
                <Table className="min-w-full">
                  <TableCaption>Resumen de reparaciones para el día seleccionado.</TableCaption>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Efectivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr:last-child]:border-0">
                    {dailySummary.map((repair, index) => (
                      <TableRow key={index} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{repair.repair_id}</TableCell>
                        <TableCell>{repair.repair_time.slice(0, 5)}</TableCell>
                        <TableCell>{repair.technician_name}</TableCell>
                        <TableCell>{repair.description}</TableCell>
                        <TableCell>{repair.status}</TableCell>
                        <TableCell className="text-right">{formatSmartNumber(Number(repair.total_price.toFixed(2)))} Bs</TableCell>
                        <TableCell className="text-right">{formatSmartNumber(Number(repair.total_profit.toFixed(2)))} Bs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table className="min-w-full">
                  <TableCaption>
                    {reportType === 'month' ? 'Reparaciones por día para el mes seleccionado.' : 'Reparaciones por mes para el año seleccionado.'}
                  </TableCaption>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>{reportType === 'year' ? 'Mes' : 'Fecha'}</TableHead>
                      <TableHead className="text-right">Reparaciones Totales</TableHead>
                      <TableHead className="text-right">Efectivo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr:last-child]:border-0">
                    {generalReport.map((item, index) => (
                      <TableRow key={index} className="hover:bg-accent/50">
                        <TableCell className="font-medium">
                          {reportType === 'year'
                            ? formatMonthLabel(item.date)
                            : formatDateWithDay(item.date)}
                        </TableCell>
                        <TableCell className="text-right">{formatSmartNumber(Number(item.total_repairs.toFixed(2)))} Bs</TableCell>
                        <TableCell className="text-right">{formatSmartNumber(Number(item.total_profit.toFixed(2)))} Bs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="mt-8 pt-6 border-t-2 border-border flex flex-col sm:flex-row justify-end gap-4 text-lg font-bold">
                <div className="flex items-center gap-2 text-foreground">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span>Total Reparaciones:</span>
                  <span className="text-primary">{formatSmartNumber(Number(totalGlobalRepairs.toFixed(2)))} Bs</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span>Total Efectivo:</span>
                  <span className="text-green-600 dark:text-green-400">{formatSmartNumber(Number(totalGlobalProfit.toFixed(2)))} Bs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}