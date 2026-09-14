import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale, SaleDetail } from '../../useSalesHistory';

const invoiceStyles = StyleSheet.create({
    page: {
        width: 280,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 15,
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#333',
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    invoiceInfo: {
        marginTop: 5,
        fontSize: 7,
        lineHeight: 1.2,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: 'auto',
        marginBottom: 5,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCell: {
        padding: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    colProduct: {
        width: '50%',
    },
    colQty: {
        width: '15%',
        textAlign: 'right',
    },
    colPrice: {
        width: '20%',
        textAlign: 'right',
    },
    colTotal: {
        width: '15%',
        textAlign: 'right',
    },
    totalsSection: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 3,
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalValue: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 7,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 5,
    }
});

interface InvoicePDFProps {
    sale: Sale;
    details: SaleDetail[];
    username: string;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ sale, details, username }) => {
    const saleDate = format(parseISO(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: es });

    return (
        <Document>
            <Page size="A6" style={invoiceStyles.page}>
                <View style={invoiceStyles.header}>
                    <Text style={invoiceStyles.companyName}>TCE</Text>
                    <Text style={invoiceStyles.invoiceInfo}>CASA MATRIZ</Text>
                    <Text style={invoiceStyles.invoiceInfo}>ENTRE AV. A Y CALLE F, A UNA TIENDA</Text>
                    <Text style={invoiceStyles.invoiceInfo}>ESTA LA PASTELERIA DELIS BOLIVIA</Text>
                    <Text style={invoiceStyles.invoiceInfo}>Nro.: 405 Zona/Barrio.: CALUYO</Text>
                    <Text style={invoiceStyles.invoiceInfo}>Teléfono: -</Text>
                    <Text style={invoiceStyles.invoiceInfo}>LA PAZ</Text>
                </View>

                <View style={invoiceStyles.invoiceInfo}>
                    <Text>COMPROBANTE DE VENTA</Text>
                    <Text>Cod. Venta: {sale.sale_id}</Text>
                    <Text>Fecha: {saleDate}</Text>
                    <Text>Vendedor: {sale.seller_name}</Text>
                </View>

                <Text style={invoiceStyles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
                <View style={invoiceStyles.table}>
                    <View style={invoiceStyles.tableHeaderRow}>
                        <Text style={[invoiceStyles.tableCell, invoiceStyles.colProduct]}>Producto</Text>
                        <Text style={[invoiceStyles.tableCell, invoiceStyles.colQty]}>Cant.</Text>
                        <Text style={[invoiceStyles.tableCell, invoiceStyles.colPrice]}>P. Unit.</Text>
                        <Text style={[invoiceStyles.tableCell, invoiceStyles.colTotal]}>Total</Text>
                    </View>
                    {details.map((item, index) => (
                        <View style={invoiceStyles.tableRow} key={index}>
                            <Text style={[invoiceStyles.tableCell, invoiceStyles.colProduct]}>{item.product_name}</Text>
                            <Text style={[invoiceStyles.tableCell, invoiceStyles.colQty]}>{item.quantity}</Text>
                            <Text style={[invoiceStyles.tableCell, invoiceStyles.colPrice]}>{Number(item.unit_price).toFixed(2)}</Text>
                            <Text style={[invoiceStyles.tableCell, invoiceStyles.colTotal]}>{(item.quantity * Number(item.unit_price)).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
                <View style={invoiceStyles.totalsSection}>
                    <View style={invoiceStyles.totalRow}>
                        <Text style={invoiceStyles.totalLabel}>TOTAL:</Text>
                        <Text style={invoiceStyles.totalValue}>{Number(sale.total_sale).toFixed(2)} Bs</Text>
                    </View>
                </View>
                <View style={invoiceStyles.footer}>
                    <Text>¡Gracias por su compra!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;