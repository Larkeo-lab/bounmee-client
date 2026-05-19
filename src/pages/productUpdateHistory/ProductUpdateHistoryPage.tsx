import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Card,
  CardBody,
  ScrollShadow,
  Button,
} from "@heroui/react";
import { Search, Image as ImageIcon, Download } from "lucide-react";
import dayjs from "dayjs";

import { useAuth } from "@/routes/AuthContext";
import {
  useGetProductUpdateHistories,
  ProductUpdateHistory,
} from "@/services/productUpdateHistory/useProductUpdateHistory";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import EmptyState from "@/components/common/empty-state";
import { getDisplayImageUrl } from "@/lib/utils";
import FilterDate from "@/components/common/fillterDate";
import { exportToExcel, ExcelColumn } from "@/utils/exportOrder";

export default function ProductUpdateHistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: historyResponse,
    isLoading,
    refetch,
  } = useGetProductUpdateHistories({
    storeId: user?.user?.storeId || "",
    page,
    limit,
    search: debouncedSearch,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  useEffect(() => {
    refetch();
  }, [refetch, page, debouncedSearch]);

  const historiesWithIndex = useMemo(() => {
    const data = historyResponse?.data || [];
    return data.map((item: ProductUpdateHistory, index: number) => ({
      ...item,
      displayIndex: (page - 1) * limit + index + 1,
    }));
  }, [historyResponse, page, limit]);

  const pagination = historyResponse?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const renderValue = (
    val: number | null | undefined,
    isCurrency: boolean = false,
  ) => {
    if (val == null) return "-";
    return isCurrency ? formatNumber(val) : val;
  };

  const handleExport = async () => {
    if (!historyResponse?.data || historyResponse.data.length === 0) return;

    const columns: ExcelColumn[] = [
      { header: "ລຳດັບ", key: "index", width: 8, align: "center" },
      { header: "ຊື່ສິນຄ້າ", key: "productName", width: 25 },
      { header: "ບາໂຄດ", key: "barcode", width: 20 },
      { header: "ລາຄາຊື້ເກົ່າ", key: "oldCost", width: 18, format: "currency" },
      { header: "ລາຄາຊື້ໃໝ່", key: "newCost", width: 18, format: "currency" },
      { header: "ລາຄາຂາຍເກົ່າ", key: "oldPrice", width: 18, format: "currency" },
      { header: "ລາຄາຂາຍໃໝ່", key: "newPrice", width: 18, format: "currency" },
      { header: "ຈຳນວນເດີມ", key: "oldStockQty", width: 15, format: "number" },
      { header: "ຈຳນວນໃໝ່", key: "newStockQty", width: 15, format: "number" },
      { header: "ຈຳນວນທີເພີ່ມ", key: "addedStock", width: 15, format: "number" },
      { header: "ວັນທີແກ້ໄຂ", key: "updatedAt", width: 25 },
    ];

    const data = historyResponse.data.map((item: ProductUpdateHistory) => ({
      productName: item.product?.name || t("productUpdateHistory.unknownName"),
      barcode: item.product?.barcode || "-",
      oldCost: Number(item.oldCost || 0),
      newCost: Number(item.newCost || 0),
      oldPrice: Number(item.oldPrice || 0),
      newPrice: Number(item.newPrice || 0),
      oldStockQty: Number(item.oldStockQty || 0),
      newStockQty: Number(item.newStockQty || 0),
      addedStock: Number(item.newStockQty || 0) - Number(item.oldStockQty || 0),
      updatedAt: dayjs(item.updatedAt).format("DD/MM/YYYY HH:mm:ss"),
    }));

    await exportToExcel({
      data,
      columns,
      fileName: "Product_Update_History",
      sheetName: "ປະຫວັດການແກ້ໄຂສິນຄ້າ",
    });
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t("productUpdateHistory.title")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("productUpdateHistory.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            isClearable
            className="w-full sm:w-64"
            placeholder={t("productUpdateHistory.searchPlaceholder")}
            startContent={<Search className="text-gray-400 w-4 h-4" />}
            value={search}
            variant="faded"
            onClear={() => setSearch("")}
            onValueChange={setSearch}
          />
          <FilterDate
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onFilter={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setPage(1);
            }}
          />
          <Button
            className="font-bold shadow-sm"
            color="success"
            startContent={<Download size={18} />}
            variant="flat"
            onPress={handleExport}
            isDisabled={!historyResponse?.data || historyResponse.data.length === 0}
          >
            {t("common.export") || "ສົ່ງອອກ Excel"}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-100">
        <CardBody className="p-0">
          <ScrollShadow orientation="horizontal" className="w-full">
            <Table
              aria-label="Product Update History Table"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-center py-4">
                    <GlobalPagination
                      page={page}
                      totalItems={historyResponse?.pagination?.total || 0}
                      totalPages={totalPages}
                      onChange={setPage}
                    />
                  </div>
                ) : null
              }
              classNames={{
                wrapper:
                  "shadow-sm border border-divider rounded-xl overflow-hidden min-w-[800px]",
                th: "bg-default-50 text-default-600 font-bold h-12 whitespace-nowrap",
                td: "py-3 whitespace-nowrap",
                tr: "border-b border-default-100 last:border-0 transition-colors",
              }}
            >
              <TableHeader>
                <TableColumn className="h-12 text-small hidden sm:table-cell">
                  #
                </TableColumn>
                <TableColumn className="h-12 text-small">
                  {t("productUpdateHistory.table.productName")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.oldCost")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.newCost")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.oldPrice")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.newPrice")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.oldStock")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("productUpdateHistory.table.newStock")}
                </TableColumn>
                <TableColumn className="h-12 text-small" align="end">
                  {t("ຈຳນວນທີເພີ່ມ")}
                </TableColumn>
                <TableColumn className="h-12 text-small" width={180}>
                  {t("productUpdateHistory.table.updatedAt")}
                </TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  isLoading ? (
                    <div className="py-10 text-center text-gray-500">
                      {t("common.loading")}
                    </div>
                  ) : (
                    <EmptyState
                      message={t("productUpdateHistory.emptyState")}
                      icon={<Search className="w-12 h-12 text-gray-300" />}
                    />
                  )
                }
                isLoading={isLoading}
                items={historiesWithIndex}
              >
                {(item: ProductUpdateHistory & { displayIndex?: number }) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-default-50 transition-colors h-16"
                  >
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-bold text-small text-default-400">
                        {item.displayIndex}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.product?.image ? (
                          <img
                            src={getDisplayImageUrl(item.product.image)}
                            alt={item.product?.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-divider shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-default-100 flex items-center justify-center border border-divider">
                            <ImageIcon className="text-default-400" size={16} />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <p className="text-bold text-small capitalize truncate">
                            {item.product?.name ||
                              t("productUpdateHistory.unknownName")}
                          </p>
                          <p className="text-tiny text-default-400 truncate">
                            {item.product?.barcode ||
                              t("productUpdateHistory.noBarcode")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end text-start">
                        {renderValue(item.oldCost, true)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end ">
                        {renderValue(item.newCost, true)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end ">
                        {renderValue(item.oldPrice, true)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end ">
                        {renderValue(item.newPrice, true)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end ">
                        {renderValue(item.oldStockQty, false)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end ">
                        {renderValue(item.newStockQty, false)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end  text-primary font-bold">
                        {renderValue(
                          Number(item.newStockQty) - Number(item.oldStockQty) ||
                            0,
                          false,
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {dayjs(item.updatedAt).format("DD/MM/YYYY")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(item.updatedAt).format("HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
}
