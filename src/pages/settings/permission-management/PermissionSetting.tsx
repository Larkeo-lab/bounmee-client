import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Trash2,
  ChevronsUpDown,
  PlusCircle,
  SquarePen,
} from "lucide-react";
import { Button } from "@heroui/button";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  TableRow,
  TableCell,
  Switch,
  useDisclosure,
} from "@heroui/react";
import { Input } from "@heroui/input";

import GlobalTableCustom from "@/components/common/globle-table-custom";
import GlobalPagination from "@/components/common/globle-pagination";
import ModalConfirm from "@/components/common/modal-confirm";
import SuccessModal from "@/components/common/success-modal";
import { PermissionData } from "@/types";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import PendingModal from "@/components/common/pending-modal";
import {
  useGetPermissions,
  useDeletePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { useAuth } from "@/routes/AuthContext";

export default function PermissionManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.user?.store?.id || "";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionData | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRejectedOpen,
    onOpen: onRejectedOpen,
    onClose: onRejectedClose,
    onOpenChange: onRejectedOpenChange,
  } = useDisclosure();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: permissionsData, isLoading } = useGetPermissions({
    storeId,
    search: debouncedSearch || undefined,
    isActive:
      !selectedStatus || selectedStatus === "all"
        ? undefined
        : selectedStatus === t("settings.common.active"),
  });

  const deleteMutation = useDeletePermission();
  const updateMutation = useUpdatePermission();

  const permissions = permissionsData?.data || [];

  const toggleActive = (permission: PermissionData) => {
    updateMutation.mutate({
      id: permission.id,
      data: {
        ...permission,
        isActive: !permission.isActive,
      },
    });
  };

  const handleDeleteClick = (permission: PermissionData) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPermission) {
      deleteMutation.mutate(selectedPermission.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setIsSuccessModalOpen(true);
        },
      });
    }
  };

  const handleSuccessModalClose = () => {
    setSelectedPermission(null);
    setIsSuccessModalOpen(false);
  };

  const handleAddUser = () => {
    // @ts-ignore
    const storeStatus = user?.user?.store?.status;

    if (storeStatus === "PENDING") {
      onPendingOpen();
    } else if (storeStatus === "REJECTED") {
      onRejectedOpen();
    } else {
      navigate("/permission/add");
    }
  };

  // Handle delete success
  useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsSuccessModalOpen(true);
    }
  }, [deleteMutation.isSuccess]);

  useEffect(() => {
    // Focus on search input when component mounts
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className=" m-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-medium font-bold text-gray-500">
          {t("permission.title")}
        </h1>
      </div>

      {/* Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("permission.title")}
            </h2>
            <p className="text-sm text-default-500">
              {t("permission.subtitle")}
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 ">
            {/* Left side - Search */}
            <div className="w-[500px]">
              <Input
                ref={searchInputRef}
                aria-label="Search permissions"
                placeholder={t("settings.common.search")}
                startContent={<Search size={18} />}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Right side - Date, Status, Add Button */}
            <div className="flex items-center gap-5">
              <div className="w-[120px]">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      className="w-full justify-between text-sm"
                      endContent={<ChevronDown size={16} />}
                      variant="bordered"
                    >
                      {selectedStatus || t("settings.common.status")}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Status selection"
                    onAction={(key) => setSelectedStatus(key as string)}
                  >
                    <DropdownItem key="all">
                      {t("settings.common.all")}
                    </DropdownItem>
                    <DropdownItem key={t("settings.common.active")}>
                      {t("settings.common.active")}
                    </DropdownItem>
                    <DropdownItem key={t("settings.common.inactive")}>
                      {t("settings.common.inactive")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <Button
                color="primary"
                type="button"
                variant="solid"
                onPress={handleAddUser}
              >
                <PlusCircle size={14} />
                <span>{t("permission.addTitle")}</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mt-4">
            <GlobalTableCustom
              emptyContent={<EmptyState />}
              header={[
                t("settings.common.no"),
                t("permission.permissionName"),
                t("settings.common.description"),
                t("permission.userCount"),
                t("settings.common.status"),
                <div
                  key="date"
                  className="flex items-center justify-center gap-1"
                >
                  {t("permission.createdDate")}{" "}
                  <ChevronsUpDown className="text-gray-600" size={14} />
                </div>,
                t("settings.common.actions"),
              ]}
              isLoading={isLoading}
            >
              {permissions.map((permission: PermissionData, index: number) => (
                <TableRow
                  key={permission?.id}
                  // onClick={() => navigate(`/role-permission/view/${permission.id}`, { state: { permission } })}
                >
                  <TableCell className="text-sm text-gray-900 text-left">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-left">
                    {permission?.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-left">
                    {permission?.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-center">
                    {permission?._count?.employees || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        aria-label={`Toggle ${permission?.name}`}
                        isSelected={permission?.isActive}
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        onValueChange={() => {
                          toggleActive(permission);
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-center">
                    {new Date(
                      permission?.updatedAt ||
                        permission?.updated ||
                        new Date(),
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        isIconOnly
                        aria-label={`Edit ${permission?.name}`}
                        type="button"
                        variant="flat"
                        onPress={() => {
                          navigate(`/permission/add/${permission?.id}`, {
                            state: permission,
                          });
                        }}
                      >
                        <SquarePen size={16} />
                      </Button>

                      <Button
                        isIconOnly
                        aria-label={`Delete ${permission?.name}`}
                        color="danger"
                        disabled={deleteMutation.isPending}
                        type="button"
                        variant="flat"
                        onPress={() => {
                          handleDeleteClick(permission);
                        }}
                      >
                        <Trash2 className="text-danger" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </GlobalTableCustom>
          </div>

          {/* Delete / Success Modals (render once) */}
          <ModalConfirm
            cancelText={t("settings.common.cancel")}
            confirmColor="danger"
            confirmText={t("settings.common.delete")}
            content={t("permission.deleteConfirmMsg", {
              name: selectedPermission?.name,
            })}
            icon={<Trash2 color="red" size={32} />}
            isOpen={isDeleteModalOpen}
            title={t("permission.deleteConfirmTitle")}
            onConfirm={handleDeleteConfirm}
            onOpenChange={setIsDeleteModalOpen}
          />

          <SuccessModal
            isOpen={isSuccessModalOpen}
            message={t("permission.deleteSuccessMsg", {
              name: selectedPermission?.name,
            })}
            title={t("permission.deleteSuccessTitle")}
            onClose={handleSuccessModalClose}
            onOpenChange={setIsSuccessModalOpen}
          />
        </CardBody>

        {/* Pending Status Modal */}
        <PendingModal
          isOpen={isPendingOpen}
          onOpenChange={onPendingOpenChange}
        />

        {/* Rejected Status Modal */}
        <ConfirmModal
          color="danger"
          confirmText={t("settings.common.ok")}
          isOpen={isRejectedOpen}
          message={t("settings.common.rejectedMsg")}
          title={t("settings.common.rejectedTitle")}
          onConfirm={onRejectedClose}
          onOpenChange={onRejectedOpenChange}
        />

        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {t("settings.common.total", { count: permissions.length })}
          </div>
          <div className="flex justify-center items-center">
            <GlobalPagination
              page={1}
              totalItems={permissions.length}
              totalPages={Math.ceil(permissions.length / 10)}
              onChange={() => {}}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
