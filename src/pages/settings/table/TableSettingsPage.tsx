import { useState, useMemo } from "react";
import {
  useUpdateTable,
  useDeleteTable,
} from "@/services/table/useTable";
import {
  useDeleteZone,
} from "@/services/table/useZone";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  SortDescriptor,
  useDisclosure,
  Tabs,
  Tab,
} from "@heroui/react";
import { Plus, Edit, Trash2, Search, Users, QrCode } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useGetTables } from "@/services/table/useTable";
import { useGetZones } from "@/services/table/useZone";
import ConfirmModal from "@/components/common/popup-confirm";
import CreateAndEdit from "./CreateAndEdit";

const columns = [
  { name: "ລຳດັບ", uid: "id", sortable: true },
  { name: "ຊື່ໂຕະ", uid: "name", sortable: true },
  { name: "ໂຊນ", uid: "zoneId", sortable: true },
  { name: "ຈຳນວນບ່ອນນັ່ງ", uid: "capacity", sortable: true },
  { name: "QR Code", uid: "qrCode" },
  { name: "ຈັດການ", uid: "actions" },
];

const zoneColumns = [
  { name: "ລຳດັບ", uid: "id", sortable: true },
  { name: "ຊື່ໂຊນ", uid: "name", sortable: true },
  { name: "ຈັດການ", uid: "actions" },
];

