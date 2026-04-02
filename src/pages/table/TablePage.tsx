import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/routes/AuthContext";
import { useGetTables, useUpdateTable } from "@/services/table/useTable";
import { useGetZones } from "@/services/table/useZone";
import { useGetProducts, Product } from "@/services/product/useProduct";
import clsx from "clsx";
import { QRCodeSVG } from "qrcode.react";
import { socket } from "@/config/socket";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Tabs,
  Tab,
  Input,
  ScrollShadow,
  Image,
  useDisclosure,
  Chip,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import CloseTableConfirm from "./components/poupConfirm";
import EmptyState from "@/components/common/empty-state";
import { TableCart } from "./components/TableCart";
import ConfirmModal from "@/components/common/popup-confirm";
import {
  Search,
  Armchair,
  Table as TableIcon,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Users,
  Settings,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  Utensils,
  ChefHat,
  QrCode,
} from "lucide-react";
import { useCart } from "@/provider";
import PaymentModal from "@/components/main/payment-modal";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import { toast } from "react-hot-toast";

const getStatusDisplay = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: "ລໍຖ້າ", color: "warning" as const };
    case "COOKING":
      return { label: "ກຳລັງຄົວ", color: "primary" as const };
    case "SERVED":
      return { label: "ເສີບແລ້ວ", color: "success" as const };
    case "CANCEL":
      return { label: "ຍົກເລີກ", color: "danger" as const };
    default:
      return { label: status || "ລໍຖ້າ", color: "default" as const };
  }
};

