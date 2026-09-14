import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RepairsDailySummaryItem {
  repair_id: number;
  repair_date: string;
  repair_time: string;
  technician_name: string;
  customer_name: string;
  model: string;
  description: string;
  total_price: number;
  spare_part_cost: number;
  total_profit: number;
  observations: string;
  status: string;
}

interface DayRepairsListPDFProps {
  data: RepairsDailySummaryItem[];
  date: string;
  username: string;
}

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const DayRepairsListPDF: React.FC<DayRepairsListPDFProps> = ({ data, date, username }) => {
  const reportCreator = username;
  const generationDateTime = format(new Date(), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es });
  const fullDate = format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const totalGlobalRepairCosts = data.reduce((sum, repair) => sum + repair.total_price, 0);
  const totalGlobalProfit = data.reduce((sum, item) => {
    if (item.status?.toLowerCase() === 'delivered') {
      return sum + item.total_profit;
    } else {
      return sum - item.spare_part_cost;
    }
  }, 0);

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

        <Text style={styles.reportTitle}>REPORTE RESUMEN DE REPARACIONES DEL DÍA</Text>
        <Text style={styles.subtitle}>{fullDate}</Text>
        <View style={styles.reportMeta}>
          <Text>
            Generado por: <Text style={{ fontWeight: 'bold' }}>{reportCreator}</Text>
          </Text>
          <Text>el {generationDateTime}</Text>
        </View>

        {data.length > 0 ? (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={{ ...styles.tableColHeaderSmall, borderLeftWidth: 0 }}><Text style={styles.tableCellHeader}>ID</Text></View>
              <View style={styles.tableColHeaderSmall}><Text style={styles.tableCellHeader}>Hora</Text></View>
              <View style={styles.tableColHeaderMedium}><Text style={styles.tableCellHeader}>Técnico</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Descripción</Text></View>
              <View style={styles.tableColHeaderMedium}><Text style={styles.tableCellHeader}>Estado</Text></View>
              <View style={styles.tableColHeaderSmall}><Text style={styles.tableCellHeader}>Total</Text></View>
              <View style={{ ...styles.tableColHeaderSmall, borderRightWidth: 0 }}><Text style={styles.tableCellHeader}>Efectivo</Text></View>
            </View>
            {data.map((item: RepairsDailySummaryItem, i: number) => (
              <View key={i.toString()} style={styles.tableRow}>
                <View style={{ ...styles.tableColSmall, borderLeftWidth: 0 }}><Text style={styles.tableCell}>{item.repair_id}</Text></View>
                <View style={styles.tableColSmall}><Text style={styles.tableCell}>{item.repair_time.slice(0, 5)}</Text></View>
                <View style={styles.tableColMedium}><Text style={styles.tableCell}>{item.technician_name}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.description}</Text></View>
                <View style={styles.tableColMedium}><Text style={styles.tableCell}>{item.status}</Text></View>
                <View style={styles.tableColSmall}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_price.toFixed(2)))} Bs</Text></View>
                <View style={{ ...styles.tableColSmall, borderRightWidth: 0 }}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(item.total_profit.toFixed(2)))} Bs</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay datos resumidos de reparaciones para este día.</Text>
        )}

        {data.length > 0 && (
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL COSTO REPARACIONES DEL DÍA:</Text>
              <Text style={styles.totalValue}>{totalGlobalRepairCosts.toFixed(2)} Bs</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL EFECTIVO DEL DÍA:</Text>
              <Text style={styles.totalValue}>{totalGlobalProfit.toFixed(2)} Bs</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default DayRepairsListPDF;