import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Divider,
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
  User,
  ShoppingBag,
  Landmark,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import { useGetOrders, Order, OrderItem } from "@/services/order/useOrder";
import dayjs from "dayjs";
import { getDisplayImageUrl, cn } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import { exportOrdersToExcel } from "@/utils/exportOrder";
import EmptyState from "@/components/common/empty-state";

export default function OrderPage() {
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

  const filteredOrders = useMemo(() => {
    let result = ordersWithIndex;
    if (selectedSource === "TABLE") {
      result = result.filter((o: any) => o.tableId || o.table);
    } else if (selectedSource === "DIRECT") {
      result = result.filter((o: any) => !o.tableId && !o.table);
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
        return "ເງິນສົດ";
      case "TRANSFER":
        return "ເງິນໂອນ";
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
            <Receipt size={22} className="sm:size-7" />
            ລາຍການການຂາຍ
          </h1>
          <p className="text-[10px] sm:text-xs text-default-500 font-medium">
            ເບິ່ງປະຫວັດການຂາຍ ແລະ ລາຍລະອຽດແຕ່ລະບິນ
          </p>
        </div>
        <Button
          color="primary"
          variant="flat"
          size="sm"
          startContent={<Download size={16} />}
          className="font-bold hidden sm:flex"
          onPress={() => exportOrdersToExcel(orders)}
        >
          ສົ່ງອອກ (Excel)
        </Button>
      </div>

      <ScrollShadow hideScrollBar className="w-full flex-shrink-0">
        <div className="flex sm:grid sm:grid-cols-3 gap-3 pb-2 min-w-full">
          {/* Box 1: Total Orders */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  ຈຳນວນ Order
                </p>
                <h2 className="text-xl sm:text-2xl font-black">
                  {totalOrders}
                </h2>
              </div>
              <Receipt
                size={60}
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
              />
            </CardBody>
          </Card>

          {/* Box 2: Total Revenue */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white min-w-[200px] sm:min-w-0">
            <CardBody className="p-3 sm:p-4 overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-emerald-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  ລາຍຮັບທັງໝົດ
                </p>
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {formatNumber(totalRevenue)} ກີບ
                </h2>
              </div>
              <Landmark
                size={60}
                className="absolute -right-2 -bottom-2 text-white/10 rotate-12 pointer-events-none"
              />
            </CardBody>
          </Card>

          {/* Box 3: Payment Breakdown */}
          <Card className="border-none shadow-md bg-white dark:bg-gray-800 ring-1 ring-divider/50 min-w-[240px] sm:min-w-0">
            <CardBody className="p-2 sm:p-3">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-default-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  ແບ່ງຕາມການຊຳລະ
                </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                    <span className="text-[10px] font-bold">
                      {formatNumber(totalCash)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-[10px] font-bold">
                      {formatNumber(totalTransfer)}
                    </span>
                  </div>
                </div>
              </div>
              <ScrollShadow size={20} className="max-h-[34px] overflow-y-auto">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {transfersByBank.map((bank: any) => (
                    <div
                      key={bank.name}
                      className="flex items-center gap-1.5 text-[9px] text-default-500"
                    >
                      {bank.logoUrl && (
                        <Image
                          src={getDisplayImageUrl(bank.logoUrl)}
                          className="w-3 h-3 rounded-full object-cover"
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
            placeholder="ຄົ້ນຫາເລກທີບິນ..."
            value={search}
            onValueChange={setSearch}
            startContent={<Search size={16} className="text-primary/60" />}
            variant="flat"
            size="sm"
            className="flex-grow"
          />
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="flat" color="primary" size="sm">
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
                startContent={<Calendar size={14} className="text-success" />}
              >
                ມື້ນີ້
              </DropdownItem>
              <DropdownItem key="yesterday">ມື້ວານ</DropdownItem>
              <DropdownItem key="3days">3 ມື້ຜ່ານມາ</DropdownItem>
              <DropdownItem key="7days">7 ມື້ຜ່ານມາ</DropdownItem>
              <DropdownItem key="1month">1 ເດືອນຜ່ານມາ</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-default-100 p-1 rounded-lg border border-divider">
            <span className="text-[9px] font-black text-default-400 px-1 uppercase">
              ເລີ່ມ
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold outline-none"
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-default-100 p-1 rounded-lg border border-divider">
            <span className="text-[9px] font-black text-default-400 px-1 uppercase">
              ຈົບ
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 -mb-2">
        <Tabs
          aria-label="Order Source"
          color="primary"
          variant="underlined"
          selectedKey={selectedSource}
          onSelectionChange={(key) => setSelectedSource(key as string)}
          size="sm"
          classNames={{
            tabList: "gap-2 sm:gap-4",
            cursor: "w-full bg-primary",
            tabContent:
              "group-data-[selected=true]:text-primary font-black text-[11px] sm:text-xs",
          }}
        >
          <Tab
            key="ALL"
            title={
              <div className="flex items-center gap-1.5">
                <span>ທັງໝົດ</span>
                <Chip
                  size="sm"
                  variant="flat"
                  className="h-4 sm:h-5 text-[9px]"
                >
                  {totalOrders}
                </Chip>
              </div>
            }
          />
          <Tab key="TABLE" title="ມາຈາກໂຕະ" />
          <Tab key="DIRECT" title="ມາຈາກໜ້າຮ້ານ" />
        </Tabs>
      </div>

      {/* Main List Section - Desktop Table / Mobile Cards */}
      <div className="flex-grow min-h-0 overflow-y-auto scrollbar-hide pb-20">
        {/* Mobile List View */}
        <div className="sm:hidden space-y-0.5 -mx-2">
          {isLoading ? (
            <div className="flex justify-center py-10 px-4">
              <EmptyState message="ກຳລັງໂຫຼດຮາງ..." />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((item: any) => (
              <Card
                key={item.id}
                isPressable
                onPress={() => handleViewDetail(item)}
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
                      size="sm"
                      color={getPaymentMethodColor(item.paymentMethod)}
                      variant="flat"
                      className="font-black h-5 text-[9px]"
                    >
                      {getPaymentMethodLabel(item.paymentMethod)}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center bg-default-50/50 p-2.5 rounded-2xl border border-divider/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-default-400 font-black uppercase tracking-wider">
                        ຍອດລວມທັງໝົດ
                      </span>
                      <span className="text-base font-black text-primary">
                        {formatNumber(item.totalAmount)} ກີບ
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-default-400 font-black uppercase tracking-wider">
                        ໂຕະ / ພະນັກງານ
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-default-700">
                        {item.table?.name ? (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {item.table.name}
                          </span>
                        ) : (
                          <span className="bg-default-100 text-default-600 px-2 py-0.5 rounded-full">
                            ໜ້າຮ້ານ
                          </span>
                        )}
                        <span className="text-default-300">|</span>
                        <span className="text-default-600">
                          {item.employee?.name || "ເຈົ້າຂອງ"}
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
              page={page}
              totalPages={totalPages}
              totalItems={totalOrders}
              onChange={setPage}
              compact
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <Table
            aria-label="Order history table"
            shadow="none"
            classNames={{
              wrapper: "border border-divider rounded-2xl overflow-hidden p-0",
              th: "bg-default-50 text-default-600 font-bold h-12 text-center",
              td: "text-center py-3",
            }}
            bottomContent={
              <GlobalPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalOrders}
                showing={(page - 1) * limit + 1}
                results={Math.min(page * limit, totalOrders)}
                onChange={setPage}
              />
            }
          >
            <TableHeader>
              <TableColumn key="no">ລຳດັບ</TableColumn>
              <TableColumn key="orderNumber">ເລກທີບິນ</TableColumn>
              <TableColumn key="itemsCount">ລາຍການ</TableColumn>
              <TableColumn key="table">ໂຕະ</TableColumn>
              <TableColumn key="date">ວັນທີ/ເວລາ</TableColumn>
              <TableColumn key="employee">ພະນັກງານ</TableColumn>
              <TableColumn key="payment">ຊຳລະດ້ວຍ</TableColumn>
              <TableColumn key="total">ຍອດລວມ</TableColumn>
              <TableColumn key="actions">ຈັດການ</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent={<EmptyState />}
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
                    {item.items.length} ລາຍການ
                  </TableCell>
                  <TableCell className="font-bold text-primary text-xs">
                    {item.table?.name || "-"}
                  </TableCell>
                  <TableCell className="text-[10px] font-medium text-default-500">
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {item.employee?.name || "ເຈົ້າຂອງຮ້ານ"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getPaymentMethodColor(item.paymentMethod)}
                      variant="flat"
                      className="font-bold h-5 text-[10px]"
                    >
                      {getPaymentMethodLabel(item.paymentMethod)}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-black text-sm text-primary">
                    {formatNumber(item.totalAmount)} ກີບ
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
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

      {/* Order Detail Modal - Mobile Optimized */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        className="mx-0 sm:mx-2"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 border-b bg-default-50/50">
                <span className="text-primary font-black text-xl uppercase tracking-tighter leading-tight">
                  ບິນ #{selectedOrder?.orderNumber}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-default-400">
                  {dayjs(selectedOrder?.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss",
                  )}
                </span>
              </ModalHeader>
              <ModalBody className="p-0 sm:p-4">
                <div className="p-4 space-y-4">
                  {/* Summary Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <User size={14} className="text-default-400 mb-1" />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        ພະນັກງານ
                      </span>
                      <span className="text-[10px] font-black truncate w-full text-center">
                        {selectedOrder?.employee?.name || "ເຈົ້າຂອງ"}
                      </span>
                    </div>
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <ShoppingBag
                        size={14}
                        className="text-default-400 mb-1"
                      />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        ໂຕະ
                      </span>
                      <span className="text-[10px] font-black text-primary">
                        {selectedOrder?.table?.name || "ໜ້າຮ້ານ"}
                      </span>
                    </div>
                    <div className="bg-default-100 p-2 rounded-xl flex flex-col items-center">
                      <Banknote size={14} className="text-default-400 mb-1" />
                      <span className="text-[9px] font-bold text-default-400 uppercase">
                        ການຊຳລະ
                      </span>
                      <Chip
                        size="sm"
                        color={getPaymentMethodColor(
                          selectedOrder?.paymentMethod || "",
                        )}
                        variant="flat"
                        className="h-4 text-[8px] font-black"
                      >
                        {getPaymentMethodLabel(
                          selectedOrder?.paymentMethod || "",
                        )}
                      </Chip>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <p className="font-black text-sm flex items-center gap-2 text-default-700">
                      <Receipt size={16} className="text-primary" />
                      ລາຍການສິນຄ້າ ({selectedOrder?.items.length})
                    </p>
                    <div className="space-y-1.5 border border-divider rounded-2xl overflow-hidden p-1 bg-default-50/30">
                      {selectedOrder?.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white p-2 rounded-xl border border-divider/50 shadow-sm"
                        >
                          <Image
                            src={getDisplayImageUrl(item.product.image)}
                            className="w-10 h-10 min-w-[40px] object-cover"
                            radius="md"
                          />
                          <div className="flex-grow flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate">
                              {item.product.name}
                            </span>
                            <div className="flex justify-between items-center mt-0.5">
                              <span className="text-[10px] text-default-400 font-bold">
                                x{item.qty} @ {formatNumber(item.unitPrice)}
                              </span>
                              <span className="text-xs font-black text-primary">
                                {formatNumber(item.subTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals Section */}
                  <div className="bg-gradient-to-br from-primary to-primary-700 p-4 rounded-3xl text-white shadow-lg shadow-primary/30 space-y-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 rotate-12 -mr-6 -mt-4">
                      <Landmark size={120} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                      <span>ລາຄາລວມ:</span>
                      <span>
                        {formatNumber(selectedOrder?.totalAmount)} ກີບ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/70 font-bold uppercase tracking-widest">
                      <span>ຮັບເງິນມາ:</span>
                      <span>
                        {formatNumber(selectedOrder?.receivedAmount)} ກີບ
                      </span>
                    </div>
                    <Divider className="bg-white/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-tighter">
                        ເງິນທອນ:
                      </span>
                      <span className="text-xl font-black">
                        {formatNumber(selectedOrder?.change)} ກີບ
                      </span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t bg-default-50 p-4">
                <Button
                  variant="flat"
                  onPress={onClose}
                  className="font-bold flex-grow sm:flex-grow-0"
                >
                  ປິດໜ້າຕ່າງ
                </Button>
                <Button
                  color="primary"
                  className="font-black flex-grow sm:flex-grow-0 shadow-md shadow-primary/20"
                  startContent={<Download size={18} />}
                >
                  ພິມບິນຄືນ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
