import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { EquipmentResponse } from '../../models/school.model';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  exportEquipmentsToPdf(roomName: string, equipments: EquipmentResponse[]) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Inventaire du Matériel - ${roomName}`, 14, 20);

    const tableData = equipments.map((item, index) => [
      index + 1,
      item.name,
      item.quantity || 1,
      item.state || 'N/A',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Nom du matériel', 'Quantité', 'État']],
      body: tableData,
    });

    doc.save(`Materiel_${roomName.replace(/\s+/g, '_')}.pdf`);
  }

  exportEquipmentsToExcel(roomName: string, equipments: EquipmentResponse[]) {
    const dataToExport = equipments.map((item, index) => ({
      'N°': index + 1,
      'Nom du matériel': item.name,
      'Quantité': item.quantity || 1,
      'État': item.state || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matériels');

    XLSX.writeFile(workbook, `Materiel_${roomName.replace(/\s+/g, '_')}.xlsx`);
  }
}
