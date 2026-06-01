import { Card } from "@heroui/card";
import { Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image } from "@heroui/react";

import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";
import EmptyState from "@/components/common/empty-state";

interface BestSellingSectionProps {
  topSellingProducts: any[];
}

export default function BestSellingSection({ topSellingProducts }: BestSellingSectionProps) {
  return (
    <Card className="p-0 border-none shadow-sm overflow-hidden">
      <div className="p-6 flex justify-between items-center bg-white dark:bg-default-50 border-b border-divider">
        <div>
          <h3 className="text-lg font-bold">ສິນຄ້າຂາຍດີ</h3>
          <p className="text-sm text-default-400 font-medium tracking-tight">
            ລາຍການສິນຄ້າທີ່ໄດ້ຮັບຄວາມນິຍົມສູງສຸດ
          </p>
        </div>
      </div>
      <Table
        removeWrapper
        aria-label="Best selling products table"
        className="p-2"
      >
        <TableHeader>
          <TableColumn>ລຳດັບ</TableColumn>
          <TableColumn>ຮູບພາບ</TableColumn>
          <TableColumn>ຊື່ເມນູ</TableColumn>
          <TableColumn className="text-center">ຈຳນວນທີ່ຂາຍ</TableColumn>
          <TableColumn className="text-right">ລາຄາ</TableColumn>
          <TableColumn className="text-right">ຍອດຂາຍລວມ</TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyState />}>
          {(topSellingProducts || []).map((product, index) => (
            <TableRow
              key={index}
              className="border-b border-divider last:border-none"
            >
              <TableCell className="font-bold text-default-400">
                {index + 1}
              </TableCell>
              <TableCell>
                <Image
                  alt={product.name}
                  className="w-12 h-12 min-w-[48px] object-cover rounded-xl shadow-sm border border-divider/50"
                  src={getDisplayImageUrl(product.image || "")}
                />
              </TableCell>
              <TableCell className="font-bold whitespace-nowrap">
                {product.name || "-"}
              </TableCell>
              <TableCell className="text-center">
                <Chip
                  className="font-bold"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  {product.qty}
                  {product.unitName ? ` ${product.unitName}` : ""}
                </Chip>
              </TableCell>

              <TableCell className="text-right font-medium whitespace-nowrap">
                {product.qty > 0
                  ? formatNumber(product.totalSales / product.qty)
                  : 0}{" "}
                ກີບ
              </TableCell>
              <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                {formatNumber(product.totalSales)} ກີບ
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
