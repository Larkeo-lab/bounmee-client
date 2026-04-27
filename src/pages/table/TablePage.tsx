import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardBody,
  Button,
  Tabs,
  Tab,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ScrollShadow,
} from "@heroui/react";
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
  Utensils,
  Trash2, // Added Trash2
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { TableCart } from "./components/TableCart";
import { OrderRight } from "./components/OrderRight";
import { MenuList } from "./components/MenuList";

import { useAuth } from "@/routes/AuthContext";
import { useGetTables, useUpdateTable } from "@/services/table/useTable";
import { useGetZones } from "@/services/table/useZone";
import { useGetProducts } from "@/services/product/useProduct";
import { useGetCategories, Category } from "@/services/category/useCategory";
import { socket } from "@/config/socket";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import { useCart } from "@/provider";
import PaymentModal from "@/components/common/payment-modal";

export default function TablePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetTableId = searchParams.get("tableId");
  const { t } = useTranslation();
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
    note?: string;
  } | null>(null);
  const { user } = useAuth();
  const storeId = user?.user?.storeId;

  const { data: tablesResponse } = useGetTables(storeId);
  const { data: zonesResponse } = useGetZones(storeId);
  const updateTable = useUpdateTable();

  const tables = tablesResponse?.data || [];
  const zones = zonesResponse?.data || [];

  const [selectedZone, setSelectedZone] = useState<string>("all"); // ໂຊນທີ່ເລືອກໃນປະຈຸບັນ
  const [searchQuery, setSearchQuery] = useState(""); // ຄຳຄົ້ນຫາຊື່ໂຕະ
  const [selectedTable, setSelectedTable] = useState<any | null>(null); // ໂຕະທີ່ກຳລັງເປີດຢູ່ (Active)
  const [lastSelectedTable, setLastSelectedTable] = useState<any | null>(null);

  useEffect(() => {
    if (selectedTable) {
      setLastSelectedTable(selectedTable);
    }
  }, [selectedTable]);
  const [isSelectingMenu, setIsSelectingMenu] = useState(false); // ສະຖານະການເລືອກເມນູ (Mobile)
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([]); // ລາຍການອາຫານທີ່ຕິກເລືອກ
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ຕົວຊ່ວຍກັ່ນຕອງສະຖານະອາຫານ
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set()); // ເກັບລາຍການທີ່ເປີດເບິ່ງ Note
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: categoryResponse } = useGetCategories(storeId || "");

  const { data: productResponse, isPending: isLoadingProducts } =
    useGetProducts(
      storeId || "",
      selectedCategory === "all" ? undefined : selectedCategory,
      true,
      "",
    );
  const products = productResponse?.data || [];

  const categories = [
    { id: "all", label: "ທັງໝົດ" },
    ...(categoryResponse?.data?.map((cat: Category) => ({
      id: cat.id,
      label: cat.name,
    })) || []),
  ];

  // ฟังก์ชันสลับการเปิด/ปิดดูหมายเหตุของรายการอาหารแต่ละจาน
  const toggleNote = (uId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);

      if (next.has(uId)) next.delete(uId);
      else next.add(uId);

      return next;
    });
  };

  // useEffect: จัดการเลือกโซนแรกรถยนต์ให้ทันทีเมื่อข้อมูลโซນโหลดเสร็จ
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone("all");
    }
  }, [zones, selectedZone]);

  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    clearTableCart,
    subtotal,
    setActiveTableId,
    setTableCart,
  } = useCart();

  const syncedTableRef = useRef<string | null>(null);

  // useEffect: ซิงค์ข้อมูลตะกร้าสินค้าของโต๊ะที่เลือกมาไว้ใน Provider ส่วนกลาง
  useEffect(() => {
    if (selectedTable?.id && Array.isArray(selectedTable.activeCart)) {
      // ถ้าเปลี่ยนโต๊ะ หรือ โต๊ะเดิมแต่สถานะเป็น AVAILABLE (เพิ่งเปิดใหม่)
      // ให้ซิงค์ข้อมูลจากเซิร์ฟเวอร์ทุกครั้ง
      const isNewSelection = syncedTableRef.current !== selectedTable.id;
      const isAvailable = selectedTable.status === "AVAILABLE";

      if (isNewSelection || isAvailable) {
        syncedTableRef.current = selectedTable.id;

        // บังคับล้างข้อมูลถ้าสถานะเป็น AVAILABLE เพื่อป้องกันออเดอร์เก่าค้าง
        if (isAvailable) {
          clearTableCart(selectedTable.id);
          // ถ้าเป็น AVAILABLE ออเดอร์ในเครื่องควรเป็นว่างเสมอ
          setTableCart(selectedTable.id, []);
        } else {
          setTableCart(selectedTable.id, selectedTable.activeCart);
        }
      }
    }
    if (!selectedTable) {
      syncedTableRef.current = null;
    }
  }, [
    selectedTable?.id,
    setTableCart,
    clearTableCart,
    selectedTable?.status,
    selectedTable?.activeCart,
  ]);

  // useEffect: อัปเดต ID โต๊ะที่กำลังใช้งานใน Cart context เพื่อให้จัดการตะกร้าได้ถูกโต๊ะ
  useEffect(() => {
    if (selectedTable) {
      setActiveTableId(selectedTable.id);
    } else {
      setActiveTableId(null);
      setSelectedCartItems([]);
      setIsSelectingMenu(false); // Reset menu selection mode when no table is selected
    }
  }, [selectedTable, setActiveTableId]);

  // useEffect: ตรวจสอบ URL เพื่อหาโต๊ะที่ต้องการเลือกโดยอัตโนมัติ (เช่น จากเมນູຄົ້ນຫາ)
  useEffect(() => {
    if (targetTableId && tables.length > 0 && !selectedTable) {
      const found = tables.find((t: any) => t.id === targetTableId);

      if (found) {
        setSelectedTable(found);
      }
    }
  }, [targetTableId, tables, selectedTable]);

  // useEffect: รับฟັງຊັນ Socket ເມື່ອມີການສັ່ງອາຫານໃໝ່ຈາກຝັ່ງລູກຄ້າ
  useEffect(() => {
    const handleNewOrder = (data: { tableId: string }) => {
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

  // useEffect: จัดการล້າງรายการที่เลือกเอาไว้ หากรายการนั้นถูกลบออกไปจากตะกร้า
  useEffect(() => {
    setSelectedCartItems((prev) =>
      prev.filter((uId) =>
        cart.some(
          (item) => `${item.id}-${item.status}-${item.note || ""}` === uId,
        ),
      ),
    );
  }, [cart]);

  // ກັ່ນຕອງລາຍການອາຫານໃນຕະກ້າຕາມສະຖານະທີ່ເລືອກ (PENDING, SERVED, etc.)
  const filteredCart = cart.filter((item) => {
    if (statusFilter === "ALL") return true;
    const itemStatus = item.status?.toUpperCase() || "PENDING";

    return itemStatus === statusFilter;
  });

  // ຄຳນວນຍອດລວມລາຄາແຍກຕາມແຕ່ລະສະຖານະ
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

  // ກັ່ນຕອງໂຕະອາຫານຕາມໂຊນ ແລະ ຄຳສັບທີ່ຄົ້ນຫາ
  const filteredTables = tables.filter(
    (t: any) =>
      (selectedZone === "all" || t.zoneId === selectedZone) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ຟັງຊັນສຳລັບປິດໂຕະ: ອັບເດດສະຖານະໂຕະ ແລະ ລ້າງຂໍ້ມູນຕະກ້າ
  const handleCloseTable = (order?: any) => {
    if (selectedTable) {
      const closingTableId = selectedTable.id;
      const closingStoreId = selectedTable.storeId || storeId;

      // 1. ล้างข้อมูลในเครื่องทันทีเพื่อให้ UI ตอบสนองไว (Immediate Local Clear)
      clearTableCart(closingTableId);
      setSelectedTable(null);
      syncedTableRef.current = null;

      // 2. อัปเดตสถานะบนเซิร์ฟเวอร์ในพื้นหลัง
      updateTable.mutate(
        {
          id: closingTableId,
          storeId: closingStoreId,
          status: "AVAILABLE",
          activeCart: [],
        },
        {
          onSuccess: () => {
            if (socket.connected) {
              socket.emit("SYNC_TABLE_CART", {
                storeId: closingStoreId,
                tableId: closingTableId,
                cart: [],
                tableStatus: "AVAILABLE",
                order,
              });
              socket.emit("TABLE_SESSION_ENDED", { tableId: closingTableId });
            }
            // Invalidate query to get fresh data
            queryClient.invalidateQueries({ queryKey: ["tables"] });
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
    <div className="h-[calc(100vh-100px)] w-full max-w-full flex flex-col overflow-hidden sm:flex-row min-h-0">
      <div className="flex-grow flex flex-col min-h-0 min-w-0 sm:h-full">
        <div
          className={clsx(
            "flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 flex-shrink-0 px-2 pt-2",
            selectedTable && "hidden sm:flex",
          )}
        >
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2 md:gap-3">
              <Armchair className="w-4 h-4 md:w-6 md:h-6" />
              {t("table.title")}
            </h1>
            <p className="text-[10px] md:text-xs text-default-500 font-medium ml-6 md:ml-9">
              {t("table.subtitle")}
            </p>
          </div>
        </div>

        {/* Header Stats */}
        <div
          className={clsx(
            "grid grid-cols-4 gap-1.5 md:gap-4 flex-shrink-0 px-2 mt-2",
            selectedTable && "hidden sm:grid",
          )}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 border-1 border-primary-100 dark:border-primary-800/30">
            <CardBody className="p-1.5 md:p-3 flex flex-row items-center gap-1.5 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white/80 dark:bg-primary-900/50 rounded-lg text-primary">
                <TableIcon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase">
                  {t("table.stats.total")}
                </p>
                <p className="text-lg md:text-xl font-black">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/10 border-1 border-success-100 dark:border-success-800/30">
            <CardBody className="p-1.5 md:p-3 flex flex-row items-center gap-1.5 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white/80 dark:bg-success-900/50 rounded-lg text-success">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase">
                  {t("table.stats.available")}
                </p>
                <p className="text-lg md:text-xl font-black">
                  {stats.available}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-danger-50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/10 border-1 border-danger-100 dark:border-danger-800/30">
            <CardBody className="p-1.5 md:p-3 flex flex-row items-center gap-1.5 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white/80 dark:bg-danger-900/50 rounded-lg text-danger">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase">
                  {t("table.stats.occupied")}
                </p>
                <p className="text-lg md:text-xl font-black">
                  {stats.occupied}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/10 border-1 border-warning-100 dark:border-warning-800/30">
            <CardBody className="p-1.5 md:p-3 flex flex-row items-center gap-1.5 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white/80 dark:bg-warning-900/50 rounded-lg text-warning">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase">
                  {t("table.stats.reserved")}
                </p>
                <p className="text-lg md:text-xl font-black">
                  {stats.reserved}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="flex-grow min-h-0 border-none shadow-md overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md flex flex-col mt-2">
          <CardBody className="p-0 flex flex-col h-full overflow-hidden">
            <div className="p-2 md:p-3 border-b border-divider flex flex-col md:flex-row gap-3 items-center justify-between bg-primary/5 flex-shrink-0">
              {isSelectingMenu ? (
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-xl md:text-2xl font-black text-primary flex items-center gap-3">
                    <Utensils size={24} /> {t("table.selectMenu")}
                  </h2>
                  <Button
                    className="font-bold"
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => setIsSelectingMenu(false)}
                  >
                    {t("table.back")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <Tabs
                      classNames={{
                        tabList: "flex-nowrap",
                      }}
                      color="primary"
                      selectedKey={selectedZone}
                      size="sm"
                      variant="solid"
                      onSelectionChange={(key) =>
                        setSelectedZone(key as string)
                      }
                    >
                      <Tab
                        key="all"
                        title={
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <LayoutGrid size={14} />
                            <span className="text-[11px] md:text-xs">
                              {t("table.allZones")}
                            </span>
                          </div>
                        }
                      />
                      {zones.map((zone: any) => (
                        <Tab
                          key={zone.id}
                          title={
                            <span className="whitespace-nowrap text-[11px] md:text-xs">
                              {zone.name}
                            </span>
                          }
                        />
                      ))}
                    </Tabs>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                      className="w-full md:w-56"
                      placeholder={t("table.searchPlaceholder")}
                      size="sm"
                      startContent={
                        <Search className="text-default-400" size={16} />
                      }
                      value={searchQuery}
                      variant="bordered"
                      onValueChange={setSearchQuery}
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onClick={() => navigate("/settings/table")}
                    >
                      <Settings size={16} />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div
              className={clsx(
                "p-4 sm:p-6 flex-grow overflow-y-auto scrollbar-hide transition-all duration-300",
                selectedTable && !isSelectingMenu && "pb-[70vh] sm:pb-6",
                selectedTable && isSelectingMenu && "pb-[45vh] sm:pb-6",
              )}
            >
              {isSelectingMenu ? (
                <div className="space-y-4 pb-10">
                  <ScrollShadow
                    hideScrollBar
                    className="max-w-full w-0 min-w-full overflow-x-auto scrollbar-hide"
                    orientation="horizontal"
                    size={40}
                  >
                    <Tabs
                      aria-label="Product Categories"
                      classNames={{
                        tabList:
                          "gap-4 lg:gap-6 flex-nowrap p-0 min-w-max border-b-2 border-divider",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-1 h-10 lg:h-12 flex-shrink-0",
                        tabContent:
                          "group-data-[selected=true]:text-primary font-medium text-xs lg:text-sm whitespace-nowrap",
                      }}
                      color="primary"
                      selectedKey={selectedCategory}
                      variant="underlined"
                      onSelectionChange={(key) =>
                        setSelectedCategory(key as string)
                      }
                    >
                      {categories.map((cat) => (
                        <Tab key={cat.id} title={cat.label} />
                      ))}
                    </Tabs>
                  </ScrollShadow>

                  <MenuList
                    addToCart={addToCart}
                    cart={cart}
                    isLoadingProducts={isLoadingProducts}
                    products={products}
                    selectedTable={selectedTable}
                  />
                </div>
              ) : (
                <>
                  {filteredTables.length > 0 ? (
                    <div
                      className={clsx(
                        "grid gap-2 lg:gap-3",
                        selectedTable
                          ? "grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                          : "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
                      )}
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
                    <EmptyState message={t("table.menu.emptyProducts")} />
                  )}
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* orders side panel/bottom sheet */}
      <div
        className={clsx(
          "fixed inset-0 z-50 transition-opacity duration-300 sm:hidden",
          selectedTable && !isSelectingMenu
            ? "bg-black/40 opacity-100"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => {
          if (!isSelectingMenu) {
            setSelectedTable(null);
          }
        }}
      />

      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-in-out transform sm:relative sm:inset-auto sm:translate-y-0 sm:opacity-100 sm:pointer-events-auto shrink-0",
          selectedTable
            ? "translate-y-0 opacity-100 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
            : "translate-y-full opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto",
        )}
      >
        {selectedTable || lastSelectedTable ? (
          <OrderRight
            expandedNotes={expandedNotes}
            filteredCart={filteredCart}
            isSelectingMenu={isSelectingMenu}
            selectedCartItems={selectedCartItems}
            selectedTable={selectedTable || lastSelectedTable}
            setIsSelectingMenu={setIsSelectingMenu}
            setItemToRemove={setItemToRemove}
            setSelectedCartItems={setSelectedCartItems}
            setSelectedTable={setSelectedTable}
            setStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
            statusTotals={statusTotals}
            toggleNote={toggleNote}
            updateTablePending={updateTable.isPending}
            onCloseTableOpen={onCloseTableOpen}
            onPaymentOpen={onOpen}
            onQrOpen={onQrOpen}
            onRemoveItemOpen={onRemoveItemOpen}
          />
        ) : (
          <div className="hidden sm:flex w-full sm:w-[320px] md:w-[350px] lg:w-[400px] h-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border-l border-divider">
            <div className="flex flex-col items-center gap-4 opacity-40">
              <ShoppingCart size={80} strokeWidth={1} />
              <p className="font-bold text-lg">
                {t("table.cart.selectPrompt")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isQrOpen}
        placement="center"
        size="md"
        onOpenChange={onQrOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            {t("table.modal.qrTitle", { name: selectedTable?.name })}
          </ModalHeader>
          <ModalBody className="flex flex-col items-center pb-8 pt-4">
            {selectedTable?.qrCode && (
              <QRCodeSVG
                size={180}
                value={`${window.location.origin}/menu/${selectedTable.qrCode}`}
              />
            )}
            <p className="mt-4 font-black text-2xl text-primary">
              {selectedTable?.qrCode}
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>

      <PaymentModal
        isOpen={isOpen}
        items={cart}
        tableId={selectedTable?.id}
        total={subtotal}
        onOpenChange={onOpenChange}
        onPaymentSuccess={handleCloseTable}
      />

      <ConfirmModal
        cancelText={t("common.cancel")}
        color="danger"
        confirmText={t("table.cart.closeTable")}
        icon={<Trash2 size={24} />}
        isOpen={isCloseTableOpen}
        message={t("table.modal.closeTableMsg", { name: selectedTable?.name })}
        title={t("table.modal.closeTableTitle")}
        onConfirm={handleCloseTable}
        onOpenChange={onCloseTableOpenChange}
      />

      <ConfirmModal
        isOpen={isRemoveItemOpen}
        message={t("table.modal.confirmRemoveMsg")}
        title={t("table.modal.confirmRemove")}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(
              itemToRemove.id,
              itemToRemove.status,
              itemToRemove.note,
            );
            setItemToRemove(null);
          }
        }}
        onOpenChange={onRemoveItemOpenChange}
      />
    </div>
  );
}
