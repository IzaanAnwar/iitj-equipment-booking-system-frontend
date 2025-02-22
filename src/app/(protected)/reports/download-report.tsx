import { Button } from '@/components/ui/button';
import { FinanceReport, IReport } from '../../../../types';
import {
  generateExcel,
  generateFinanceExcelReport,
  generateFinancePDFReport,
  generatePDF,
} from '@/utils/export-functions';
import { DownloadIcon, FileSpreadsheetIcon, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DownloadReport({ reports }: { reports: IReport[] }) {
  return (
    <div className="flex items-center justify-end space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className="space-x-2 " size="sm">
            <DownloadIcon /> <p>Download</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Download</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => generateExcel(reports)}
            className="flex items-center justify-start space-x-2"
          >
            <FileSpreadsheetIcon /> <p>Excel</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF(reports)} className="flex items-center justify-start space-x-2">
            <FileText /> <p>PDF</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DownloadFinanceReport({ reports }: { reports: FinanceReport[] }) {
  return (
    <div className="flex items-center justify-end space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className="space-x-2 " size="sm">
            <DownloadIcon /> <p>Download</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Download</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => generateFinanceExcelReport(reports)}
            className="flex items-center justify-start space-x-2"
          >
            <FileSpreadsheetIcon /> <p>Excel</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => generateFinancePDFReport(reports)}
            className="flex items-center justify-start space-x-2"
          >
            <FileText /> <p>PDF</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
