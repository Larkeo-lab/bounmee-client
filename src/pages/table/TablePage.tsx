import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/routes/AuthContext";
import { useGetTables, useUpdateTable } from "@/services/table/useTable";
import { useGetZones } from "@/services/table/useZone";
import { useGetProducts } from "@/services/product/useProduct";
import { useGetCategories, Category } from "@/services/category/useCategory";
import clsx from "clsx";
import { QRCodeSVG } from "qrcode.react";
import { socket } from "@/config/socket";
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
import CloseTableConfirm from "./components/poupConfirm";
import EmptyState from "@/components/common/empty-state";
import { TableCart } from "./components/TableCart";
import { OrderRight } from "./components/OrderRight";
import { MenuList } from "./components/MenuList";
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
  Utensils,
} from "lucide-react";
import { useCart } from "@/provider";
import PaymentModal from "@/components/common/payment-modal";

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
      ""
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
    subtotal,
    setActiveTableId,
    setTableCart,
  } = useCart();

  const syncedTableRef = useRef<string | null>(null);

  // useEffect: ซิงค์ข้อมูลตะกร้าสินค้าของโต๊ะที่เลือกมาไว้ใน Provider ส่วนกลาง
  useEffect(() => {
    if (
      selectedTable?.id &&
      syncedTableRef.current !== selectedTable.id &&
      Array.isArray(selectedTable.activeCart) &&
      selectedTable.activeCart.length > 0
    ) {
      syncedTableRef.current = selectedTable.id;
      setTableCart(selectedTable.id, selectedTable.activeCart);
    }
    if (!selectedTable) {
      syncedTableRef.current = null;
    }
  }, [selectedTable?.id, setTableCart]);

  // useEffect: อัปเดต ID โต๊ะที่กำลังใช้งานใน Cart context เพื่อให้จัดการตะกร้าได้ถูกโต๊ะ
  useEffect(() => {
    if (selectedTable) {
      setActiveTableId(selectedTable.id);
    } else {
      setActiveTableId(null);
      setSelectedCartItems([]);
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
      updateTable.mutate(
        {
          id: selectedTable.id,
          storeId: selectedTable.storeId || storeId,
          status: "AVAILABLE",
        },
        {
          onSuccess: () => {
            if (socket.connected) {
              socket.emit("SYNC_TABLE_CART", {
                storeId,
                tableId: selectedTable.id,
                cart: order?.items || [],
                tableStatus: "AVAILABLE",
                order,
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
            "flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 flex-shrink-0 mb-4",
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

        {/* Header Stats */}
        <div
          className={clsx(
            "grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 flex-shrink-0",
            selectedTable && "hidden lg:grid",
          )}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 border-1 border-primary-100 dark:border-primary-800/30">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-primary-900/50 rounded-xl text-primary">
                <TableIcon className="w-5 h-5 md:w-[26px] md:h-[26px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-extrabold uppercase">
                  ທັງໝົດ
                </p>
                <p className="text-xl md:text-3xl font-black">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/10 border-1 border-success-100 dark:border-success-800/30">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-success-900/50 rounded-xl text-success">
                <CheckCircle2 className="w-5 h-5 md:w-[26px] md:h-[26px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-extrabold uppercase">
                  ໂຕະຫວ່າງ
                </p>
                <p className="text-xl md:text-3xl font-black">
                  {stats.available}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-danger-50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/10 border-1 border-danger-100 dark:border-danger-800/30">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-danger-900/50 rounded-xl text-danger">
                <Users className="w-5 h-5 md:w-[26px] md:h-[26px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-extrabold uppercase">
                  ມີລູກຄ້າ
                </p>
                <p className="text-xl md:text-3xl font-black">
                  {stats.occupied}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/10 border-1 border-warning-100 dark:border-warning-800/30">
            <CardBody className="p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3.5 bg-white/80 dark:bg-warning-900/50 rounded-xl text-warning">
                <Clock className="w-5 h-5 md:w-[26px] md:h-[26px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-extrabold uppercase">
                  ຈອງແລ້ວ
                </p>
                <p className="text-xl md:text-3xl font-black">
                  {stats.reserved}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="flex-grow min-h-0 border-none shadow-md overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md flex flex-col mt-4">
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
                      <Tab key={zone.id} title={zone.name} />
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
                      onClick={() => navigate("/settings/table")}
                    >
                      <Settings size={18} />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 flex-grow overflow-y-auto scrollbar-hide">
              {isSelectingMenu ? (
                <div className="space-y-4">
                  <ScrollShadow
                    size={40}
                    orientation="horizontal"
                    className="max-w-full w-0 min-w-full overflow-x-auto scrollbar-hide"
                    hideScrollBar
                  >
                    <Tabs
                      aria-label="Product Categories"
                      color="primary"
                      variant="underlined"
                      selectedKey={selectedCategory}
                      onSelectionChange={(key) =>
                        setSelectedCategory(key as string)
                      }
                      classNames={{
                        tabList:
                          "gap-4 lg:gap-6 flex-nowrap p-0 min-w-max border-b-2 border-divider",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-1 h-10 lg:h-12 flex-shrink-0",
                        tabContent:
                          "group-data-[selected=true]:text-primary font-medium text-xs lg:text-sm whitespace-nowrap",
                      }}
                    >
                      {categories.map((cat) => (
                        <Tab key={cat.id} title={cat.label} />
                      ))}
                    </Tabs>
                  </ScrollShadow>

                  <MenuList
                    isLoadingProducts={isLoadingProducts}
                    products={products}
                    selectedTable={selectedTable}
                    addToCart={addToCart}
                    cart={cart}
                  />
                </div>
              ) : (
                <>
                  {filteredTables.length > 0 ? (
                    <div
                      className={clsx(
                        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-3",
                        selectedTable
                          ? "lg:grid-cols-4 xl:grid-cols-5"
                          : "lg:grid-cols-5 xl:grid-cols-5",
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
                    <EmptyState message="ບໍ່ພົບຂໍ້ມູນໂຕະ" />
                  )}
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* orders */}
      {selectedTable ? (
        <OrderRight
          selectedTable={selectedTable} // ข้อมูลโต๊ะที่เปิดอยู่
          setSelectedTable={setSelectedTable} // ฟังก์ชันสำหรับเปลี่ยนหรือปิดหน้าต่างโต๊ะ
          filteredCart={filteredCart} // รายการอาหารในตะกร้าที่กรองตามสถานะ
          selectedCartItems={selectedCartItems} // รายการ ID ของสินค้าที่ติ๊กเลือก (Checkbox)
          setSelectedCartItems={setSelectedCartItems} // ฟังก์ชันสำหรับอัปเดตรายการที่ติ๊กเลือก
          isSelectingMenu={isSelectingMenu} // สถานะการเปิด/ปิดหน้าเมนูอาหาร
          setIsSelectingMenu={setIsSelectingMenu} // ฟังก์ชันเปิด/ปิดหน้าเมนู
          setItemToRemove={setItemToRemove} // ระบุรายการที่ต้องการลบทิ้ง
          onRemoveItemOpen={onRemoveItemOpen} // เปิดหน้าต่างยืนยันการลบ
          expandedNotes={expandedNotes} // รายการที่กำลังเปิดดูหมายเหตุ (Note)
          toggleNote={toggleNote} // ฟังก์ชันเปิด/ปิดการแสดงหมายเหตุ
          statusFilter={statusFilter} // ตัวกรองสถานะปัจจุบัน (ทั้งหมด, รอ, กำลังคั่ว, เสิร์ฟแล้ว)
          setStatusFilter={setStatusFilter} // ฟังก์ชันสำหรับเปลี่ยนตัวกรองสถานะ
          statusTotals={statusTotals} // ยอดรวมราคาแยกตามแต่ละสถานะ
          onQrOpen={onQrOpen} // เปิดหน้าต่าง QR Code ของโต๊ะ
          onPaymentOpen={onOpen} // เปิดหน้าต่างรับชำระเงิน
          onCloseTableOpen={onCloseTableOpen} // เปิดหน้าต่างยืนยันการเช็คเอาท์ (ปิดโต๊ะ)
          updateTablePending={updateTable.isPending} // สถานะการบันทึกข้อมูลโต๊ะไปยัง Server
        />
      ) : (
        <div className="hidden lg:flex w-full lg:w-[400px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border-l border-divider">
          <div className="flex flex-col items-center gap-4 opacity-40">
            <ShoppingCart size={80} strokeWidth={1} />
            <p className="font-bold text-lg">ກະລຸນາເລືອກໂຕະ</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isQrOpen} onOpenChange={onQrOpenChange} size="md">
        <ModalContent>
          <ModalHeader>QR Code ໂຕະ {selectedTable?.name}</ModalHeader>
          <ModalBody className="flex flex-col items-center pb-8 pt-4">
            {selectedTable?.qrCode && (
              <QRCodeSVG
                value={`${window.location.origin}/menu/${selectedTable.qrCode}`}
                size={180}
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
        onOpenChange={onOpenChange}
        total={subtotal}
        items={cart}
        tableId={selectedTable?.id}
        onPaymentSuccess={handleCloseTable}
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
      />
    </div>
  );
}
