import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductItem {
  product_name: string;
  category_name: string;
  quantity: number;
  unit_price: number;
  cost: number;
  profit: number;
}

interface SalesDetailedItem {
  sale_id: number;
  seller_name: string;
  sale_date: string;
  total_sale: number;
  total_profit: number;
  products: ProductItem[];
}

interface DayDetailedPDFProps {
  data: SalesDetailedItem[];
  date: string;
  username: string;
}

function formatSmartNumber(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2)
}

const DayDetailedPDF: React.FC<DayDetailedPDFProps> = ({ data, date, username }) => {
  const reportCreator = username;
  const generationDateTime = format(new Date(), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es });
  const fullDate = format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const totalGlobalSales = data.reduce((sum, sale) => sum + sale.total_sale, 0);
  const totalGlobalProfit = data.reduce((sum, sale) => sum + sale.total_profit, 0);

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

        <Text style={styles.reportTitle}>REPORTE DETALLADO DE VENTAS DEL DÍA</Text>
        <Text style={styles.subtitle}>{fullDate}</Text>
        <View style={styles.reportMeta}>
          <Text>
            Generado por: <Text style={{ fontWeight: 'bold' }}>{reportCreator}</Text>
          </Text>
          <Text>el {generationDateTime}</Text>
        </View>

        {data.length > 0 ? (
          data.map((sale: SalesDetailedItem, i: number) => (
            <View key={i.toString()} style={styles.saleSection}>
              <Text style={styles.saleHeader}>Venta #{sale.sale_id} - Vendedor: {sale.seller_name}</Text>
              <Text style={styles.saleSummary}>Total Venta: {formatSmartNumber(Number(sale.total_sale))} Bs | Efectivo: {formatSmartNumber(Number(sale.total_profit))} Bs</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <View style={{ ...styles.tableColHeaderDetailed, borderLeftWidth: 0 }}><Text style={styles.tableCellHeader}>Producto</Text></View>
                  <View style={styles.tableColHeaderDetailed}><Text style={styles.tableCellHeader}>Categoría</Text></View>
                  <View style={styles.tableColHeaderDetailed}><Text style={styles.tableCellHeader}>Cantidad</Text></View>
                  <View style={styles.tableColHeaderDetailed}><Text style={styles.tableCellHeader}>Precio Unitario</Text></View>
                  <View style={{ ...styles.tableColHeaderDetailed, borderRightWidth: 0 }}><Text style={styles.tableCellHeader}>Efectivo</Text></View>
                </View>
                {sale.products.map((d: ProductItem, j: number) => (
                  <View key={j.toString()} style={styles.tableRow}>
                    <View style={{ ...styles.tableColDetailed, borderLeftWidth: 0 }}><Text style={styles.tableCell}>{d.product_name}</Text></View>
                    <View style={styles.tableColDetailed}><Text style={styles.tableCell}>{d.category_name}</Text></View>
                    <View style={styles.tableColDetailed}><Text style={styles.tableCell}>{d.quantity}</Text></View>
                    <View style={styles.tableColDetailed}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(d.unit_price))} Bs</Text></View>
                    <View style={{ ...styles.tableColDetailed, borderRightWidth: 0 }}><Text style={styles.tableCellRight}>{formatSmartNumber(Number(d.profit))} Bs</Text></View>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay datos detallados de ventas para este día.</Text>
        )}

        {data.length > 0 && (
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL VENTAS DEL DÍA:</Text>
              <Text style={styles.totalValue}>{totalGlobalSales.toFixed(2)} Bs</Text>
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

export default DayDetailedPDF;