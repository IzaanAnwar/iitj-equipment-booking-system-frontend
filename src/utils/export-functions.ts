import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FinanceReport, IReport } from '../../types';
import moment from 'moment-timezone';

const generateExcel = (data: IReport[]) => {
  const formattedData = data.map((report) => {
    return {
      'Booking ID': report.id,
      'Equipment Name': report.equipment.name,
      'Booked By': report.user.name,
      Status: report.status,
      From: moment(report.slotTimeStart).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
      To: moment(report.slotTimeEnd).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
      'Booked At': moment(report.bookedAt!).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
      Cost: report.cost,
      'Booked For': report.remark,
      Hours: report.slotDuration,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, 'Reports.xlsx');
};

const generatePDF = (data: IReport[]) => {
  const doc = new jsPDF();
  // Headers
  doc.setFontSize(18);
  doc.text('Equipment Booking Reports', 10, 10);

  const headers = [
    ['Equipment', 'Booked By', 'Booked At', 'Cost', 'Slot Start', 'Slot End', 'Booked For', 'Booking Status'],
  ];
  const formattedData = data.map((report) => [
    report.equipment.name,
    report.user.name,
    moment(report.bookedAt!).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
    report.cost.toString(), // Convert cost to string
    moment(report.slotTimeStart).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
    moment(report.slotTimeEnd).tz('Asia/Kolkata').format('YY:MM:DD:HH:mm'),
    report.remark,
    report.status,
  ]);
  doc.autoTable({
    head: headers,
    body: formattedData,
    startY: 20, // Adjust starting position below the title
  });
  doc.save('Reports.pdf');
};

const generateFinanceExcelReport = (data: FinanceReport[]) => {
  const formattedData = data.map((report) => ({
    'Transaction ID': report.id,
    'Action Type': report.actionType,
    Amount: report.amount,
    Supervisor: report.supervisor ? report.supervisor.name : 'N/A',
    Department: report.department ? report.department.name : 'N/A',
    Equipment: report.equipment ? report.equipment.name : 'N/A',
    Student: report.student ? report.student.name : 'N/A',
    'Action By': report.actionBy.name,
    'Created At': report.createdAt ? moment(report.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm') : 'N/A',
    Message: report.message,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Finance Reports');
  XLSX.writeFile(workbook, 'Finance_Reports.xlsx');
};

const generateFinancePDFReport = (data: FinanceReport[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFontSize(18);
  doc.text('Finance Reports', 10, 10);

  // Table Headers
  const headers = [
    ['Transaction ID', 'Action Type', 'Amount', 'Department', 'Equipment', 'Action By', 'Created At', 'Message'],
  ];

  const formattedData = data.map((report) => [
    report.id,
    report.actionType,
    report.amount.toFixed(2), // Ensuring amount is formatted properly
    report.department ? report.department.name : 'N/A',
    report.equipment ? report.equipment.name : 'N/A',
    report.actionBy.name,
    report.createdAt ? moment(report.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm') : 'N/A',
    report.message,
  ]);

  doc.autoTable({
    head: headers,
    body: formattedData,
    startY: 20, // Adjusts starting position below the title
    styles: { fontSize: 10 },
  });

  doc.save('Finance_Reports.pdf');
};

export { generateExcel, generatePDF, generateFinanceExcelReport, generateFinancePDFReport };
