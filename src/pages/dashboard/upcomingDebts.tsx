import { Card } from "@heroui/card";
import { Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { formatNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";

interface UpcomingDebtsSectionProps {
  upcomingDebts: any[];
}

export default function UpcomingDebtsSection({ upcomingDebts }: UpcomingDebtsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-0 border-none shadow-sm overflow-hidden">
      <div className="p-6 flex justify-between items-center bg-white dark:bg-default-50 border-b border-divider">
        <div>
          <h3 className="text-lg font-bold text-danger">
            ໜີ້ສິນທີ່ໃກ້ຮອດກຳນົດ
          </h3>
          <p className="text-sm text-default-400 font-medium tracking-tight">
            ລາຍການຕິດໜີ້ທີ່ຕ້ອງໄດ້ຕິດຕາມการຊຳລະ
          </p>
        </div>
      </div>
      <Table
        removeWrapper
        aria-label="Upcoming debts table"
        className="p-2"
      >
        <TableHeader>
          <TableColumn>ເລກທີບິນ</TableColumn>
          <TableColumn>ຊື່ລູກຄ້າ</TableColumn>
          <TableColumn className="text-right">ຍອດຕິດໜີ້</TableColumn>
          <TableColumn className="text-center">ວັນທີກຳນົດສົ່ງ</TableColumn>
          <TableColumn className="text-center">ສະຖານະ</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <EmptyState message="ບໍ່ມີລາຍການຕິດໜີ້ໃກ້ຮອດກຳນົດ" />
          }
        >
          {(upcomingDebts || []).map((order) => {
            return (
              <TableRow
                key={order.id}
                className="border-b border-divider last:border-none"
              >
                <TableCell className="font-bold text-primary">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">
                      {order.memberName}
                    </span>
                    <span className="text-[10px] text-default-400">
                      {order.memberPhone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-danger">
                  {formatNumber(order.debtAmount)} ກີບ
                </TableCell>
                <TableCell className="text-center font-bold">
                  {dayjs(order.dueDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-center">
                  <Chip
                    className="font-black h-5 text-[10px]"
                    color={
                      order.paymentStatus === "PAID"
                        ? "success"
                        : order.paymentStatus === "PARTIALLY_PAID"
                          ? "warning"
                          : "danger"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {order.paymentStatus === "PAID"
                      ? t("order.paid") || "ຊຳລະແລ້ວ"
                      : order.paymentStatus === "PARTIALLY_PAID"
                        ? t("order.partiallyPaid") || "ຊຳລະບາງສ່ວນ"
                        : t("order.unpaid") || "ຍັງບໍ່ຊຳລະ"}
                  </Chip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
