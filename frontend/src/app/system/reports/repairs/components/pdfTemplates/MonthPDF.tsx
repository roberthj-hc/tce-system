import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RepairsSummaryItem {
  date: string;
  total_repairs: number;
  total_profit: number;
}

interface MonthRepairsPDFProps {
  data: RepairsSummaryItem[];
  month: string;
  username: string;
}

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const MonthRepairsPDF: React.FC<MonthRepairsPDFProps> = ({ data, month, username }) => {
  const reportCreator = username;
  const generationDateTime = format(new Date(), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es });

  const totalGlobalRepairCosts = data.reduce((sum, item) => sum + item.total_repairs, 0);
  const totalGlobalProfit = data.reduce((sum, item) => sum + item.total_profit, 0);

  const firstDate = parseISO(data[0].date);
  const reportMonth = firstDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const reportMonthFormatted = capitalize(reportMonth);

  const getFormattedDateWithDay = (isoDate: string) => {
    const date = parseISO(isoDate);
    const day = capitalize(format(date, "EEEE", { locale: es }));
    const dayNumber = format(date, "dd", { locale: es });
    return `${dayNumber} - ${day}`;
  };

  return (
    <Document>
      <Page style={styles.page}>
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

        <Text style={styles.reportTitle}>REPORTE MENSUAL DE REPARACIONES</Text>
        <Text style={styles.subtitle}>Mes: {reportMonthFormatted}</Text>
        <View style={styles.reportMeta}>
          <Text>
            Generado por: <Text style={{ fontWeight: 'bold' }}>{reportCreator}</Text>
          </Text>
          <Text>el {generationDateTime}</Text>
        </View>

        {data.length > 0 ? (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={{ ...styles.tableColHeaderSummary, borderLeftWidth: 0 }}><Text style={styles.tableCellHeader}>Fecha</Text></View>
              <View style={styles.tableColHeaderSummary}><Text style={styles.tableCellHeader}>Costos Totales</Text></View>
              <View style={{ ...styles.tableColHeaderSummary, borderRightWidth: 0 }}><Text style={styles.tableCellHeader}>Efectivo Total</Text></View>
            </View>
            {data.map((item: RepairsSummaryItem, i: number) => (
              <View key={i.toString()} style={styles.tableRow}>
                <View style={{ ...styles.tableColSummary, borderLeftWidth: 0 }}>
                  <Text style={styles.tableCellLeft}>
                    {getFormattedDateWithDay(item.date)}
                  </Text>
                </View>
                <View style={styles.tableColSummary}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_repairs.toFixed(2)))} Bs</Text></View>
                <View style={{ ...styles.tableColSummary, borderRightWidth: 0 }}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_profit.toFixed(2)))} Bs</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay datos de reparaciones para este mes.</Text>
        )}

        {data.length > 0 && (
          <View style={styles.totalsSection} fixed>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL COSTOS REPARACIONES DEL MES:</Text>
              <Text style={styles.totalValue}>{totalGlobalRepairCosts.toFixed(2)} Bs</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL EFECTIVO DEL MES:</Text>
              <Text style={styles.totalValue}>{totalGlobalProfit.toFixed(2)} Bs</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default MonthRepairsPDF;