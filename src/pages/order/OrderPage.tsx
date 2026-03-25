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
} from "@heroui/react";
import { Eye, Receipt, Download, Filter, Search } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import { useGetOrders, Order, OrderItem } from "@/services/order/useOrder";
import dayjs from "dayjs";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import GlobalPagination from "@/components/common/globle-pagination";
import { exportOrdersToExcel } from "@/utils/exportOrder";

export default function OrderPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  // Added memoized orders with index to fix NaN issue
  const ordersWithIndex = useMemo(() => {
    return orders.map((order: Order, index: number) => ({
      ...order,
      displayIndex: (page - 1) * limit + index + 1,
    }));
  }, [orders, page, limit]);

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
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Receipt size={28} />
            ລາຍການການຂາຍ
          </h1>
          <p className="text-default-500">
            ເບິ່ງປະຫວັດການຂາຍ ແລະ ລາຍລະອຽດແຕ່ລະບິນ
          </p>
        </div>
        <Button
          color="primary"
          variant="flat"
          startContent={<Download size={20} />}
          className="font-bold"
          onPress={() => exportOrdersToExcel(orders)}
        >
          ສົ່ງອອກ (Excel)
        </Button>
      </div>
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box 1: Total Orders */}
        <Card className="border-none shadow-sm bg-blue-500 text-white overflow-hidden relative">
          <CardBody className="p-6 overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">
                ຈຳນວນ Order ທັງໝົດ
              </p>
              <h2 className="text-4xl font-black">{totalOrders} </h2>
            </div>
            <Receipt
              size={120}
              className="absolute -right-8 -bottom-8 text-white/10 rotate-12 pointer-events-none"
            />
          </CardBody>
        </Card>

        {/* Box 2: Total Revenue (on current page) */}
        <Card className="border-none shadow-sm bg-emerald-500 text-white overflow-hidden relative">
          <CardBody className="p-6 overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">
                ລາຍຮັບທັງໝົດ
              </p>
              <h2 className="text-4xl font-black">
                {formatNumber(totalRevenue)} ກີບ
              </h2>
            </div>
            <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none"></div>
          </CardBody>
        </Card>

        {/* Box 3: Payment Breakdown */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden ring-1 ring-divider/50">
          <CardBody className="p-6">
            <p className="text-default-400 text-sm font-bold uppercase tracking-wider mb-3">
              ແບ່ງຕາມການຊຳລະ
            </p>
            <ScrollShadow
              size={20}
              className="max-h-[140px] overflow-y-auto pr-2 -mr-2"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    ເງິນສົດ (Cash)
                  </span>
                  <span className="font-bold">
                    {formatNumber(totalCash)} ກີບ
                  </span>
                </div>
                {transfersByBank.length > 0 && (
                  <>
                    <Divider className="my-1 opacity-50" />
                    <div className="flex justify-between items-center text-sm font-bold text-primary">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        ເງິນໂອນລວມ (Total Transfer)
                      </span>
                      <span>{formatNumber(totalTransfer)} ກີບ</span>
                    </div>
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-primary/20 ml-1">
                      {transfersByBank.map((bank: { name: string; logoUrl?: string; total: number }) => (
                        <div
                          key={bank.name}
                          className="flex justify-between items-center text-[12px] text-default-500"
                        >
                          <span className="flex items-center gap-2">
                            {bank.logoUrl ? (
                              <Image
                                src={getDisplayImageUrl(bank.logoUrl)}
                                className="w-3 h-3 rounded-full object-cover grayscale-[0.5]"
                              />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-default-400"></div>
                            )}
                            {bank.name}
                          </span>
                          <span className="font-medium">
                            {formatNumber(bank.total)} ກີບ
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between w-full bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-divider/50">
        {/* Search on the Left */}
        <div className="w-full lg:max-w-md">
          <Input
            isClearable
            placeholder="ຄົ້ນຫາເລກທີບິນ..."
            value={search}
            onValueChange={setSearch}
            startContent={<Search size={20} className="text-primary/60" />}
            variant="flat"
            className="w-full"
            size="lg"
            classNames={{
              inputWrapper:
                "bg-white dark:bg-gray-900 border-none shadow-sm h-14",
            }}
          />
        </div>

        {/* Date Filters on the Right */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          <div className="flex items-center gap-4 w-full sm:w-auto bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-divider/50">
            {/* Quick Filter Dropdown */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="flat"
                  color="primary"
                  size="sm"
                  className="font-bold min-w-[120px]"
                  startContent={<Filter size={18} />}
                >
                  ຕົວຕອງດ່ວນ
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="ລະຍະເວລາ"
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
                  startContent={
                    <div className="w-2 h-2 rounded-full bg-success" />
                  }
                >
                  ມື້ນີ້
                </DropdownItem>
                <DropdownItem key="yesterday">ມື້ວານ</DropdownItem>
                <DropdownItem key="3days">3 ມື້ຜ່ານມາ</DropdownItem>
                <DropdownItem key="7days">7 ມື້ຜ່ານມາ</DropdownItem>
                <DropdownItem key="1month">1 ເດືອນຜ່ານມາ</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Divider orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-default-400 uppercase min-w-[50px]">
                ເລີ່ມຕົ້ນ
              </span>
              <Input
                type="date"
                value={startDate}
                onValueChange={setStartDate}
                variant="flat"
                size="sm"
                className="w-full sm:w-40"
                classNames={{
                  inputWrapper: "bg-default-100/50 border-none",
                }}
              />
            </div>
            <Divider orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-default-400 uppercase min-w-[50px]">
                ສິ້ນສຸດ
              </span>
              <Input
                type="date"
                value={endDate}
                onValueChange={setEndDate}
                variant="flat"
                size="sm"
                className="w-full sm:w-40"
                classNames={{
                  inputWrapper: "bg-default-100/50 border-none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Table
        aria-label="Order history table"
        className="mt-4"
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
        bottomContent={
          <GlobalPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalOrders}
            showing={totalOrders > 0 ? (page - 1) * limit + 1 : 0}
            results={Math.min(page * limit, totalOrders)}
            onChange={setPage}
          />
        }
      >
        <TableHeader>
          <TableColumn key="no">ລຳດັບ</TableColumn>
          <TableColumn key="orderNumber">ເລກທີບິນ</TableColumn>
          <TableColumn key="itemsCount">ລາຍການ</TableColumn>
          <TableColumn key="date">ວັນທີ/ເວລາ</TableColumn>
          <TableColumn key="employee">ພະນັກງານ</TableColumn>
          <TableColumn key="payment">ຊຳລະດ້ວຍ</TableColumn>
          <TableColumn key="total">ຍອດລວມ</TableColumn>
          <TableColumn key="actions" align="center">
            ຈັດການ
          </TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          emptyContent={"ບໍ່ມີຂໍ້ມູນໃຫ້ສະແດງ"}
          items={ordersWithIndex}
        >
          {(item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-bold text-primary">
                {item.displayIndex}
              </TableCell>
              <TableCell className="font-bold text-primary">
                #{item.orderNumber}
              </TableCell>
              <TableCell className="font-bold">
                {item.items.length} ລາຍການ
              </TableCell>
              <TableCell>
                {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
              </TableCell>
              <TableCell>{item.employee?.name || "ເຈົ້າຂອງຮ້ານ"}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={getPaymentMethodColor(item.paymentMethod)}
                  variant="flat"
                  className="font-bold"
                >
                  {getPaymentMethodLabel(item.paymentMethod)}
                </Chip>
              </TableCell>
              <TableCell className="font-bold text-lg">
                {formatNumber(item.totalAmount)} ກີບ
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => handleViewDetail(item)}
                  >
                    <Eye size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Order Detail Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b">
                ລາຍລະອຽດບິນ #{selectedOrder?.orderNumber}
                <span className="text-sm font-normal text-default-500">
                  {dayjs(selectedOrder?.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss",
                  )}
                </span>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-1">
                    <p className="text-xs text-default-500 uppercase font-bold tracking-wider">
                      ຂໍ້ມູນພະນັກງານ
                    </p>
                    <p className="font-semibold text-lg">
                      {selectedOrder?.employee?.name || "ເຈົ້າຂອງຮ້ານ"}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-default-500 uppercase font-bold tracking-wider">
                      ຮູບແບບການຊຳລະ
                    </p>
                    <Chip
                      color={getPaymentMethodColor(
                        selectedOrder?.paymentMethod || "",
                      )}
                      variant="flat"
                      className="font-bold"
                    >
                      {getPaymentMethodLabel(
                        selectedOrder?.paymentMethod || "",
                      )}
                    </Chip>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-bold text-lg flex items-center gap-2">
                    <Receipt size={20} className="text-primary" />
                    ລາຍການສິນຄ້າ
                  </p>
                  <div className="border border-divider rounded-xl overflow-hidden">
                    <Table
                      aria-label="Order items table"
                      removeWrapper
                      className="min-w-full"
                    >
                      <TableHeader>
                        <TableColumn>ສິນຄ້າ</TableColumn>
                        <TableColumn>ບາໂຄດ</TableColumn>
                        <TableColumn className="text-center">ຈຳນວນ</TableColumn>
                        <TableColumn className="text-right">ລາຄາ</TableColumn>
                        <TableColumn className="text-right">ລວມ</TableColumn>
                      </TableHeader>
                      <TableBody items={selectedOrder?.items || []}>
                        {(item: OrderItem) => (
                          <TableRow
                            key={item.id}
                            className="border-t border-divider"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Image
                                  src={getDisplayImageUrl(item.product.image)}
                                  className="w-12 h-12 min-w-[48px] object-cover"
                                  radius="md"
                                />
                                <div className="flex flex-col">
                                  <span className="font-semibold">
                                    {item.product.name}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-start font-bold">
                              {item.product.barcode}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              x{item.qty}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatNumber(item.subTotal)}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-8 space-y-3 bg-default-50 p-6 rounded-2xl">
                  <div className="flex justify-between items-center text-default-600">
                    <span>ຍອດລວມ:</span>
                    <span className="font-semibold">
                      {formatNumber(selectedOrder?.totalAmount)} ກີບ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>ຮັບເງິນມາ:</span>
                    <span className="font-semibold">
                      {formatNumber(selectedOrder?.receivedAmount)} ກີບ
                    </span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center text-xl font-black">
                    <span className="text-primary">ເງິນທອນ:</span>
                    <span className="text-primary">
                      {formatNumber(selectedOrder?.change)} ກີບ
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t">
                <Button variant="light" onPress={onClose} className="font-bold">
                  ປິດ
                </Button>
                <Button
                  color="primary"
                  className="font-bold"
                  startContent={<Download size={20} />}
                >
                  ພິມບິນ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
