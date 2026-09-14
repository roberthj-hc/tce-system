import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DayDetailedPDF from './pdfTemplates/DayDetailedPDF';
import DaySummaryPDF from './pdfTemplates/DaySummaryPDF';
import MonthPDF from './pdfTemplates/MonthPDF';
import YearPDF from './pdfTemplates/YearPDF';
import { pdf } from '@react-pdf/renderer';

interface SalesSummaryItem {
  date: string;
  total_sales: number;
  total_profit: number;
}

interface SalesDetailedItem {
  sale_id: number;
  seller_name: string;
  sale_date: string;
  total_sale: number;
  total_profit: number;
  products: {
    product_name: string;
    category_name: string;
    quantity: number;
    unit_price: number;
    cost: number;
    profit: number;
  }[];
}

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

interface ReportDownloadButtonProps {
  report: SalesSummaryItem[] | SalesDetailedItem[] | SalesDailySummaryItem[];
  reportType: 'day' | 'month' | 'year';
  isDetailed: boolean;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: string;
  username: string;
}

export const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({
  report,
  reportType,
  isDetailed,
  selectedDate,
  selectedMonth,
  selectedYear,
  username
}) => {
  const [downloadLink, setDownloadLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generatePdf = async () => {
      if (report.length === 0) {
        setDownloadLink('');
        return;
      }
      setIsGenerating(true);
      try {
        let pdfDocument;
        switch (reportType) {
          case 'day':
            pdfDocument = isDetailed ? (
              <DayDetailedPDF data={report as SalesDetailedItem[]} date={selectedDate} username={username} />
            ) : (
              <DaySummaryPDF data={report as SalesDailySummaryItem[]} date={selectedDate} username={username} />
            );
            break;
          case 'month':
            pdfDocument = <MonthPDF data={report as SalesSummaryItem[]} month={selectedMonth} username={username} />;
            break;
          case 'year':
            pdfDocument = <YearPDF data={report as SalesSummaryItem[]} year={selectedYear} username={username} />;
            break;
          default:
            return;
        }

        const blob = await pdf(pdfDocument).toBlob();
        setDownloadLink(URL.createObjectURL(blob));
      } catch (e) {
        console.error('Error generando el PDF:', e);
      } finally {
        setIsGenerating(false);
      }
    };
    generatePdf();
  }, [report, reportType, isDetailed, selectedDate, selectedMonth, selectedYear]);

  if (!downloadLink) {
    return (
      <Button variant="secondary" disabled={true} className="text-sm">
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Generando...
      </Button>
    );
  }

  return (
    <a href={downloadLink} download={`${reportType}_${isDetailed ? 'detallado_' : 'resumen_'}${selectedDate}.pdf`}>
      <Button variant="secondary" className="text-sm">
        <Download className="mr-2 h-4 w-4" />
        Descargar PDF
      </Button>
    </a>
  );
};
