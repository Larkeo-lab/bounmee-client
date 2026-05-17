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
  Card,
  CardBody,
  ScrollShadow,
} from "@heroui/react";
import {
  Eye,
  Receipt,
  Download,
  Search,
  Landmark,
  TrendingDown,
  AlertCircle,
  HandCoins,
  CheckCircle2,
} from "lucide-react";
import dayjs from "dayjs";

import { OrderDetail } from "../order/OrderDetail";
import ConfirmDebtModal from "./confirmDebt";

import { useAuth } from "@/routes/AuthContext";
import {
  useGetOrders,
  Order,
  useUpdateOrderStatus,
} from "@/services/order/useOrder";
import toast from "react-hot-toast";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import { exportOrdersToExcel } from "@/utils/exportOrder";
import EmptyState from "@/components/common/empty-state";
import FilterDate from "@/components/common/fillterDate";

export default function DebtHistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
    onOpenChange: onConfirmOpenChange,
  } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateStatusMutation = useUpdateOrderStatus();

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [startDate, setStartDate] = useState(
    dayjs().subtract(1, "month").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const IS_GENERAL_STORE = user?.user?.store?.type === "GENERAL_STORE";

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
    isDebt: true, // Crucial filter for debt history
    employeeId:
      user?.user?.role === "EMPLOYEE" ? user?.user?.employeeId : undefined,
  });

  useEffect(() => {
    refetch();
  }, [refetch, page, startDate, endDate, debouncedSearch]);

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

  const summary = orderResponse?.summary;
  const totalDebt = summary?.totalDebt || 0;
  const totalAmount = summary?.totalAmount || 0;
  const totalPaidAmount = summary?.totalPaidAmount || 0;

  console.log("summary", summary);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handlePayment = (order: Order) => {
    setSelectedOrder(order);
    onConfirmOpen();
  };

  const handleConfirmPayment = async (data: {
    paymentStatus: string;
    receivedAmount: number;
    note?: string;
    bankId?: string | null;
    paymentMethod?: string;
  }) => {
    if (!selectedOrder) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        paymentStatus: data.paymentStatus,
        receivedAmount: data.receivedAmount,
        note: data.note,
        bankId: data.bankId,
        paymentMethod: data.paymentMethod,
      });
      toast.success(t("common.success") || "ຊຳລະສຳເລັດ");
      onConfirmClose();
      refetch();
    } catch (error) {
      toast.error(t("common.error") || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PARTIALLY_PAID":
        return "warning";
      case "UNPAID":
        return "danger";
      default:
        return "default";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return t("order.paid") || "ຊຳລະແລ້ວ";
      case "PARTIALLY_PAID":
        return t("order.partiallyPaid") || "ຊຳລະບາງສ່ວນ";
      case "UNPAID":
        return t("order.unpaid") || "ຍັງບໍ່ຊຳລະ";
      default:
        return status;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] sm:h-auto flex flex-col overflow-hidden sm:overflow-visible space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6 bg-default-50/50">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-divider pb-3 bg-white/50 backdrop-blur-md sticky top-0 z-20 -mx-2 px-4 py-2 sm:mx-0 sm:px-0 sm:pt-0 sm:static sm:bg-transparent">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-danger flex items-center gap-2">
            <TrendingDown className="sm:size-7" size={22} />
            {t("debt.title") || "ປະຫວັດການຕິດໜີ້"}
          </h1>
          <p className="text-[10px] sm:text-xs text-default-500 font-medium">
            {t("debt.desc") || "ຈັດການ ແລະ ຕິດຕາມລາຍການທີ່ຍັງບໍ່ທັນຊຳລະ"}
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
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2 min-w-full">
          {/* Box 1: Total Debt Orders */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-orange-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("debt.totalDebtOrders") || "ຈຳນວນລາຍການຕິດໜີ້"}
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

          {/* Box 2: Total Amount */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("debt.totalAmount") || "ຍອດໜີ້ລວມທັງໝົດ"}
                </p>
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {formatNumber(totalAmount)} {t("order.kip") || "ກີບ"}
                </h2>
              </div>
              <Landmark
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
                size={60}
              />
            </CardBody>
          </Card>

          {/* Box 3: Total Paid Amount */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-emerald-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("debt.totalPaidAmount") || "ຈ່າຍແລ້ວທັງໝົດ"}
                </p>
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {formatNumber(totalPaidAmount)} {t("order.kip") || "ກີບ"}
                </h2>
              </div>
              <CheckCircle2
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
                size={60}
              />
            </CardBody>
          </Card>

          {/* Box 4: Remaining Debt */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-rose-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {t("debt.remainingDebt") || "ຍັງບໍ່ທັນຈ່າຍ"}
                </p>
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {formatNumber(totalDebt)} {t("order.kip") || "ກີບ"}
                </h2>
              </div>
              <AlertCircle
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
                size={60}
              />
            </CardBody>
          </Card>
        </div>
      </ScrollShadow>

      {/* Filter Bar */}
      <div className="flex flex-col gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-2 rounded-2xl border border-divider shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Input
            isClearable
            className="flex-grow"
            placeholder={
              t("debt.searchPlaceholder") || "ຄົ້ນຫາຕາມເລກບິນ ຫຼື ຊື່ລູກຄ້າ..."
            }
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

      {/* Main List Section */}
      <div className="flex-grow min-h-0 overflow-y-auto scrollbar-hide pb-20">
        {/* Mobile List View */}
        <div className="sm:hidden space-y-0.5 -mx-2">
          {isLoading ? (
            <div className="flex justify-center py-10 px-4">
              <EmptyState message={t("order.loading")} />
            </div>
          ) : ordersWithIndex.length > 0 ? (
            ordersWithIndex.map((item: any) => (
              <Card
                key={item.id}
                className="border-none bg-white rounded-none shadow-none border-b border-divider/60 hover:bg-default-50 transition-all w-full "
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
                      color={getPaymentStatusColor(item.paymentStatus)}
                      size="sm"
                      variant="flat"
                    >
                      {getPaymentStatusLabel(item.paymentStatus)}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">
                      {t("debt.customer") || "ລູກຄ້າ"}:
                    </span>
                    <span className="text-xs font-bold text-default-700">
                      {item.member?.name ||
                        t("debt.generalCustomer") ||
                        "ລູກຄ້າທົ່ວໄປ"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-danger-50/30 p-2.5 rounded-2xl border border-danger/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-danger-400 font-black uppercase tracking-wider">
                        {t("debt.debtAmount") || "ຍອດໜີ້"}
                      </span>
                      <span className="text-base font-black text-danger">
                        {formatNumber(
                          item.totalAmount - (item.receivedAmount || 0),
                        )}{" "}
                        {t("order.kip") || "ກີບ"}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-default-400 font-black uppercase tracking-wider">
                        {t("debt.dueDate") || "ກຳນົດຊຳລະ"}
                      </span>
                      <span className="text-[10px] font-bold text-default-700">
                        {item.dueDate
                          ? dayjs(item.dueDate).format("DD/MM/YYYY")
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-divider/40">
                    <Button
                      fullWidth
                      className="font-bold bg-primary/10 text-primary"
                      size="sm"
                      startContent={<Eye size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(item);
                      }}
                    >
                      {t("common.viewDetail") || "ເບິ່ງລາຍລະອຽດ"}
                    </Button>
                    <Button
                      fullWidth
                      className="font-bold bg-success/10 text-success"
                      size="sm"
                      startContent={<HandCoins size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(item);
                      }}
                    >
                      {t("common.payment") || "ຊຳລະ"}
                    </Button>
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
            aria-label="Debt history table"
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
              <TableColumn key="customer">
                {t("debt.customer") || "ລູກຄ້າ"}
              </TableColumn>
              <TableColumn key="date">{t("order.tableDateTime")}</TableColumn>
              <TableColumn key="dueDate">
                {t("debt.dueDate") || "ກຳນົດຊຳລະ"}
              </TableColumn>
              <TableColumn key="total">
                {t("debt.totalAmount") || "ຍອດທັງໝົດ"}
              </TableColumn>
              <TableColumn key="paid">
                {t("debt.paidAmount") || "ຊຳລະແລ້ວ"}
              </TableColumn>
              <TableColumn key="debt">
                {t("debt.debtAmount") || "ຍອດໜີ້"}
              </TableColumn>
              <TableColumn key="status">
                {t("debt.status") || "ສະຖານະ"}
              </TableColumn>
              <TableColumn key="actions">{t("order.tableAction")}</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={<EmptyState />}
              isLoading={isLoading}
              items={ordersWithIndex}
            >
              {(item: any) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-default-50 transition-colors "
                >
                  <TableCell className="font-bold text-xs">
                    {item.displayIndex}
                  </TableCell>
                  <TableCell className="font-black text-primary text-xs uppercase tracking-tighter">
                    #{item.orderNumber}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {item.member?.name ||
                      t("debt.generalCustomer") ||
                      "ລູກຄ້າທົ່ວໄປ"}
                  </TableCell>
                  <TableCell className="text-[10px] font-medium text-default-500">
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-danger">
                    {item.dueDate
                      ? dayjs(item.dueDate).format("DD/MM/YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-bold text-xs">
                    {formatNumber(item.totalAmount)}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-success">
                    {formatNumber(item.receivedAmount || 0)}
                  </TableCell>
                  <TableCell className="font-black text-sm text-danger">
                    {formatNumber(
                      item.totalAmount - (item.receivedAmount || 0),
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="h-5 text-[9px] font-black"
                      color={getPaymentStatusColor(item.paymentStatus)}
                      size="sm"
                      variant="flat"
                    >
                      {getPaymentStatusLabel(item.paymentStatus)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(item);
                        }}
                        title={t("common.viewDetail") || "View Details"}
                      >
                        <Eye size={18} />
                      </Button>
                      <Button
                        isIconOnly
                        color="success"
                        isDisabled={item.paymentStatus === "PAID"}
                        size="sm"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(item);
                        }}
                        title={t("common.payment") || "Payment"}
                      >
                        <HandCoins size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Debt Detail Modal */}
      <OrderDetail
        IS_GENERAL_STORE={IS_GENERAL_STORE}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedOrder={selectedOrder}
      />

      {/* Confirm Payment Modal */}
      <ConfirmDebtModal
        isOpen={isConfirmOpen}
        onOpenChange={onConfirmOpenChange}
        order={selectedOrder}
        onConfirm={handleConfirmPayment}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
