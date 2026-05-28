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
  Button,
  useDisclosure,
  Chip,
  Image,
  Card,
  CardBody,
  ScrollShadow,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Eye,
  Receipt,
  Download,
  Search,
  Landmark,
  LayoutGrid,
  Coffee,
  Armchair,
  Gift,
} from "lucide-react";
import dayjs from "dayjs";

import { OrderDetail } from "./OrderDetail";

import { useAuth } from "@/routes/AuthContext";
import { useGetOrders, Order } from "@/services/order/useOrder";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import { exportToExcel, ExcelColumn } from "@/utils/exportOrder";
import EmptyState from "@/components/common/empty-state";
import FilterDate from "@/components/common/fillterDate";

export default function OrderPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const IS_GENERAL_STORE = user?.user?.store?.type === "GENERAL_STORE";
  const IS_CAFE = user?.user?.store?.type === "CAFE";
  const IS_RESTAURANT = user?.user?.store?.type === "RESTAURANT";
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: orderResponse,
    isLoading,
    refetch,
  } = useGetOrders({
    storeId: user?.user?.storeId || "",
    page,
    limit,
    startDate,
    endDate,
    search: debouncedSearch,
    employeeId:
      user?.user?.role === "EMPLOYEE" ? user?.user?.employeeId : undefined,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const orders = orderResponse?.data || [];
  const pagination = orderResponse?.pagination;
  const totalOrders = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const ordersWithIndex = useMemo(() => {
    return orders.map((order: Order, index: number) => ({
      ...order,
      displayIndex: (page - 1) * limit + index + 1,
    }));
  }, [orders, page, limit]);

  const sourceCounts = useMemo(() => {
    return ordersWithIndex.reduce(
      (acc: Record<string, number>, o: any) => {
        if (o.businessType === "CAFE") acc.CAFE++;
        else if (o.tableId || o.table) acc.TABLE++;
        else acc.DIRECT++;

        return acc;
      },
      { TABLE: 0, DIRECT: 0, CAFE: 0 },
    );
  }, [ordersWithIndex]);

  const filteredOrders = useMemo(() => {
    let result = ordersWithIndex;

    if (selectedSource === "TABLE") {
      result = result.filter(
        (o: any) => (o.tableId || o.table) && o.businessType !== "CAFE",
      );
    } else if (selectedSource === "DIRECT") {
      result = result.filter(
        (o: any) => !o.tableId && !o.table && o.businessType !== "CAFE",
      );
    } else if (selectedSource === "CAFE") {
      result = result.filter((o: any) => o.businessType === "CAFE");
    }

    return result;
  }, [ordersWithIndex, selectedSource]);

  const summary = orderResponse?.summary;
  const transfersByBank = summary?.transfersByBank || [];
  const totalTransfer = summary?.totalTransfer || 0;
  const totalCash = summary?.totalCash || 0;
  const totalRevenue = summary?.totalAmount || 0;

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "success";
      case "TRANSFER":
        return "primary";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return t("order.paymentCash") || "ເງິນສົດ";
      case "TRANSFER":
        return t("order.paymentTransfer") || "ເງິນໂອນ";
      case "TRANSFER_CASH":
        return t("order.paymentTransferCash") || "ເງິນໂອນ + ເງິນສົດ";
      default:
        return method;
    }
  };

  const handleExport = async () => {
    if (!orders || orders.length === 0) return;

    const columns: ExcelColumn[] = [
      { header: "ລຳດັບ", key: "index", width: 8, align: "center" },
      { header: "ວັນທີ / ເວລາ", key: "date", width: 25 },
      { header: "ເລກທີບິນ", key: "orderNumber", width: 20 },
      { header: "ພະນັກງານ", key: "employee", width: 20 },
      { header: "ການຊຳລະ", key: "payment", width: 15, align: "center" },
      { header: "ທະນາຄານ", key: "bank", width: 20 },
      { header: "ຍອດລວມ", key: "total", width: 18, format: "currency" },
      { header: "ຮັບເງິນ", key: "received", width: 18, format: "currency" },
      { header: "ເງິນທອນ", key: "change", width: 15, format: "currency" },
      { header: "ລາຍການ", key: "items", width: 10, align: "center" },
    ];

    const data = orders.map((order: Order) => ({
      date: dayjs(order.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      orderNumber: order.orderNumber,
      employee: order.employee?.name || "ເຈົ້າຂອງຮ້ານ",
      payment: order.paymentMethod === "CASH" ? "ເງິນສົດ" : "ເງິນໂອນ",
      bank: order.bank?.name || "-",
      total: Number(order.totalAmount || 0),
      received: Number(order.receivedAmount || 0),
      change: Number(order.change || 0),
      items: order.items?.length || 0,
    }));

    await exportToExcel({
      data,
      columns,
      fileName: "POS_Orders",
      sheetName: "ລາຍງານການຂາຍ",
      summaryColumns: [{ key: "bank", label: "ລວມທັງໝົດ:" }, { key: "total" }],
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] sm:h-auto flex flex-col overflow-hidden sm:overflow-visible space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6 bg-default-50/50">
      {/* Header section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-divider pb-3 bg-white/50 backdrop-blur-md sticky top-0 z-20 -mx-2 px-4 py-2 sm:mx-0 sm:px-0 sm:pt-0 sm:static sm:bg-transparent">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-primary flex items-center gap-2">
            <Receipt className="sm:size-7" size={22} />
            {t("order.title")}
          </h1>
          <p className="text-[10px] sm:text-xs text-default-500 font-medium">
            {t("order.desc")}
          </p>
        </div>
        <Button
          className="font-bold hidden sm:flex"
          color="primary"
          size="sm"
          startContent={<Download size={16} />}
          variant="flat"
          onPress={handleExport}
        >
          {t("order.exportExcel")}
        </Button>
      </div>

      <ScrollShadow hideScrollBar className="w-full flex-shrink-0">
        <div className="flex sm:grid sm:grid-cols-3 gap-3 pb-2 min-w-full">
          {/* Box 1: Total Orders */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("order.statTotalOrders")}
                </p>
                <h2 className="text-xl sm:text-2xl font-black">
                  {totalOrders}
                </h2>
              </div>
              <Receipt
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
                size={60}
              />
            </CardBody>
          </Card>

          {/* Box 2: Total Revenue */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-emerald-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("order.statTotalRevenue")}
                </p>
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {formatNumber(totalRevenue)} {t("order.kip") || "ກີບ"}
                </h2>
              </div>
              <Landmark
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
                size={60}
              />
            </CardBody>
          </Card>

          {/* Box 3: Payment Breakdown */}
          <Card className="border-none shadow-md bg-white dark:bg-gray-800 ring-1 ring-divider/50 min-w-[240px] sm:min-w-0">
            <CardBody className="p-2 sm:p-3">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-default-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  {t("order.byPayment")}
                </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-bold">
                      {formatNumber(totalCash)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold">
                      {formatNumber(totalTransfer)}
                    </span>
                  </div>
                </div>
              </div>
              <ScrollShadow className="max-h-[34px] overflow-y-auto" size={20}>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {/* ✨ ระบุเงินสด (Cash) */}
                  <div className="flex items-center gap-1.5 text-[9px] text-default-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="font-semibold">
                      {t("order.paymentCash") || "ເງິນສົດ"}:
                    </span>
                    <span className="font-bold text-success">
                      {formatNumber(totalCash)}
                    </span>
                  </div>

                  {transfersByBank.map((bank: any) => (
                    <div
                      key={bank.name}
                      className="flex items-center gap-1.5 text-[9px] text-default-500"
                    >
                      {bank.logoUrl && (
                        <Image
                          className="w-3 h-3 rounded-full object-cover"
                          src={getDisplayImageUrl(bank.logoUrl)}
                        />
                      )}
                      <span className="font-semibold">{bank.name}:</span>
                      <span className="font-bold text-primary">
                        {formatNumber(bank.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollShadow>
            </CardBody>
          </Card>
        </div>
      </ScrollShadow>

      {/* Filter Bar - Mobile Optimized */}
      <div className="flex flex-col gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-2 rounded-2xl border border-divider shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Input
            isClearable
            className="flex-grow"
            placeholder={t("order.searchPlaceholder")}
            size="sm"
            startContent={<Search className="text-primary/60" size={16} />}
            value={search}
            variant="flat"
            onValueChange={setSearch}
          />
          <FilterDate
            endDate={endDate}
            startDate={startDate}
            onEndDateChange={setEndDate}
            onFilter={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            onStartDateChange={setStartDate}
          />
        </div>
      </div>

      <div className="flex-shrink-0 -mb-1">
        <Tabs
          aria-label="Order Source"
          classNames={{
            base: "w-full",
            tabList: "gap-6 sm:gap-8 px-2 border-b-2 border-divider/40 w-full",
            cursor: "w-full bg-primary h-[3px] -bottom-[2px]",
            tab: "h-12 px-1",
            tabContent:
              "group-data-[selected=true]:text-primary text-default-450 font-bold transition-all duration-300",
          }}
          color="primary"
          selectedKey={selectedSource}
          size="md"
          variant="underlined"
          onSelectionChange={(key) => setSelectedSource(key as string)}
        >
          <Tab
            key="ALL"
            title={
              <div className="flex items-center gap-2">
                <LayoutGrid
                  className={
                    selectedSource === "ALL"
                      ? "text-primary"
                      : "text-default-400"
                  }
                  size={18}
                />
                <span className="text-sm">{t("order.all")}</span>
                <Chip
                  className="h-5 text-[10px] font-black bg-primary/10 text-primary border-none"
                  size="sm"
                  variant="flat"
                >
                  {totalOrders}
                </Chip>
              </div>
            }
          />
          {/* Only show Table tab for Restaurants */}
          {IS_RESTAURANT && (
            <Tab
              key="TABLE"
              title={
                <div className="flex items-center gap-2">
                  <Armchair
                    className={
                      selectedSource === "TABLE"
                        ? "text-primary"
                        : "text-default-400"
                    }
                    size={18}
                  />
                  <span className="text-sm">{t("order.fromTable")}</span>
                  {sourceCounts.TABLE > 0 && (
                    <Chip
                      className="h-4 text-[9px] font-bold"
                      size="sm"
                      variant="flat"
                    >
                      {sourceCounts.TABLE}
                    </Chip>
                  )}
                </div>
              }
            />
          )}

          {/* Only show Cafe tab for Cafes and Restaurants */}
          {(IS_CAFE || IS_RESTAURANT) && (
            <Tab
              key="CAFE"
              title={
                <div className="flex items-center gap-2">
                  <Coffee
                    className={
                      selectedSource === "CAFE"
                        ? "text-primary"
                        : "text-default-400"
                    }
                    size={18}
                  />
                  <span className="text-sm">{t("order.fromCafe")}</span>
                  {sourceCounts.CAFE > 0 && (
                    <Chip
                      className="h-4 text-[9px] font-bold"
                      size="sm"
                      variant="flat"
                    >
                      {sourceCounts.CAFE}
                    </Chip>
                  )}
                </div>
              }
            />
          )}
        </Tabs>
      </div>

      {/* Main List Section - Desktop Table / Mobile Cards */}
      <div className="flex-grow min-h-0 overflow-y-auto scrollbar-hide pb-20">
        {/* Mobile List View */}
        <div className="sm:hidden space-y-0.5 -mx-2">
          {isLoading ? (
            <div className="flex justify-center py-10 px-4">
              <EmptyState message={t("order.loading")} />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((item: any) => (
              <Card
                key={item.id}
                isPressable
                className="border-none bg-white rounded-none shadow-none border-b border-divider/60 hover:bg-default-50 transition-all active:scale-[0.99] w-full"
              >
                <CardBody className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-primary font-black text-sm uppercase tracking-tighter">
                        #{item.orderNumber}
                      </span>
                      <span className="text-[10px] text-default-400 font-bold">
                        {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                    <Chip
                      className="font-black h-5 text-[9px]"
                      color={getPaymentMethodColor(item.paymentMethod)}
                      size="sm"
                      variant="flat"
                    >
                      {getPaymentMethodLabel(item.paymentMethod)}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center bg-default-50/50 p-2.5 rounded-2xl border border-divider/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-default-400 font-black uppercase tracking-wider">
                        {t("order.grandTotal")}
                      </span>
                      <span className="text-base font-black text-primary">
                        {formatNumber(item.totalAmount)}{" "}
                        {t("order.kip") || "ກີບ"}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-default-400 font-black uppercase tracking-wider">
                        {t("order.tableEmployee")}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-default-700">
                        {item.businessType === "CAFE" ? (
                          <span className="bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
                            Cafe
                          </span>
                        ) : item.table?.name ? (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {item.table.name}
                          </span>
                        ) : (
                          <span className="bg-default-100 text-default-600 px-2 py-0.5 rounded-full">
                            {t("order.shopFloor")}
                          </span>
                        )}
                        <span className="text-default-300">|</span>
                        <span className="text-default-600">
                          {item.employee?.name || t("order.owner")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="px-4">
              <EmptyState />
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <GlobalPagination
              compact
              page={page}
              totalItems={totalOrders}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <Table
            aria-label="Order history table"
            bottomContent={
              <GlobalPagination
                page={page}
                results={Math.min(page * limit, totalOrders)}
                showing={(page - 1) * limit + 1}
                totalItems={totalOrders}
                totalPages={totalPages}
                onChange={setPage}
              />
            }
            classNames={{
              wrapper: "border border-divider rounded-2xl overflow-hidden p-0",
              th: "bg-default-50 text-default-600 font-bold h-12 text-center",
              td: "text-center py-3",
            }}
            shadow="none"
          >
            <TableHeader>
              <TableColumn key="no">{t("order.tableRank")}</TableColumn>
              <TableColumn key="orderNumber">
                {t("order.tableOrder")}
              </TableColumn>
              <TableColumn key="itemsCount">
                {t("order.tableItems")}
              </TableColumn>
              {IS_RESTAURANT ? (
                <TableColumn key="table">{t("order.tableTable")}</TableColumn>
              ) : (
                <TableColumn key="table" className="hidden w-0 p-0 h-0">
                  {null}
                </TableColumn>
              )}
              <TableColumn key="date">{t("order.tableDateTime")}</TableColumn>
              <TableColumn key="employee">
                {t("order.tableEmployeeCol")}
              </TableColumn>
              <TableColumn key="payment">{t("order.tablePayment")}</TableColumn>
              <TableColumn key="realMoney">
                {t("order.realMoney") || "ຍອດເງິນຕົວຈິງ"}
              </TableColumn>
              <TableColumn key="discount">
                {t("order.discount") || "ສ່ວນຫຼຸດ"}
              </TableColumn>
              <TableColumn key="receivedAmount">
                {t("order.receivedAmount") || "ເງິນຮັບມາ"}
              </TableColumn>


              <TableColumn key="change">
                {t("order.change") || "ເງິນທອນ"}
              </TableColumn>
              <TableColumn key="free">
                {t("order.freeItems") || "ຂອງແຖມ"}
              </TableColumn>
              <TableColumn key="paymentStatus">
                {t("order.paymentStatus") || "ສະຖານະຊຳລະ"}
              </TableColumn>
              <TableColumn key="actions">{t("order.tableAction")}</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={<EmptyState />}
              isLoading={isLoading}
              items={filteredOrders}
            >
              {(item: any) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-default-50 transition-colors"
                >
                  <TableCell className="font-bold text-xs">
                    {item.displayIndex}
                  </TableCell>
                  <TableCell className="font-black text-primary text-xs uppercase tracking-tighter">
                    #{item.orderNumber}
                  </TableCell>
                  <TableCell className="font-bold text-xs">
                    {item.items.length} {t("order.tableItems")}
                  </TableCell>
                  {IS_RESTAURANT ? (
                    <TableCell className="font-bold text-primary text-xs">
                      {item.businessType === "CAFE"
                        ? "Cafe"
                        : item.table?.name || "-"}
                    </TableCell>
                  ) : (
                    <TableCell className="hidden">{null}</TableCell>
                  )}
                  <TableCell className="text-[10px] font-medium text-default-500">
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {item.employee?.name || t("order.owner")}
                  </TableCell>
                  {item.isDebt ? (
                    <TableCell>
                      <Chip
                        className="font-bold h-5 text-[10px]"
                        color="danger"
                        size="sm"
                        variant="flat"
                      >
                        ຕິດໜີ້
                      </Chip>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Chip
                        className="font-bold h-5 text-[10px]"
                        color={getPaymentMethodColor(item.paymentMethod)}
                        size="sm"
                        variant="flat"
                      >
                        {getPaymentMethodLabel(item.paymentMethod)}
                      </Chip>
                    </TableCell>
                  )}

                  <TableCell className="font-black text-sm text-primary">
                    {formatNumber(
                      Number(item.totalAmount) + Number(item.discountAmount),
                    )}{" "}
                    {t("order.kip") || "ກີບ"}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-danger">
                    {item.isDiscount ? (
                      <div className="flex flex-col">
                        <span className="text-danger">
                          -{formatNumber(item.discountAmount)}{" "}
                          {t("order.kip") || "ກີບ"}
                        </span>
                        <span className="text-[10px] text-default-400">
                          ({item.discountPercent}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-default-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-default-600">
                    {Number(item.receivedAmount) > 0 ? (
                      <span>
                        {formatNumber(item.receivedAmount)}{" "}
                        {t("order.kip") || "ກີບ"}
                      </span>
                    ) : (
                      <span className="text-default-300">-</span>
                    )}
                  </TableCell>

                  <TableCell className="font-bold text-sm text-success">
                    {Number(item.change) > 0 ? (
                      <span>
                        {formatNumber(item.change)} {t("order.kip") || "ກີບ"}
                      </span>
                    ) : (
                      <span className="text-default-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.productFrees && item.productFrees.length > 0 ? (
                      <Chip
                        className="h-5 text-[10px] font-black"
                        color="secondary"
                        size="sm"
                        startContent={<Gift size={10} />}
                        variant="flat"
                      >
                        {t("order.freeItemsCount", {
                          count: item.productFrees.reduce(
                            (acc: number, f: any) => acc + Number(f.amount),
                            0,
                          ),
                        }) ||
                          `× ${item.productFrees.reduce(
                            (acc: number, f: any) => acc + Number(f.amount),
                            0,
                          )}`}
                      </Chip>
                    ) : (
                      <span className="text-default-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="h-5 text-[9px] font-black"
                      color={
                        item.paymentStatus === "PAID"
                          ? "success"
                          : item.paymentStatus === "PARTIALLY_PAID"
                            ? "warning"
                            : "danger"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {item.paymentStatus === "PAID"
                        ? t("order.paid") || "ຊຳລະແລ້ວ"
                        : item.paymentStatus === "PARTIALLY_PAID"
                          ? t("order.partiallyPaid") || "ຊຳລະບາງສ່ວນ"
                          : t("order.unpaid") || "ຍັງບໍ່ຊຳລະ"}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <Button
                      isIconOnly
                      color="primary"
                      size="sm"
                      variant="light"
                      onPress={() => handleViewDetail(item)}
                    >
                      <Eye size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <OrderDetail
        IS_GENERAL_STORE={IS_GENERAL_STORE}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
