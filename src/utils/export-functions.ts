import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IReport } from '../../types';
import moment from 'moment-timezone';

const generateExcel = (data: IReport[]) => {
  const formattedData = data.map((report) => {
    return {
      'Booking ID': report.id,
      'Equipment Name': report.equipment.name,
      'Booked By': report.user.name,
      Status: report.status,
      From: moment(report.slotTimeStart).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
      To: moment(report.slotTimeEnd).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
      'Booked At': moment(report.bookedAt!).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
      Cost: report.cost,
      Remark: report.remark,
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

  const headers = [['Equipment', 'Booked By', 'Booked At', 'Cost', 'Slot Start', 'Slot End', 'Booking Status']];
  const formattedData = data.map((report) => [
    report.equipment.name,
    report.user.name,
    moment(report.bookedAt!).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
    report.cost.toString(), // Convert cost to string
    moment(report.slotTimeStart).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
    moment(report.slotTimeEnd).tz('Asia/Kolkata').format('YY:MM:DD:hh:mm'),
    report.status,
  ]);
  doc.autoTable({
    head: headers,
    body: formattedData,
    startY: 20, // Adjust starting position below the title
  });
  doc.save('Reports.pdf');
};

export { generateExcel, generatePDF };
