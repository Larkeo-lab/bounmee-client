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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Eye,
  Receipt,
  Download,
  Filter,
  Search,
  Calendar,
  ShoppingBag,
  Landmark,
  LayoutGrid,
  Coffee,
  Armchair,
} from "lucide-react";
import dayjs from "dayjs";

import { OrderDetail } from "./OrderDetail";

import { useAuth } from "@/routes/AuthContext";
import { useGetOrders, Order } from "@/services/order/useOrder";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import { exportOrdersToExcel } from "@/utils/exportOrder";
import EmptyState from "@/components/common/empty-state";

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
      default:
        return method;
    }
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
          onPress={() => exportOrdersToExcel(orders)}
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
        <div className="flex gap-2">
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
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly color="primary" size="sm" variant="flat">
                <Filter size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="ລະຍะເວລາ"
              className="font-bold"
              onAction={(key: any) => {
                const today = dayjs().format("YYYY-MM-DD");
                let start = today;
                let end = today;

                switch (key) {
                  case "today":
                    start = today;
                    break;
                  case "yesterday":
                    start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
                    end = start;
                    break;
                  case "3days":
                    start = dayjs().subtract(2, "day").format("YYYY-MM-DD");
                    break;
                  case "7days":
                    start = dayjs().subtract(6, "day").format("YYYY-MM-DD");
                    break;
                  case "1month":
                    start = dayjs().subtract(1, "month").format("YYYY-MM-DD");
                    break;
                }
                setStartDate(start);
                setEndDate(end);
              }}
            >
              <DropdownItem
                key="today"
                startContent={<Calendar className="text-success" size={14} />}
              >
                {t("order.today")}
              </DropdownItem>
              <DropdownItem key="yesterday">
                {t("order.yesterday")}
              </DropdownItem>
              <DropdownItem key="3days">{t("order.last3Days")}</DropdownItem>
              <DropdownItem key="7days">{t("order.last7Days")}</DropdownItem>
              <DropdownItem key="1month">{t("order.lastMonth")}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-default-100 p-1 rounded-lg border border-divider">
            <span className="text-[9px] font-black text-default-400 px-1 uppercase">
              {t("order.start")}
            </span>
            <input
              className="bg-transparent border-none text-[10px] font-bold outline-none"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-default-100 p-1 rounded-lg border border-divider">
            <span className="text-[9px] font-black text-default-400 px-1 uppercase">
              {t("order.end")}
            </span>
            <input
              className="bg-transparent border-none text-[10px] font-bold outline-none"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
          {user?.user?.store?.type === "RESTAURANT" && (
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

          {/* Only show Direct tab for General stores and Restaurants */}
          {user?.user?.store?.type === "GENERAL_STORE" && (
            <Tab
              key="DIRECT"
              title={
                <div className="flex items-center gap-2">
                  <ShoppingBag
                    className={
                      selectedSource === "DIRECT"
                        ? "text-primary"
                        : "text-default-400"
                    }
                    size={18}
                  />
                  <span className="text-sm">{t("order.fromShop")}</span>
                  {sourceCounts.DIRECT > 0 && (
                    <Chip
                      className="h-4 text-[9px] font-bold"
                      size="sm"
                      variant="flat"
                    >
                      {sourceCounts.DIRECT}
                    </Chip>
                  )}
                </div>
              }
            />
          )}

          {/* Only show Cafe tab for Cafes and Restaurants */}
          {(user?.user?.store?.type === "CAFE" ||
            user?.user?.store?.type === "RESTAURANT") && (
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
                onPress={() => handleViewDetail(item)}
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
              <TableColumn key="table">{t("order.tableTable")}</TableColumn>
              <TableColumn key="date">{t("order.tableDateTime")}</TableColumn>
              <TableColumn key="employee">
                {t("order.tableEmployeeCol")}
              </TableColumn>
              <TableColumn key="payment">{t("order.tablePayment")}</TableColumn>
              <TableColumn key="total">{t("order.tableTotal")}</TableColumn>
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
                  className="hover:bg-default-50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(item)}
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
                  <TableCell className="font-bold text-primary text-xs">
                    {item.businessType === "CAFE"
                      ? "Cafe"
                      : item.table?.name || "-"}
                  </TableCell>
                  <TableCell className="text-[10px] font-medium text-default-500">
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {item.employee?.name || t("order.owner")}
                  </TableCell>
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
                  <TableCell className="font-black text-sm text-primary">
                    {formatNumber(item.totalAmount)} {t("order.kip") || "ກີບ"}
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
        isOpen={isOpen}
        selectedOrder={selectedOrder}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
