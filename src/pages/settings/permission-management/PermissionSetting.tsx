import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Plus,
  Search,
  SquarePen,
  Trash2,
  Shield,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/routes/AuthContext";
import {
  useGetPermissions,
  useDeletePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { PermissionData } from "@/types";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";

export default function PermissionManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.user?.store?.id || "";

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedPermission, setSelectedPermission] =
    useState<PermissionData | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: permissionsData, isLoading } = useGetPermissions({
    storeId,
    search: debouncedSearch || undefined,
    isActive:
      selectedStatus === "all" ? undefined : selectedStatus === "active",
  });

  const deleteMutation = useDeletePermission();
  const updateMutation = useUpdatePermission();

  const items = useMemo(() => permissionsData?.data || [], [permissionsData]);

  const toggleActive = (permission: PermissionData) => {
    updateMutation.mutate({
      id: permission.id,
      data: {
        ...permission,
        isActive: !permission.isActive,
      },
    });
  };

  const handleDeleteOpen = (permission: PermissionData) => {
    setSelectedPermission(permission);
    onDeleteOpen();
  };

  const handleDeleteSubmit = () => {
    if (selectedPermission) {
      deleteMutation.mutate(selectedPermission.id, {
        onSuccess: () => {
          onDeleteClose();
          setSelectedPermission(null);
        },
      });
    }
  };

  const statusLabel = useMemo(() => {
    if (selectedStatus === "active") return t("settings.common.active");
    if (selectedStatus === "inactive") return t("settings.common.inactive");
    return t("settings.common.all");
  }, [selectedStatus, t]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return items.slice(start, end);
  }, [page, items, rowsPerPage]);

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield size={28} />
            {t("permission.title")}
          </h1>
          <p className="text-default-500">{t("permission.subtitle")}</p>
        </div>
        <Button
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
          color="primary"
          startContent={<Plus size={20} />}
          onPress={() => navigate("/permission/add")}
        >
          {t("permission.addTitle")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            isClearable
            className="w-full sm:max-w-md"
            placeholder={t("settings.common.search")}
            startContent={<Search className="text-default-400" size={18} />}
            value={searchQuery}
            variant="bordered"
            onValueChange={setSearchQuery}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="capitalize min-w-[120px]"
                endContent={
                  <ChevronDown className="text-default-400" size={16} />
                }
                variant="bordered"
              >
                {statusLabel}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by status"
              selectedKeys={[selectedStatus]}
              selectionMode="single"
              onSelectionChange={(keys) =>
                setSelectedStatus(Array.from(keys)[0] as string)
              }
            >
              <DropdownItem key="all">{t("settings.common.all")}</DropdownItem>
              <DropdownItem key="active">
                {t("settings.common.active")}
              </DropdownItem>
              <DropdownItem key="inactive">
                {t("settings.common.inactive")}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="text-default-400 text-sm">
          {t("settings.common.total", { count: items.length })}
        </div>
      </div>

      <Table
        aria-label="Permission table"
        bottomContent={
          items.length > rowsPerPage && (
            <div className="flex w-full justify-center p-4">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={Math.ceil(items.length / rowsPerPage)}
                onChange={setPage}
              />
            </div>
          )
        }
        className="mt-4"
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
      >
        <TableHeader>
          <TableColumn>{t("settings.common.no")}</TableColumn>
          <TableColumn>{t("permission.permissionName")}</TableColumn>
          <TableColumn>{t("settings.common.description")}</TableColumn>
          <TableColumn className="text-center">
            {t("permission.userCount")}
          </TableColumn>
          <TableColumn className="text-center">
            {t("settings.common.status")}
          </TableColumn>
          <TableColumn className="text-center">
            {t("permission.createdDate")}
          </TableColumn>
          <TableColumn className="text-center">
            {t("settings.common.actions")}
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyState />} isLoading={isLoading}>
          {paginatedItems.map((item: PermissionData, index: number) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold">
                {(page - 1) * rowsPerPage + index + 1}
              </TableCell>
              <TableCell className="font-semibold">{item.name}</TableCell>
              <TableCell className="text-default-500 max-w-xs truncate">
                {item.description || "-"}
              </TableCell>
              <TableCell className="text-center">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  {item._count?.employees || 0}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Switch
                    aria-label={`Toggle ${item.name}`}
                    isSelected={item.isActive}
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    onValueChange={() => toggleActive(item)}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                {new Date(
                  item.updatedAt || item.updated || new Date(),
                ).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigate(`/permission/add/${item.id}`, { state: item });
                    }}
                  >
                    <SquarePen size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDeleteOpen(item)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmModal
        color="danger"
        confirmText={t("settings.common.delete")}
        icon={<Trash2 size={24} />}
        isOpen={isDeleteOpen}
        message={t("permission.deleteConfirmMsg", {
          name: selectedPermission?.name,
        })}
        title={t("permission.deleteConfirmTitle")}
        onConfirm={handleDeleteSubmit}
        onOpenChange={onDeleteOpenChange}
      />
    </div>
  );
}