export default function TableSettingsPage() {
  const { user } = useAuth();
  const storeId = user?.user?.storeId;

  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("table");
  const [modalType, setModalType] = useState<"table" | "zone">("table");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<{
    type: "table" | "zone";
    id: string;
  } | null>(null);
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onClose: onPendingClose,
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRejectedOpen,
    onOpen: onRejectedOpen,
    onClose: onRejectedClose,
    onOpenChange: onRejectedOpenChange,
  } = useDisclosure();

  const { mutateAsync: updateTable, isPending: isUpdatingTable } =
    useUpdateTable();
  const { mutateAsync: deleteTable } = useDeleteTable(storeId);
  const { mutateAsync: deleteZone } = useDeleteZone(storeId);

  const { data: tablesResponse, isLoading: isLoadingTables } =
    useGetTables(storeId);
  const { data: zonesResponse, isLoading: isLoadingZones } =
    useGetZones(storeId);

  const tables = tablesResponse?.data || [];
  const zones = zonesResponse?.data || [];
  const isLoading = selectedTab === "table" ? isLoadingTables : isLoadingZones;

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return selectedTab === "table" ? columns : zoneColumns;
  }, [selectedTab]);

  const filteredItems = useMemo(() => {
    let filteredList = selectedTab === "table" ? [...tables] : [...zones];

    if (hasSearchFilter) {
      filteredList = filteredList.filter((item: any) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filteredList;
  }, [tables, zones, filterValue, hasSearchFilter, selectedTab]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleOpenModal = (type: "table" | "zone", item: any = null) => {
    // @ts-ignore
    const storeStatus = user?.user?.store?.status;
    if (!item && storeStatus === "PENDING") {
      onPendingOpen();
      return;
    }
    if (!item && storeStatus === "REJECTED") {
      onRejectedOpen();
      return;
    }
    setModalType(type);
    setSelectedItem(item);
    setIsEditing(!!item);
    onOpen();
  };

  const handleDelete = (type: "table" | "zone", id: string) => {
    setItemToDelete({ type, id });
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === "table") {
        await deleteTable(itemToDelete.id);
      } else {
        await deleteZone(itemToDelete.id);
      }
      setItemToDelete(null);
    }
  };

  const handleGenerateQrForTable = async (table: any) => {
    const uniqueId = uuidv4().substring(0, 8).toUpperCase();
    await updateTable({
      id: table.id,
      storeId: storeId!,
      qrCode: `TB-${uniqueId}`,
    });
  };

  const renderCell = (table: any, columnKey: React.Key) => {
    const cellValue = table[columnKey as keyof typeof table];

    switch (columnKey) {
      case "id":
        const index = sortedItems.findIndex((item: any) => item.id === table.id);
        return (
          <span className="text-small font-medium">
            {(page - 1) * rowsPerPage + index + 1}
          </span>
        );
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
          </div>
        );
      case "zoneId":
        const zone = zones.find((z: any) => z.id === cellValue);
        return (
          <Chip color="primary" variant="flat" size="sm" className="font-bold">
            {zone?.name || "N/A"}
          </Chip>
        );
      case "capacity":
        return (
          <div className="flex items-center gap-2">
            <Users size={16} className="text-default-400" />
            <span className="text-small font-medium">{cellValue} ຄົນ</span>
          </div>
        );
      case "qrCode":
        return cellValue ? (
          <Chip
            color="success"
            variant="dot"
            size="sm"
            className="font-bold border-success/30"
          >
            {cellValue}
          </Chip>
        ) : (
          <Button
            size="sm"
            color="warning"
            variant="flat"
            onPress={() => handleGenerateQrForTable(table)}
            isLoading={isUpdatingTable}
          >
            <QrCode size={14} className="mr-1" /> ສ້າງລະຫັດ
          </Button>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() =>
                handleOpenModal(selectedTab as "table" | "zone", table)
              }
            >
              <Edit size={18} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() =>
                handleDelete(selectedTab as "table" | "zone", table.id)
              }
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  };

  const topContent = useMemo(() => {
    const isTable = selectedTab === "table";
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={`ຄົ້ນຫາຊື່${isTable ? "ໂຕະ" : "ໂຊນ"}...`}
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Button
              color="primary"
              endContent={<Plus size={20} />}
              className="font-bold h-12"
              onPress={() => handleOpenModal(selectedTab as "table" | "zone")}
            >
              ເພີ່ມ{isTable ? "ໂຕະ" : "ໂຊນ"}ໃໝ່
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onOpen, selectedTab]);

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-primary">ຫນ້າໂຕະອາຫານ</h1>
        <p className="text-default-500">
          ເພີ່ມ, ແກ້ໄຂ ຫຼື ລົບ ຂໍ້ມູນໂຕະອາຫານ ແລະ ໂຊນ
        </p>
      </div>

      <Tabs
        aria-label="Table and Zone Tabs"
        selectedKey={selectedTab}
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
          setPage(1);
        }}
        color="primary"
        variant="solid"
        radius="full"
        classNames={{
          tabList: "bg-content1 shadow-md w-full sm:w-auto",
          cursor: "w-full bg-primary",
          tab: "h-12 px-6",
          tabContent:
            "font-bold text-default-500 group-data-[selected=true]:text-white",
        }}
      >
        <Tab key="table" title="ຈັດການໂຕະ" />
        <Tab key="zone" title="ຈັດການໂຊນ" />
      </Tabs>

      <Table
        aria-label="Table management"
        isHeaderSticky
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        }
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "shadow-md rounded-2xl",
          th: "bg-primary/10 text-primary font-bold",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"ບໍ່ມີຂໍ້ມູນ"}
          items={sortedItems}
          isLoading={isLoading}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreateAndEdit
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isEditing={isEditing}
        modalType={modalType}
        item={selectedItem}
        zones={zones}
        storeId={storeId!}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="ຢືນຢັນການລົບ?"
        message="ທ່ານແນ່ໃຈຫລືບໍ່ວ່າຕ້ອງການລົບຂໍ້ມູນນີ້? ການລົບຈະບໍ່ສາມາດກູ້ຄືນໄດ້."
        confirmText="ຢືນຢັນລົບ"
        cancelText="ຍົກເລີກ"
        onConfirm={confirmDelete}
        color="danger"
        icon={<Trash2 size={24} />}
      />

      {/* Pending Status Modal */}
      <ConfirmModal
        isOpen={isPendingOpen}
        onOpenChange={onPendingOpenChange}
        title="ບໍ່ສາມາດເພີ່ມໄດ້"
        message="ທ່ານຍັງບໍ່ໄດ້ຍ້ອມຮັບຈາກເຈົ້າຂອງກະລູນາຕິດຕໍ່ຫາເບີ 2099999999"
        confirmText="ຕົກລົງ"
        onConfirm={onPendingClose}
        color="warning"
      />

      {/* Rejected Status Modal */}
      <ConfirmModal
        isOpen={isRejectedOpen}
        onOpenChange={onRejectedOpenChange}
        title="ບໍ່ສາມາດສ້າງໄດ້"
        message="ການສະໝັກຂອງທ່ານຖືກປະຕິເສດ"
        confirmText="ຕົກລົງ"
        onConfirm={onRejectedClose}
        color="danger"
      />
    </div>
  );
}
