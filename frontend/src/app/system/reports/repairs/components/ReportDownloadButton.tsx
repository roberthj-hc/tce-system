import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DaySummaryPDF from './pdfTemplates/DaySummaryPDF';
import MonthPDF from './pdfTemplates/MonthPDF';
import YearPDF from './pdfTemplates/YearPDF';
import { pdf } from '@react-pdf/renderer';

interface RepairSummaryItem {
  date: string;
  total_repairs: number;
  total_profit: number;
}

interface RepairDailySummaryItem {
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

interface ReportDownloadButtonProps {
  report: RepairSummaryItem[] | RepairDailySummaryItem[];
  reportType: 'day' | 'month' | 'year';
  selectedDate: string;
  selectedMonth: string;
  selectedYear: string;
  username: string;
}

export const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({
  report,
  reportType,
  selectedDate,
  selectedMonth,
  selectedYear,
  username
}) => {
  const [downloadLink, setDownloadLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generatePdf = async () => {
      if (!report || report.length === 0) {
        setDownloadLink('');
        return;
      }
      setIsGenerating(true);
      try {
        let pdfDocument;
        switch (reportType) {
          case 'day':
            pdfDocument = (
              <DaySummaryPDF data={report as RepairDailySummaryItem[]} date={selectedDate} username={username} />
            );
            break;
          case 'month':
            pdfDocument = <MonthPDF data={report as RepairSummaryItem[]} month={selectedMonth} username={username} />;
            break;
          case 'year':
            pdfDocument = <YearPDF data={report as RepairSummaryItem[]} year={selectedYear} username={username} />;
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
  }, [report, reportType, selectedDate, selectedMonth, selectedYear, username]);

  if (!downloadLink) {
    return (
      <Button variant="secondary" disabled={true} className="text-sm">
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Generando...
      </Button>
    );
  }

  return (
    <a href={downloadLink} download={`${reportType}_${selectedDate || selectedMonth || selectedYear}.pdf`}>
      <Button variant="secondary" className="text-sm">
        <Download className="mr-2 h-4 w-4" />
        Descargar PDF
      </Button>
    </a>
  );
};