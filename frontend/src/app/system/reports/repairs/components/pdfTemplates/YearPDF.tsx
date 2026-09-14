import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RepairsSummaryItem {
  date: string;
  total_repairs: number;
  total_profit: number;
}

interface YearRepairsPDFProps {
  data: RepairsSummaryItem[];
  year: string;
  username: string;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const YearRepairsPDF: React.FC<YearRepairsPDFProps> = ({ data, year, username }) => {
  const reportCreator = username;
  const generationDateTime = format(new Date(), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es });
  const totalGlobalRepairCosts = data.reduce((sum, item) => sum + item.total_repairs, 0);
  const totalGlobalProfit = data.reduce((sum, item) => sum + item.total_profit, 0);

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

        <Text style={styles.reportTitle}>REPORTE ANUAL DE REPARACIONES</Text>
        <Text style={styles.subtitle}>Año: {year}</Text>
        <View style={styles.reportMeta}>
          <Text>
            Generado por: <Text style={{ fontWeight: 'bold' }}>{reportCreator}</Text>
          </Text>
          <Text>el {generationDateTime}</Text>
        </View>

        {data.length > 0 ? (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={{ ...styles.tableColHeaderSummary, borderLeftWidth: 0 }}>
                <Text style={styles.tableCellHeader}>Mes</Text>
              </View>
              <View style={styles.tableColHeaderSummary}>
                <Text style={styles.tableCellHeader}>Costos Totales</Text>
              </View>
              <View style={{ ...styles.tableColHeaderSummary, borderRightWidth: 0 }}>
                <Text style={styles.tableCellHeader}>Efectivo Total</Text>
              </View>
            </View>
            {data.map((item, i) => (
              <View key={i.toString()} style={styles.tableRow}>
                <View style={{ ...styles.tableColSummary, borderLeftWidth: 0 }}>
                  <Text style={styles.tableCellLeft}>
                    {capitalize(format(parseISO(item.date), 'MMMM', { locale: es }))}
                  </Text>
                </View>
                <View style={styles.tableColSummary}>
                  <Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_repairs.toFixed(2)))} Bs</Text>
                </View>
                <View style={{ ...styles.tableColSummary, borderRightWidth: 0 }}>
                  <Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_profit.toFixed(2)))} Bs</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No hay datos de reparaciones para este año.
          </Text>
        )}

        {data.length > 0 && (
          <View style={styles.totalsSection} fixed>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL COSTOS REPARACIONES DEL AÑO:</Text>
              <Text style={styles.totalValue}>{totalGlobalRepairCosts.toFixed(2)} Bs</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL EFECTIVO DEL AÑO:</Text>
              <Text style={styles.totalValue}>{totalGlobalProfit.toFixed(2)} Bs</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default YearRepairsPDF;