export default function TablePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetTableId = searchParams.get("tableId");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isCloseTableOpen,
    onOpen: onCloseTableOpen,
    onOpenChange: onCloseTableOpenChange,
  } = useDisclosure();
  const {
    isOpen: isQrOpen,
    onOpen: onQrOpen,
    onOpenChange: onQrOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRemoveItemOpen,
    onOpen: onRemoveItemOpen,
    onOpenChange: onRemoveItemOpenChange,
  } = useDisclosure();
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const { user } = useAuth();
  const storeId = user?.user?.storeId;

  const { data: tablesResponse } = useGetTables(storeId);
  const { data: zonesResponse } = useGetZones(storeId);
  const updateTable = useUpdateTable();

  const tables = tablesResponse?.data || [];
  const zones = zonesResponse?.data || [];

  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [isSelectingMenu, setIsSelectingMenu] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: productResponse, isPending: isLoadingProducts } =
    useGetProducts(storeId || "", undefined, true, "");
  const products = productResponse?.data || [];

  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone("all");
    }
  }, [zones, selectedZone]);
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    updateStatus,
    clearCart,
    subtotal,
    setActiveTableId,
  } = useCart();

  useEffect(() => {
    if (selectedTable) {
      setActiveTableId(selectedTable.id);
    } else {
      setActiveTableId(null);
      setSelectedCartItems([]);
    }
  }, [selectedTable, setActiveTableId]);

  // Effect to handle table selection from query params (e.g. from Ordering page)
  useEffect(() => {
    if (targetTableId && tables.length > 0 && !selectedTable) {
      const found = tables.find((t: any) => t.id === targetTableId);
      if (found) {
        setSelectedTable(found);
      }
    }
  }, [targetTableId, tables, selectedTable]);

  // Real-time: Auto-open table when customer makes a NEW order
  useEffect(() => {
    const handleNewOrder = (data: { tableId: string }) => {
      console.log("🔔 TablePage auto-opening table:", data.tableId);
      const found = tables.find((t: any) => t.id === data.tableId);
      if (found) {
        setSelectedTable(found);
      }
    };

    socket.on("CUSTOMER_ORDER", handleNewOrder);
    return () => {
      socket.off("CUSTOMER_ORDER", handleNewOrder);
    };
  }, [tables]);

  useEffect(() => {
    setSelectedCartItems((prev) =>
      prev.filter((id) => cart.some((item) => item.id === id)),
    );
  }, [cart]);

  const filteredCart = cart.filter((item) => {
    if (statusFilter === "ALL") return true;
    const itemStatus = item.status?.toUpperCase() || "PENDING";
    return itemStatus === statusFilter;
  });

  const statusTotals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const s = item.status?.toUpperCase() || "PENDING";
        if (s !== "CANCEL") {
          acc[s] = (acc[s] || 0) + item.price * item.quantity;
        }
        return acc;
      },
      { PENDING: 0, COOKING: 0, SERVED: 0 } as Record<string, number>,
    );
  }, [cart]);

  const filteredTables = tables.filter(
    (t: any) =>
      (selectedZone === "all" || t.zoneId === selectedZone) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCloseTable = (order?: any) => {
    if (selectedTable) {
      updateTable.mutate(
        {
          id: selectedTable.id,
          storeId: selectedTable.storeId || storeId,
          status: "AVAILABLE",
        },
        {
          onSuccess: () => {
            // ແຈ້ງເຕືອນລູກຄ້າວ່າຍອດຊຳລະສຳເລັດ ແລະ ໂຕະປິດແລ້ວ
            if (socket.connected) {
              socket.emit("SYNC_TABLE_CART", {
                storeId,
                tableId: selectedTable.id,
                cart: order?.items || [],
                tableStatus: "AVAILABLE",
                order, // ສົ່ງຂໍ້ມູນບີນໃຫ້ລູກຄ້າ
              });
              socket.emit("TABLE_SESSION_ENDED", { tableId: selectedTable.id });
            }
            clearCart();
            setSelectedTable(null);
          },
        },
      );
    } else {
      clearCart();
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(
      (t: any) =>
        !t.status ||
        t.status.toUpperCase() === "AVAILABLE" ||
        t.status.toUpperCase() === "ACTIVE",
    ).length,
    occupied: tables.filter((t: any) => t.status?.toUpperCase() === "OCCUPIED")
      .length,
    reserved: tables.filter((t: any) => t.status?.toUpperCase() === "RESERVED")
      .length,
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden lg:flex-row lg:gap-4">
      <div className="flex-grow flex flex-col min-h-0 lg:h-full">
        <div
          className={clsx(
            "flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 flex-shrink-0",
            selectedTable && "hidden lg:flex",
          )}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-2 md:gap-3">
              <Armchair className="w-7 h-7 md:w-8 md:h-8" />
              ໂຕະອາຫານ
            </h1>
            <p className="text-xs md:text-sm text-default-500 font-medium ml-9 md:ml-11">
              ບໍລິຫານຈັດການພື້ນທີ່ ແລະ ໂຕະພາຍໃນຮ້ານຂອງທ່ານ
            </p>
          </div>
        </div>

        <div
          className={clsx(
            "gap-2 md:gap-4 flex-shrink-0",
            selectedTable
              ? "hidden lg:grid lg:grid-cols-4"
              : "grid grid-cols-2 lg:grid-cols-4",
          )}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 border-1 border-primary-100 dark:border-primary-800/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-500/10">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-primary-900/50 rounded-xl md:rounded-2xl text-primary shadow-sm backdrop-blur-sm">
                <TableIcon
                  className="w-5 h-5 md:w-[26px] md:h-[26px]"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] font-extrabold text-primary-600/80 dark:text-primary-400/80 uppercase tracking-wider md:tracking-widest mb-0.5">
                  ທັງໝົດ
                </p>
                <p className="text-xl md:text-3xl font-black text-primary-900 dark:text-primary-100 leading-none md:leading-tight">
                  {stats.total}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/10 border-1 border-success-100 dark:border-success-800/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-success-500/10">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-success-900/50 rounded-xl md:rounded-2xl text-success shadow-sm backdrop-blur-sm">
                <CheckCircle2
                  className="w-5 h-5 md:w-[26px] md:h-[26px]"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] font-extrabold text-success-600/80 dark:text-success-400/80 uppercase tracking-wider md:tracking-widest mb-0.5">
                  ໂຕະຫວ່າງ
                </p>
                <p className="text-xl md:text-3xl font-black text-success-900 dark:text-success-100 leading-none md:leading-tight">
                  {stats.available}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-danger-50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/10 border-1 border-danger-100 dark:border-danger-800/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-danger-500/10">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-danger-900/50 rounded-xl md:rounded-2xl text-danger shadow-sm backdrop-blur-sm">
                <Users
                  className="w-5 h-5 md:w-[26px] md:h-[26px]"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] font-extrabold text-danger-600/80 dark:text-danger-400/80 uppercase tracking-wider md:tracking-widest mb-0.5">
                  ມີລູກຄ້າ
                </p>
                <p className="text-xl md:text-3xl font-black text-danger-900 dark:text-danger-100 leading-none md:leading-tight">
                  {stats.occupied}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/10 border-1 border-warning-100 dark:border-warning-800/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warning-500/10">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-warning-900/50 rounded-xl md:rounded-2xl text-warning shadow-sm backdrop-blur-sm">
                <Clock
                  className="w-5 h-5 md:w-[26px] md:h-[26px]"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] font-extrabold text-warning-600/80 dark:text-warning-400/80 uppercase tracking-wider md:tracking-widest mb-0.5">
                  ຈອງແລ້ວ
                </p>
                <p className="text-xl md:text-3xl font-black text-warning-900 dark:text-warning-100 leading-none md:leading-tight">
                  {stats.reserved}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="flex-grow min-h-0 border-none shadow-md overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md flex flex-col">
          <CardBody className="p-0 flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 border-b border-divider flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 flex-shrink-0">
              {isSelectingMenu ? (
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-xl md:text-2xl font-black text-primary flex items-center gap-3">
                    <Utensils size={24} /> ເລືອກເມນູອາຫານ
                  </h2>
                  <Button
                    variant="flat"
                    color="danger"
                    onPress={() => setIsSelectingMenu(false)}
                    className="font-bold"
                  >
                    ກັບຄືນ
                  </Button>
                </div>
              ) : (
                <>
                  <Tabs
                    variant="solid"
                    color="primary"
                    selectedKey={selectedZone}
                    onSelectionChange={(key) => setSelectedZone(key as string)}
                    classNames={{
                      tabList:
                        "bg-white/50 dark:bg-gray-900/50 p-1 shadow-inner",
                      cursor: "shadow-md bg-primary",
                      tabContent:
                        "group-data-[selected=true]:text-white font-bold",
                    }}
                  >
                    <Tab
                      key="all"
                      title={
                        <div className="flex items-center gap-2">
                          <LayoutGrid size={16} />
                          <span>ທັງໝົດ</span>
                        </div>
                      }
                    />
                    {zones.map((zone: any) => (
                      <Tab
                        key={zone.id}
                        title={
                          <div className="flex items-center gap-2">
                            <span>{zone.name}</span>
                          </div>
                        }
                      />
                    ))}
                  </Tabs>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                      placeholder="ຄົ້ນຫາໂຕະ..."
                      startContent={
                        <Search size={18} className="text-default-400" />
                      }
                      variant="bordered"
                      className="w-full md:w-64"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <Button
                      isIconOnly
                      variant="flat"
                      className="min-w-10"
                      onClick={() => navigate("/settings/table")}
                    >
                      <Settings size={18} />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {isSelectingMenu ? (
              <div className="p-6 flex-grow overflow-y-auto scrollbar-hide">
                {!isLoadingProducts && products.length === 0 ? (
                  <EmptyState
                    message="ບໍ່ພົບລາຍການສິນຄ້າ"
                    description="ລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ ຫຼື ປ່ຽນໝວດໝູ່"
                  />
                ) : (
                  <div
                    className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 ${selectedTable ? "lg:grid-cols-5 xl:grid-cols-6" : "lg:grid-cols-6 xl:grid-cols-7"} gap-3 md:gap-4`}
                  >
                    {products.map((product: Product) => (
                      <Card
                        isPressable
                        key={product.id}
                        onPress={() => addToCart(product)}
                        isDisabled={
                          (product.stockQty || 0) <=
                          cart
                            .filter(
                              (i) =>
                                i.id === product.id && i.status !== "CANCEL"
                            )
                            .reduce((sum, i) => sum + i.quantity, 0)
                        }
                        className={clsx(
                          "group relative border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[130px] lg:h-[150px] flex flex-col",
                          (product.stockQty || 0) <=
                            cart
                              .filter(
                                (i) =>
                                  i.id === product.id && i.status !== "CANCEL"
                              )
                              .reduce((sum, i) => sum + i.quantity, 0) &&
                            "opacity-60 grayscale-[0.5]"
                        )}
                      >
                        <CardBody className="p-0 relative overflow-hidden flex-grow shrink">
                          <div className="absolute top-2 right-2 z-20">
                            <div
                              className={clsx(
                                "px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-lg backdrop-blur-md",
                                product.stockQty > 10
                                  ? "bg-green-500/80"
                                  : product.stockQty > 0
                                    ? "bg-orange-500/80"
                                    : "bg-red-500/80",
                              )}
                            >
                              {product.stockQty > 0
                                ? `ຍັງເຫຼືອ: ${product.stockQty}`
                                : "ໝົດແລ້ວ"}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                            <div className="bg-white/90 text-primary rounded-full p-2 lg:p-3 shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                              <Plus size={20} strokeWidth={3} />
                            </div>
                          </div>
                          <Image
                            shadow="none"
                            radius="none"
                            width="100%"
                            alt={product.name}
                            className="w-full object-cover h-full group-hover:scale-110 transition-transform duration-500"
                            src={getDisplayImageUrl(product.image)}
                          />
                        </CardBody>
                        <CardFooter className="flex flex-col items-start gap-0 p-1.5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
                          <b className="text-[11px] lg:text-xs font-bold text-default-700 w-full truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </b>
                          <div className="flex justify-between items-center w-full">
                            <p className="text-primary font-black text-[11px] lg:text-xs whitespace-nowrap">
                              {formatNumber(product.price)}{" "}
                              <span className="text-[8px] lg:text-[9px] font-medium text-default-400">
                                ກີບ
                              </span>
                            </p>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex-grow overflow-y-auto scrollbar-hide">
                {filteredTables.length > 0 ? (
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${selectedTable ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-5 xl:grid-cols-5"} gap-2 lg:gap-3`}
                  >
                    {filteredTables.map((table: any) => (
                      <TableCart
                        key={table.id}
                        table={table}
                        onTableSelect={(t) => setSelectedTable(t)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    message="ບໍ່ພົບຂໍ້ມູນໂຕະ"
                    description="ລອງຄົ້ນຫາດ້ວຍຊື່ໂຕະອື່ນ ຫຼື ເລືອກໂຊນອື່ນ"
                  />
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {selectedTable ? (
        <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-divider shadow-2xl z-30 h-[55vh] lg:h-full animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="p-2 lg:p-3 border-b border-divider flex items-center justify-between bg-primary/5">
            <div className="flex flex-col flex-grow">
              <div className="flex items-center gap-2 font-bold text-base lg:text-lg">
                <ShoppingCart size={18} className="text-primary" />
                <span>ໂຕະ {selectedTable?.name}</span>
              </div>
              <div className="flex items-center gap-4 ml-8 mt-1">
                <p className="text-xs text-default-500">
                  {selectedTable?.capacity} ບ່ອນນັ່ງ
                </p>
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onClick={() => setSelectedTable(null)}
            >
              ✕
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 lg:px-3 py-1.5 bg-default-100/50 border-b border-divider">
            <div className="flex items-center gap-2">
              <Checkbox
                isSelected={
                  filteredCart.length > 0 &&
                  filteredCart.every((item) =>
                    selectedCartItems.includes(`${item.id}-${item.status}`),
                  )
                }
                onValueChange={(isSelected) => {
                  if (isSelected) {
                    const newIds = filteredCart.map(
                      (item) => `${item.id}-${item.status}`,
                    );
                    setSelectedCartItems(
                      Array.from(new Set([...selectedCartItems, ...newIds])),
                    );
                  } else {
                    const filteredIds = new Set(
                      filteredCart.map((item) => `${item.id}-${item.status}`),
                    );
                    setSelectedCartItems(
                      selectedCartItems.filter((id) => !filteredIds.has(id)),
                    );
                  }
                }}
                size="sm"
                isDisabled={filteredCart.length === 0}
              >
                <span className="text-xs font-bold text-default-700">
                  ເລືອກທັງໝົດ
                </span>
              </Checkbox>
              <div className="flex flex-wrap items-center gap-1 lg:gap-1.5 ml-2 lg:ml-3">
                {[
                  { value: "ALL", label: "ທັງໝົດ" },
                  { value: "PENDING", label: "ລໍຖ້າ" },
                  { value: "COOKING", label: "ກຳລັງຄົວ" },
                  { value: "SERVED", label: "ເສີບແລ້ວ" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setStatusFilter(status.value);
                      setSelectedCartItems([]);
                    }}
                    className={`px-2 py-1 text-[9px] lg:text-[10px] font-bold rounded-lg transition-all whitespace-nowrap outline-none border-[0.5px] ${
                      statusFilter === status.value
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-[1.02]"
                        : "bg-default-100 text-default-500 border-default-200 hover:bg-default-200 hover:text-default-700"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            {selectedCartItems.length > 0 && (
              <span className="text-xs text-primary font-bold">
                ເລືອກແລ້ວ {selectedCartItems.length}
              </span>
            )}
          </div>

          <ScrollShadow
            size={0}
            className="flex-grow p-2 lg:p-3 space-y-2 lg:space-y-3"
          >
            {filteredCart.length > 0
              ? filteredCart.map((item) => {
                  const uniqueId = `${item.id}-${item.status}`;
                  return (
                    <div
                      key={uniqueId}
                      className="flex gap-2 group items-center border-b border-divider border-dashed pb-2 lg:pb-3 last:border-b-0 last:pb-0"
                    >
                      <Checkbox
                        isSelected={selectedCartItems.includes(uniqueId)}
                        onValueChange={(isSelected) => {
                          if (isSelected) {
                            setSelectedCartItems((prev) => [...prev, uniqueId]);
                          } else {
                            setSelectedCartItems((prev) =>
                              prev.filter((id) => id !== uniqueId),
                            );
                          }
                        }}
                        size="md"
                        className="mr-1"
                      />
                      <Image
                        src={getDisplayImageUrl(item.image)}
                        className="w-10 h-10 lg:w-14 lg:h-14 object-cover min-w-[40px] lg:min-w-[56px]"
                        radius="md"
                      />
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-[12px] lg:text-sm line-clamp-1">
                            {item.name}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => {
                              setItemToRemove({
                                id: item.id,
                                status: item.status,
                              });
                              onRemoveItemOpen();
                            }}
                            className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-bold text-[12px] lg:text-sm">
                            {formatNumber(item.price * item.quantity)} ກີບ
                          </span>
                          {/* Status  */}
                          {(() => {
                            const statusConfig = getStatusDisplay(item.status);
                            return (
                              <Chip
                                size="sm"
                                color={statusConfig.color}
                                variant="flat"
                                className="ml-auto mr-2 font-bold text-[10px] lg:text-[11px]"
                              >
                                {statusConfig.label}
                              </Chip>
                            );
                          })()}
                          <div className="flex ml-4 items-center gap-1.5 lg:gap-2 bg-default-100 rounded-lg p-0.5">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
                              onClick={() =>
                                updateQuantity(item.id, item.status, -1)
                              }
                            >
                              <Minus size={10} />
                            </Button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => {
                                const val = e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                setQuantity(item.id, item.status, val);
                              }}
                              onBlur={() => {
                                if (item.quantity === 0) {
                                  setQuantity(item.id, item.status, "1");
                                }
                              }}
                              className="text-[11px] lg:text-xs font-bold w-6 lg:w-8 text-center bg-transparent outline-none focus:ring-1 focus:ring-primary/30 rounded"
                            />
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
                              isDisabled={
                                item.quantity +
                                  cart
                                    .filter(
                                      (i) =>
                                        i.id === item.id &&
                                        i.status !== "CANCEL" &&
                                        `${i.id}-${i.status}` !== uniqueId
                                    )
                                    .reduce((sum, i) => sum + i.quantity, 0) >=
                                item.stockQty
                              }
                              onClick={() =>
                                updateQuantity(item.id, item.status, 1)
                              }
                            >
                              <Plus size={10} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </ScrollShadow>

          <div className="px-2 py-1.5 lg:px-3 lg:py-2 border-t border-divider bg-default-50/50 flex-shrink-0">
            <div className="grid grid-cols-4 gap-1 lg:gap-1.5">
              <Button
                variant="flat"
                color={isSelectingMenu ? "danger" : "primary"}
                className={`h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] px-1 ${isSelectingMenu ? "bg-danger/10 text-danger" : "bg-primary/10"}`}
                onClick={() => setIsSelectingMenu(!isSelectingMenu)}
                startContent={<Utensils size={12} />}
              >
                {isSelectingMenu ? "ປິດເມນູ" : "ເປີດເມນູ"}
              </Button>
              <Button
                color="warning"
                className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
                onClick={() => {
                  try {
                    updateStatus(selectedCartItems, "COOKING");
                    setSelectedCartItems([]);
                    toast.success("ອັບເດດສະຖານະສຳເລັດ");
                    
                    // Play notification sound
                    try {
                      const audio = new Audio("/assets/void/notification.mp3");
                      audio.play().catch(e => console.log("Audio play blocked:", e));
                    } catch (e) {}
                  } catch (error) {
                    toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ");
                  }
                }}
                startContent={<ChefHat size={12} />}
                isDisabled={
                  selectedCartItems.length === 0 ||
                  selectedCartItems.some((uId) => {
                    const item = cart.find((i) => `${i.id}-${i.status}` === uId);
                    return (
                      item?.status === "COOKING" || item?.status === "SERVED"
                    );
                  })
                }
              >
                ສົ່ງໄປຄົວ
              </Button>
              <Button
                color="primary"
                className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
                onClick={() => {
                  try {
                    updateStatus(selectedCartItems, "SERVED");
                    setSelectedCartItems([]);
                    toast.success("ອັບເດດສະຖານະສຳເລັດ");
                  } catch (error) {
                    toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ");
                  }
                }}
                startContent={<ChefHat size={12} />}
                isDisabled={
                  selectedCartItems.length === 0 ||
                  selectedCartItems.some((uId) => {
                    const item = cart.find((i) => `${i.id}-${i.status}` === uId);
                    return item?.status === "SERVED";
                  })
                }
              >
                ເສີບອາຫານ
              </Button>
              <Button
                color="secondary"
                variant="solid"
                className="h-8 lg:h-9 font-bold text-[9px] lg:text-[11px] text-white shadow-sm px-1"
                onClick={onQrOpen}
                startContent={<QrCode size={12} />}
              >
                QR
              </Button>
            </div>
          </div>

          <div className="px-2 py-2 lg:px-3 lg:py-2.5 border-t border-divider bg-white mt-auto flex-shrink-0">
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex justify-between items-center text-[10px] lg:text-xs text-warning-600 font-bold">
                <span>ລໍຖ້າ:</span>
                <span>{formatNumber(statusTotals.PENDING)} ກີບ</span>
              </div>
              <div className="flex justify-between items-center text-[10px] lg:text-xs text-primary-600 font-bold">
                <span>ກຳລັງຄົວ:</span>
                <span>{formatNumber(statusTotals.COOKING)} ກີບ</span>
              </div>
              <div className="flex justify-between items-center text-[10px] lg:text-xs text-success-600 font-bold">
                <span>ເສີບແລ້ວ:</span>
                <span>{formatNumber(statusTotals.SERVED)} ກີບ</span>
              </div>
              <div className="flex justify-between items-center font-black pt-1 border-t border-divider mt-1">
                <span className="text-xs lg:text-sm text-default-700">
                  ທັງໝົດ:
                </span>
                <div className="text-right">
                  <span className="text-primary text-base lg:text-lg">
                    {formatNumber(subtotal)} ກີບ
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <Button
                variant="flat"
                color="danger"
                className="h-9 lg:h-11 font-bold text-xs lg:text-sm"
                isLoading={updateTable.isPending}
                onClick={() => {
                  if (cart.length > 0) {
                    toast.error(
                      "ບໍ່ສາມາດປິດໂຕະໄດ້! ກະລຸນາເຄຼຍລາຍການອາຫານໃນກະຕ່າອອກໃຫ້ໝົດກ່ອນ.",
                      {
                        style: {
                          fontWeight: "bold",
                          borderRadius: "12px",
                        },
                      },
                    );
                    return;
                  }
                  onCloseTableOpen();
                }}
                startContent={<Trash2 size={14} />}
              >
                ປິດໂຕະ
              </Button>
              <Button
                color="primary"
                className="h-9 lg:h-11 font-bold text-xs lg:text-sm shadow-md shadow-primary/20"
                startContent={<Banknote size={14} />}
                onPress={onOpen}
                isDisabled={
                  cart.length === 0 ||
                  !cart.every(
                    (item) =>
                      item.status?.toUpperCase() === "SERVED" ||
                      item.status?.toUpperCase() === "CANCEL",
                  )
                }
              >
                ຕໍ່ໄປ
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex w-full lg:w-[400px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border-l border-divider animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-4 opacity-40">
            <ShoppingCart size={80} strokeWidth={1} />
            <p className="font-bold text-lg">ກະລຸນາເລືອກໂຕະ</p>
          </div>
        </div>
      )}

      <Modal isOpen={isQrOpen} onOpenChange={onQrOpenChange} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center">
            <span className="text-lg font-bold">
              QR Code ໂຕະ {selectedTable?.name}
            </span>
          </ModalHeader>
          <ModalBody className="flex flex-col items-center pb-8 pt-4 gap-4">
            <p className="text-center text-sm font-medium text-default-600">
              ສະແກນ QR Code ນີ້ເພື່ອສັ່ງອາຫານ
            </p>
            {selectedTable?.qrCode && (
              <div className="flex flex-col items-center gap-2 p-4 bg-default-50 rounded-xl border border-default-200 w-full">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-default-100">
                  <QRCodeSVG
                    value={`${window.location.origin}/menu/${selectedTable.qrCode}`}
                    size={180}
                    level="M"
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-default-400 font-medium block uppercase tracking-widest mb-1">
                    ລະຫັດໂຕະ (Table Code)
                  </span>
                  <span className="text-2xl font-black tracking-wider text-primary">
                    {selectedTable.qrCode}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <PaymentModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        total={subtotal}
        items={cart}
        tableId={selectedTable?.id}
        onPaymentSuccess={(order) => {
          handleCloseTable(order);
        }}
      />

      <CloseTableConfirm
        isOpen={isCloseTableOpen}
        onOpenChange={onCloseTableOpenChange}
        tableName={selectedTable?.name}
        isLoading={updateTable.isPending}
        onConfirm={handleCloseTable}
      />

      <ConfirmModal
        isOpen={isRemoveItemOpen}
        onOpenChange={onRemoveItemOpenChange}
        title="ຢືນຢັນການລົບ?"
        message="ທ່ານຕ້ອງການລົບລາຍການນີ້ອອກຈາກກະຕ່າແທ້ຫຼືບໍ່?"
        confirmText="ລົບອອກ"
        cancelText="ຍົກເລີກ"
        icon={<Trash2 size={24} />}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(itemToRemove.id, itemToRemove.status);
            setItemToRemove(null);
          }
        }}
      />
    </div>
  );
}
