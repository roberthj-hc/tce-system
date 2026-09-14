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
import { useSalesReport } from './useSalesReport'
import { useAuth } from "@/context/AuthContext"

interface SalesSummaryItem {
  date: string
  total_sales: number
  total_profit: number
}

interface SalesDetailedItem {
  sale_id: number
  seller_name: string
  sale_date: string
  total_sale: number
  total_profit: number
  products: {
    product_name: string
    category_name: string
    quantity: number
    unit_price: number
    cost: number
    profit: number
  }[]
}

interface SalesDailySummaryItem {
  sale_id: number
  sale_date: string
  sale_time: string
  seller_name: string
  total_sale: number
  total_profit: number
  section_name: string
  section_id: number
}

interface SectionSummary {
  section_id: number
  section_name: string
  sales: SalesDailySummaryItem[]
  total_section_sale: number
  total_section_profit: number
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

function groupDailySummaryBySection(dailySummary: SalesDailySummaryItem[]): SectionSummary[] {
  const sectionsMap = new Map<number, SectionSummary>();
  dailySummary.forEach(sale => {
    const sectionId = sale.section_id;
    const totalSale = Number(sale.total_sale || 0);
    const totalProfit = Number(sale.total_profit || 0);
    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        section_id: sectionId,
        section_name: sale.section_name || 'Sin Sección',
        sales: [],
        total_section_sale: 0,
        total_section_profit: 0,
      });
    }
    const section = sectionsMap.get(sectionId)!;
    section.sales.push(sale);
    section.total_section_sale += totalSale;
    section.total_section_profit += totalProfit;
  });

  return Array.from(sectionsMap.values());
}

