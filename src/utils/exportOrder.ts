import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";


export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  format?: "currency" | "number" | "text" | "date";
  align?: "left" | "center" | "right";
}

export interface ExportExcelParams<T> {
  data: T[];
  columns: ExcelColumn[];
  fileName?: string;
  sheetName?: string;
  summaryColumns?: { key: string; label?: string }[];
}

/**
 * Global function for exporting any array of data to an Excel file
 */
export const exportToExcel = async <T extends Record<string, any>>({
  data,
  columns,
  fileName = "Export",
  sheetName = "Sheet1",
  summaryColumns = [],
}: ExportExcelParams<T>) => {
  if (!data || data.length === 0) {
    alert("ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ"); // No data to export
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Define columns with widths
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // 2. Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF043E74" }, // Deep Blue System Primary
    };
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
      name: "Phetsarath OT",
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // 3. Add data rows
  data.forEach((item, idx) => {
    // Inject auto-increment index if requested
    const rowData: Record<string, any> = { ...item };
    if (columns.some((c) => c.key === "index") && rowData["index"] === undefined) {
      rowData["index"] = idx + 1;
    }

    const row = worksheet.addRow(rowData);
    row.height = 25;

    // Formatting based on column definition
    columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.font = { name: "Phetsarath OT", size: 10 };
      cell.border = {
        top: { style: "thin", color: { argb: "FFEDEDED" } },
        left: { style: "thin", color: { argb: "FFEDEDED" } },
        bottom: { style: "thin", color: { argb: "FFEDEDED" } },
        right: { style: "thin", color: { argb: "FFEDEDED" } },
      };

      if (col.format === "currency") {
        cell.numFmt = '#,##0 "ກີບ"';
      } else if (col.format === "number") {
        cell.numFmt = "#,##0";
      }

      cell.alignment = {
        vertical: "middle",
        horizontal:
          col.align ||
          (["currency", "number"].includes(col.format as string) ? "right" : "left"),
      };
    });
  });

  // 4. Summary Row (Footer)
  if (summaryColumns.length > 0) {
    worksheet.addRow([]); // Blank row

    const summaryData: Record<string, any> = {};

    summaryColumns.forEach((sc) => {
      if (sc.label) {
        summaryData[sc.key] = sc.label;
      } else {
        const sum = data.reduce((acc, curr) => acc + Number(curr[sc.key] || 0), 0);
        summaryData[sc.key] = sum;
      }
    });

    const summaryRow = worksheet.addRow(summaryData);
    summaryRow.height = 30;

    columns.forEach((col, colIdx) => {
      const cell = summaryRow.getCell(colIdx + 1);
      if (summaryData[col.key] !== undefined) {
        cell.font = {
          bold: true,
          size: 12,
          name: "Phetsarath OT",
          color: summaryColumns.find((s) => s.key === col.key && !s.label)
            ? { argb: "FFB91C1C" }
            : undefined,
        };
        if (col.format === "currency") {
          cell.numFmt = '#,##0 "ກີບ"';
        } else if (col.format === "number") {
          cell.numFmt = "#,##0";
        }
        
        cell.alignment = {
          vertical: "middle",
          horizontal:
            col.align ||
            (["currency", "number"].includes(col.format as string) ? "right" : "left"),
        };
      }
    });
  }

  // 5. Generate and Download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
};
