import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface SalesDailySummaryItem {
  sale_id: number;
  sale_date: string;
  sale_time: string;
  seller_name: string;
  total_sale: number;
  total_profit: number;
  section_name: string;
  section_id: number;
}

interface SectionSummary {
  section_id: number;
  section_name: string;
  sales: SalesDailySummaryItem[];
  total_section_sale: number;
  total_section_profit: number;
}

interface DaySalesListPDFProps {
  data: SalesDailySummaryItem[];
  date: string;
  username: string;
}

function formatSmartNumber(value: number): string {
  const numValue = Number(value);
  return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2)
}

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


const DaySalesListPDF: React.FC<DaySalesListPDFProps> = ({ data, date, username }) => {
  const reportCreator = username;
  const generationDateTime = format(new Date(), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es });
  const fullDate = format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const groupedData = groupDailySummaryBySection(data);
  const totalGlobalSales = data.reduce((sum, sale) => sum + sale.total_sale, 0);
  const totalGlobalProfit = data.reduce((sum, sale) => sum + sale.total_profit, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerSection}>
          <Text style={styles.companyName}>TCE</Text>
          <Text style={styles.branchInfo}>CASA MATRIZ</Text>
          <Text style={styles.branchInfo}>No. Punto de Venta 0</Text>
          <Text style={styles.branchInfo}>ENTRE AV. A Y CALLE F, A UNA TIENDA</Text>
          <Text style={styles.branchInfo}>ESTA LA PASTELERIA DELIS BOLIVIA</Text>
          <Text style={styles.branchInfo}>Nro.: 405 Zona/Barrio.: CALUYO</Text>
          <Text style={styles.branchInfo}>Teléfono: -</Text>
          <Text style={styles.branchInfo}>LA PAZ</Text>
        </View>
        <Text style={styles.reportTitle}>REPORTE RESUMEN DE VENTAS POR SECCIÓN</Text>
        <Text style={styles.subtitle}>{fullDate}</Text>
        <View style={styles.reportMeta}>
          <Text>
            Generado por: <Text style={{ fontWeight: 'bold' }}>{reportCreator}</Text>
          </Text>
          <Text>el {generationDateTime}</Text>
        </View>

        {groupedData.length > 0 ? (
          <View>
            {groupedData.map((section, sectionIndex) => (
              <React.Fragment key={section.section_id.toString()}>
                <View break={sectionIndex > 0}>
                  <View style={styles.sectionHeaderBox}>
                    <Text style={styles.sectionTitle}>Sección: {section.section_name.toUpperCase()}</Text>
                    <View style={styles.sectionTotalsSummary}>
                      <Text style={styles.sectionTotalLabel}>Ventas Sec.:</Text>
                      <Text style={styles.sectionTotalValue}>{formatSmartNumber(section.total_section_sale)} Bs</Text>
                      <Text style={styles.sectionTotalLabel}>Efectivo Sec.:</Text>
                      <Text style={styles.sectionTotalValueProfit}>{formatSmartNumber(section.total_section_profit)} Bs</Text>
                    </View>
                  </View>
                  <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                      <View style={{ ...styles.tableColHeaderSmall, borderLeftWidth: 0 }}>
                        <Text style={styles.tableCellHeader}>ID Venta</Text>
                      </View>
                      <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>Hora</Text>
                      </View>
                      <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Vendedor</Text>
                      </View>
                      <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>Total Venta</Text>
                      </View>
                      <View style={{ ...styles.tableColHeaderSmall, borderRightWidth: 0 }}>
                        <Text style={styles.tableCellHeader}>Efectivo</Text>
                      </View>
                    </View>

                    {section.sales.map((item, i) => (
                      <View key={i.toString()} style={styles.tableRow}>
                        <View style={{ ...styles.tableColSmall, borderLeftWidth: 0 }}>
                          <Text style={styles.tableCell}>{item.sale_id}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                          <Text style={styles.tableCell}>{item.sale_time.slice(0, 5)}</Text>
                        </View>
                        <View style={styles.tableCol}>
                          <Text style={styles.tableCell}>{item.seller_name}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                          <Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_sale))} Bs</Text>
                        </View>
                        <View style={{ ...styles.tableColSmall, borderRightWidth: 0 }}>
                          <Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_profit))} Bs</Text>
                        </View>
                      </View>
                    ))}
                    <View style={[styles.tableRow, styles.sectionTotalRow]}>
                      <View style={{ ...styles.tableCol, width: '70%', borderLeftWidth: 0, flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={styles.sectionTotalCellLabel}>TOTAL {section.section_name.toUpperCase()}:</Text>
                      </View>
                      <View style={styles.tableColSmall}>
                        <Text style={styles.sectionTotalCellValue}>{formatSmartNumber(section.total_section_sale)} Bs</Text>
                      </View>
                      <View style={{ ...styles.tableColSmall, borderRightWidth: 0 }}>
                        <Text style={styles.sectionTotalCellValueProfit}>{formatSmartNumber(section.total_section_profit)} Bs</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay datos resumidos de ventas para este día.</Text>
        )}

        {groupedData.length > 0 && (
          <View style={styles.globalTotalsSection}>
            <Text style={styles.globalTotalsTitle}>RESUMEN TOTAL DEL DÍA</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL VENTAS GLOBALES:</Text>
              <Text style={styles.totalValue}>{formatSmartNumber(totalGlobalSales)} Bs</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL EFECTIVO GLOBAL:</Text>
              <Text style={styles.totalValueProfit}>{formatSmartNumber(totalGlobalProfit)} Bs</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default DaySalesListPDF;