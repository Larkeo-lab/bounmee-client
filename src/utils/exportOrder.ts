import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

import { Order } from "@/services/order/useOrder";

export const exportOrdersToExcel = async (orders: Order[]) => {
  if (!orders || orders.length === 0) {
    alert("ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ");

    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ລາຍງານການຂາຍ");

  // 1. Define columns with widths
  worksheet.columns = [
    { header: "ລຳດັບ", key: "index", width: 8 },
    { header: "ວັນທີ / ເວລາ", key: "date", width: 25 },
    { header: "ເລກທີບິນ", key: "orderNumber", width: 20 },
    { header: "ພະນັກງານ", key: "employee", width: 20 },
    { header: "ການຊຳລະ", key: "payment", width: 15 },
    { header: "ທະນາຄານ", key: "bank", width: 20 },
    { header: "ຍອດລວມ", key: "total", width: 18 },
    { header: "ຮັບເງິນ", key: "received", width: 18 },
    { header: "ເງິນທອນ", key: "change", width: 15 },
    { header: "ລາຍການ", key: "items", width: 10 },
  ];

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
  orders.forEach((order, idx) => {
    const row = worksheet.addRow({
      index: idx + 1,
      date: dayjs(order.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      orderNumber: order.orderNumber,
      employee: order.employee?.name || "ເຈົ້າຂອງຮ້ານ",
      payment: order.paymentMethod === "CASH" ? "ເງິນສົດ" : "ເງິນໂອນ",
      bank: order.bank?.name || "-",
      total: Number(order.totalAmount || 0),
      received: Number(order.receivedAmount || 0),
      change: Number(order.change || 0),
      items: order.items?.length || 0,
    });

    row.height = 25;

    // Formatting numbers
    row.getCell("total").numFmt = '#,##0 "ກີບ"';
    row.getCell("received").numFmt = '#,##0 "ກີບ"';
    row.getCell("change").numFmt = '#,##0 "ກີບ"';

    // Alignment and font
    row.eachCell((cell) => {
      cell.font = { name: "Phetsarath OT", size: 10 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFEDEDED" } },
        left: { style: "thin", color: { argb: "FFEDEDED" } },
        bottom: { style: "thin", color: { argb: "FFEDEDED" } },
        right: { style: "thin", color: { argb: "FFEDEDED" } },
      };
    });

    // Center specific columns
    row.getCell("index").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    row.getCell("payment").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    row.getCell("items").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  // 4. Summary Row (Footer)
  const totalAmount = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  );

  worksheet.addRow([]); // Blank row
  const summaryRow = worksheet.addRow({
    bank: "ລວມທັງໝົດ:",
    total: totalAmount,
  });

  summaryRow.height = 30;
  summaryRow.getCell("bank").font = {
    bold: true,
    size: 12,
    name: "Phetsarath OT",
  };
  summaryRow.getCell("total").font = {
    bold: true,
    size: 12,
    name: "Phetsarath OT",
    color: { argb: "FFB91C1C" },
  }; // Red for total
  summaryRow.getCell("total").numFmt = '#,##0 "ກີບ"';
  summaryRow.getCell("total").alignment = { vertical: "middle" };

  // 5. Generate and Download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `POS_Orders_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
};