export default function SalesReport() {
  const [reportType, setReportType] = useState<'day' | 'month' | 'year'>('day')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'))
  const [isDetailed, setIsDetailed] = useState(false)

  const [dailySummary, setDailySummary] = useState<SalesDailySummaryItem[]>([])
  const [dailyDetailed, setDailyDetailed] = useState<SalesDetailedItem[]>([])
  const [generalReport, setGeneralReport] = useState<SalesSummaryItem[]>([])

  const { loading, error, fetchReportRaw } = useSalesReport()
  const [hasQueried, setHasQueried] = useState(false)

  const { user } = useAuth()

  const clearReportData = () => {
    setDailySummary([])
    setDailyDetailed([])
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

    const data = await fetchReportRaw(from, to, reportType, isDetailed)

    if (error) {
      toast.error("Error al generar el reporte", { description: error });
    } else if (!data || data.length === 0) {
      toast.info("No se encontraron resultados para el reporte.", { icon: "📊" });
    } else {
      toast.success("Reporte generado exitosamente!");
    }


    if (reportType === 'day') {
      if (isDetailed) {
        setDailyDetailed(data as SalesDetailedItem[])
      } else {
        setDailySummary(data as SalesDailySummaryItem[])
      }
    } else {
      setGeneralReport(data as SalesSummaryItem[])
    }

    setHasQueried(true)
  }

  const groupedDailySummary = useMemo(() => {
    if (reportType === 'day' && !isDetailed && dailySummary.length > 0) {
      return groupDailySummaryBySection(dailySummary);
    }
    return [];
  }, [reportType, isDetailed, dailySummary]);

  const getReportTitle = useMemo(() => {
    switch (reportType) {
      case 'day':
        return `Reporte del Día - ${isDetailed ? 'Detallado' : 'Resumen por Sección'}` 
      case 'month':
        const monthDate = selectedMonth ? parse(selectedMonth, 'yyyy-MM', new Date()) : new Date()
        return `Reporte del Mes de ${format(monthDate, 'MMMM yyyy', { locale: es })}`
      case 'year':
        return `Reporte del Año ${selectedYear}`
      default:
        return 'Reporte de Ventas'
    }
  }, [reportType, isDetailed, selectedMonth, selectedYear])

  const report =
    reportType === 'day'
      ? isDetailed
        ? dailyDetailed
        : dailySummary
      : generalReport

  const totalGlobalSales = useMemo(() => {
    if (reportType === 'day' && !isDetailed) {
      return dailySummary.reduce((sum, item) => sum + item.total_sale, 0);
    } else if (reportType === 'day' && isDetailed) {
      return dailyDetailed.reduce((sum, sale) => sum + sale.total_sale, 0);
    } else {
      return generalReport.reduce((sum, item) => sum + item.total_sales, 0);
    }
  }, [reportType, isDetailed, dailySummary, dailyDetailed, generalReport]);

  const totalGlobalProfit = useMemo(() => {
    if (reportType === 'day' && !isDetailed) {
      return dailySummary.reduce((sum, item) => sum + item.total_profit, 0);
    } else if (reportType === 'day' && isDetailed) {
      return dailyDetailed.reduce((sum, sale) => sum + sale.total_profit, 0);
    } else {
      return generalReport.reduce((sum, item) => sum + item.total_profit, 0);
    }
  }, [reportType, isDetailed, dailySummary, dailyDetailed, generalReport]);


  return (
    <div className="min-h-screen p-2 w-full bg-background text-foreground flex justify-center">
      <div className="w-full mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Reporte de Ventas</h1>
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
                  setIsDetailed(false);
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

              {reportType === 'day' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Vista del Reporte</label>
                  <div className="flex gap-3">
                    <Button
                      variant={!isDetailed ? 'default' : 'outline'}
                      onClick={() => {
                        setIsDetailed(false);
                        clearReportData();
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Resumen
                    </Button>
                    <Button
                      variant={isDetailed ? 'default' : 'outline'}
                      onClick={() => {
                        setIsDetailed(true);
                        clearReportData();
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Detallado
                    </Button>
                  </div>
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
                isDetailed={isDetailed}
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                username={user?.name || "Usuario desconocido"}
              />
            </CardHeader>
            <CardContent className="p-6">
              {reportType === 'day' && isDetailed ? (
                <div className="space-y-6">
                  {dailyDetailed.map((sale, index) => (
                    <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="bg-muted/50 p-4 border-b border-border">
                        <CardTitle className="flex flex-wrap justify-between items-center text-base">
                          <span className="font-semibold">Venta #{sale.sale_id} - {sale.seller_name}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            Total: <span className="font-bold text-primary">{formatSmartNumber(Number(sale.total_sale.toFixed(2)))} Bs</span>
                            <span className="h-4 w-[1px] bg-border mx-1" />
                            Efectivo: <span className="font-bold text-green-600">{formatSmartNumber(Number(sale.total_profit.toFixed(2)))} Bs</span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-muted">
                            <TableRow>
                              <TableHead className="w-[30%]">Producto</TableHead>
                              <TableHead className="w-[20%]">Categoría</TableHead>
                              <TableHead className="w-[15%]">Cantidad</TableHead>
                              <TableHead className="text-right w-[15%]">Precio Unitario</TableHead>
                              <TableHead className="text-right w-[20%]">Efectivo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="[&_tr:last-child]:border-0">
                            {Array.isArray(sale.products) && sale.products.map((p, pIndex) => (
                              <TableRow key={pIndex} className="hover:bg-accent/50">
                                <TableCell className="font-medium">{p.product_name}</TableCell>
                                <TableCell>{p.category_name}</TableCell>
                                <TableCell>{p.quantity}</TableCell>
                                <TableCell className="text-right">{formatSmartNumber(Number(p.unit_price.toFixed(2)))} Bs</TableCell>
                                <TableCell className="text-right">{formatSmartNumber(Number(p.profit.toFixed(2)))} Bs</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) :
                reportType === 'day' && !isDetailed ? (
                  <div className="space-y-6">
                    {groupedDailySummary.map((sectionSummary) => (
                      <div key={sectionSummary.section_id} className="border p-4 rounded-lg bg-card shadow-sm">
                        <h3 className="text-xl font-bold mb-3 border-b pb-2 text-primary flex justify-between items-center">
                          <span>Sección: {sectionSummary.section_name}</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            Ventas: <span className="text-primary font-bold">{formatSmartNumber(Number(sectionSummary.total_section_sale.toFixed(2)))} Bs</span> |
                            Efectivo: <span className="text-green-600 font-bold">{formatSmartNumber(Number(sectionSummary.total_section_profit.toFixed(2)))} Bs</span>
                          </span>
                        </h3>
                        <Table className="min-w-full">
                          <TableCaption>Resumen de ventas para la sección: **{sectionSummary.section_name}**</TableCaption>
                          <TableHeader className="bg-muted">
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Hora</TableHead>
                              <TableHead>Vendedor</TableHead>
                              <TableHead className="text-right">Total Venta</TableHead>
                              <TableHead className="text-right">Efectivo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="[&_tr:last-child]:border-0">
                            {sectionSummary.sales.map((sale, index) => (
                              <TableRow key={index} className="hover:bg-accent/50">
                                <TableCell className="font-medium">{sale.sale_id}</TableCell>
                                <TableCell>{sale.sale_time.slice(0, 5)}</TableCell>
                                <TableCell>{sale.seller_name}</TableCell>
                                <TableCell className="text-right">{formatSmartNumber(Number(sale.total_sale.toFixed(2)))} Bs</TableCell>
                                <TableCell className="text-right">{formatSmartNumber(Number(sale.total_profit.toFixed(2)))} Bs</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-primary/10 font-bold border-t-2 border-primary/50 hover:bg-primary/10">
                              <TableCell colSpan={3} className="text-right">Total de {sectionSummary.section_name}:</TableCell>
                              <TableCell className="text-right text-primary">{formatSmartNumber(Number(sectionSummary.total_section_sale.toFixed(2)))} Bs</TableCell>
                              <TableCell className="text-right text-green-600 dark:text-green-400">{formatSmartNumber(Number(sectionSummary.total_section_profit.toFixed(2)))} Bs</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) :
                  (
                    <Table className="min-w-full">
                      <TableCaption>
                        {reportType === 'month' ? 'Ventas por día para el mes seleccionado.' : 'Ventas por mes para el año seleccionado.'}
                      </TableCaption>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>{reportType === 'year' ? 'Mes' : 'Fecha'}</TableHead>
                          <TableHead className="text-right">Ventas Totales</TableHead>
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
                            <TableCell className="text-right">{formatSmartNumber(Number(item.total_sales.toFixed(2)))} Bs</TableCell>
                            <TableCell className="text-right">{formatSmartNumber(Number(item.total_profit.toFixed(2)))} Bs</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

              <div className="mt-8 pt-6 border-t-2 border-border flex flex-col sm:flex-row justify-end gap-4 text-lg font-bold">
                <div className="flex items-center gap-2 text-foreground">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span>Total Ventas Globales:</span>
                  <span className="text-primary">{formatSmartNumber(Number(totalGlobalSales.toFixed(2)))} Bs</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span>Total Efectivo Global:</span>
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
