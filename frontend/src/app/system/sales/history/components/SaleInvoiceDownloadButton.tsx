"use client"

import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './pdfTemplates/InvoicePDF';
import { toast } from 'sonner';
import { Sale, SaleDetail } from '../useSalesHistory';
import { useAuth } from "@/context/AuthContext"

interface SaleInvoiceDownloadButtonProps {
    sale: Sale;
}

export const SaleInvoiceDownloadButton: React.FC<SaleInvoiceDownloadButtonProps> = ({ sale }) => {
    const [downloadLink, setDownloadLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [details, setDetails] = useState<SaleDetail[] | null>(null);
    const { user } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleDownload = async () => {
        setIsGenerating(true);
        setDownloadLink('');

        try {
            const res = await fetch(`${apiUrl}/api/sales/details/${sale.sale_id}`);
            if (!res.ok) {
                throw new Error("Error al obtener detalles de venta");
            }
            const saleDetails: SaleDetail[] = await res.json();
            setDetails(saleDetails);

            if (saleDetails.length === 0) {
                toast.info("No hay productos en esta venta para generar la factura.");
                setIsGenerating(false);
                return;
            }

            const pdfDocument = (
                <InvoicePDF
                    sale={sale}
                    details={saleDetails}
                    username={user?.name || 'Usuario Desconocido'}
                />
            );

            const blob = await pdf(pdfDocument).toBlob();
            const url = URL.createObjectURL(blob);
            setDownloadLink(url);

            const link = document.createElement('a');
            link.href = url;
            link.download = `comprobante_venta_${sale.sale_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Comprobante de venta generado y descargado.");
        } catch (e) {
            console.error('Error generando la factura:', e);
            toast.error("Error al generar el comprobante. Inténtelo de nuevo.");
            setDownloadLink('');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating}
        >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
    );
};