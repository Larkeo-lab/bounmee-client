import { useState, useMemo } from "react";
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
  Chip,
  Pagination,
  SortDescriptor,
  useDisclosure,
  Tabs,
  Tab,
} from "@heroui/react";
import { Plus, Edit, Trash2, Search, Users, QrCode } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import CreateAndEdit from "./CreateAndEdit";

import { useUpdateTable, useDeleteTable } from "@/services/table/useTable";
import { useDeleteZone } from "@/services/table/useZone";
import { useAuth } from "@/routes/AuthContext";
import { useGetTables } from "@/services/table/useTable";
import { useGetZones } from "@/services/table/useZone";
import ConfirmModal from "@/components/common/popup-confirm";


const columns = (t: any) => [
  { name: t("settings.common.no"), uid: "id", sortable: true },
  { name: t("settings.table.tableName"), uid: "name", sortable: true },
  { name: t("settings.table.zone"), uid: "zoneId", sortable: true },
  { name: t("settings.table.seats"), uid: "capacity", sortable: true },
  { name: t("settings.table.qrCode"), uid: "qrCode" },
  { name: t("settings.common.actions"), uid: "actions" },
];

const zoneColumns = (t: any) => [
  { name: t("settings.common.no"), uid: "id", sortable: true },
  { name: t("settings.table.zoneName"), uid: "name", sortable: true },
  { name: t("settings.common.actions"), uid: "actions" },
];

export default function TableSettingsPage() {
  const { t } = useTranslation();
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
    return selectedTab === "table" ? columns(t) : zoneColumns(t);
  }, [selectedTab, t]);

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
        const index = sortedItems.findIndex(
          (item: any) => item.id === table.id,
        );

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
          <Chip className="font-bold" color="primary" size="sm" variant="flat">
            {zone?.name || "N/A"}
          </Chip>
        );
      case "capacity":
        return (
          <div className="flex items-center gap-2">
            <Users className="text-default-400" size={16} />
            <span className="text-small font-medium">
              {cellValue} {t("ordering.seats")}
            </span>
          </div>
        );
      case "qrCode":
        return cellValue ? (
          <Chip
            className="font-bold border-success/30"
            color="success"
            size="sm"
            variant="dot"
          >
            {cellValue}
          </Chip>
        ) : (
          <Button
            color="warning"
            isLoading={isUpdatingTable}
            size="sm"
            variant="flat"
            onPress={() => handleGenerateQrForTable(table)}
          >
            <QrCode className="mr-1" size={14} /> {t("settings.common.upload")}
          </Button>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Button
              isIconOnly
              color="primary"
              size="sm"
              variant="light"
              onPress={() =>
                handleOpenModal(selectedTab as "table" | "zone", table)
              }
            >
              <Edit size={18} />
            </Button>
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
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
            placeholder={
              isTable
                ? t("settings.common.search")
                : t("settings.common.search")
            }
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Button
              className="font-bold h-12"
              color="primary"
              endContent={<Plus size={20} />}
              onPress={() => handleOpenModal(selectedTab as "table" | "zone")}
            >
              {t("settings.common.addNew")}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onOpen, selectedTab]);

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-primary">
          {t("settings.table.title")}
        </h1>
        <p className="text-default-500">{t("settings.table.subtitle")}</p>
      </div>

      <Tabs
        aria-label="Table and Zone Tabs"
        classNames={{
          tabList: "bg-content1 shadow-md w-full sm:w-auto",
          cursor: "w-full bg-primary",
          tab: "h-12 px-6",
          tabContent:
            "font-bold text-default-500 group-data-[selected=true]:text-white",
        }}
        color="primary"
        radius="full"
        selectedKey={selectedTab}
        variant="solid"
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
          setPage(1);
        }}
      >
        <Tab key="table" title={t("settings.table.title")} />
        <Tab key="zone" title={t("settings.table.zone")} />
      </Tabs>

      <Table
        isHeaderSticky
        aria-label="Table management"
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
          emptyContent={t("settings.common.noData")}
          isLoading={isLoading}
          items={sortedItems}
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
        isEditing={isEditing}
        isOpen={isOpen}
        item={selectedItem}
        modalType={modalType}
        storeId={storeId!}
        zones={zones}
        onOpenChange={onOpenChange}
      />
      <ConfirmModal
        cancelText={t("settings.common.cancel")}
        color="danger"
        confirmText={t("settings.common.delete")}
        icon={<Trash2 size={24} />}
        isOpen={isDeleteOpen}
        message={t("settings.common.confirmDeleteMsg")}
        title={t("settings.common.confirmDelete")}
        onConfirm={confirmDelete}
        onOpenChange={onDeleteOpenChange}
      />


    </div>
  );
}
