import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

import CreateAndEditUnit from "./CreateAndEditUnit";

import { useGetUnits, useDeleteUnit } from "@/services/unit/useUnit";
import ConfirmModal from "@/components/common/popup-confirm";

interface UnitListProps {
  storeId: string;
}

export default function UnitList({ storeId }: UnitListProps) {
  const { t } = useTranslation();
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: unitsResponse, isLoading } = useGetUnits(storeId);
  const units = unitsResponse?.data || [];
  const deleteUnitMutation = useDeleteUnit(storeId);

  const filteredItems = useMemo(() => {
    let filteredList = [...units];
    if (filterValue) {
      filteredList = filteredList.filter((item: any) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredList;
  }, [units, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const handleOpenModal = (item: any = null) => {
    setSelectedItem(item);
    setIsEditing(!!item);
    onOpen();
  };

  const handleDeleteOpen = (id: string) => {
    setItemToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteUnitMutation.mutateAsync(itemToDelete);
      setItemToDelete(null);
    }
  };

  const renderCell = (item: any, columnKey: React.Key, index: number) => {
    switch (columnKey) {
      case "no":
        return (page - 1) * rowsPerPage + index + 1;
      case "name":
        return item.name;
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Button
              isIconOnly
              color="primary"
              size="sm"
              variant="light"
              onPress={() => handleOpenModal(item)}
            >
              <Edit size={18} />
            </Button>
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onPress={() => handleDeleteOpen(item.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      default:
        return item[columnKey as keyof typeof item];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder={t("settings.common.search")}
          startContent={<Search size={18} />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
        />
        <Button
          className="font-bold"
          color="primary"
          endContent={<Plus size={20} />}
          onPress={() => handleOpenModal()}
        >
          {t("settings.common.addNew")}
        </Button>
      </div>

      <Table
        aria-label="Units management table"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl",
          th: "bg-default-50 text-default-600 font-bold",
        }}
      >
        <TableHeader>
          <TableColumn key="no">{t("settings.common.no")}</TableColumn>
          <TableColumn key="name">{t("settings.common.nameLabel")}</TableColumn>
          <TableColumn key="actions" align="end">{t("settings.common.actions")}</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={!isLoading && t("settings.common.noData")}
          isLoading={isLoading}
          loadingContent={<Spinner label={t("settings.common.loading")} />}
        >
          {items.map((item, index) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey, index)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateAndEditUnit
        isEditing={isEditing}
        isOpen={isOpen}
        item={selectedItem}
        storeId={storeId}
        onOpenChange={onOpenChange}
      />

      <ConfirmModal
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
