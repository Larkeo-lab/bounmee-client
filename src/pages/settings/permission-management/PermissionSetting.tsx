import { useState, useRef, useEffect } from "react";
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
import GlobalTableCustom from "@/components/common/globle-table-custom";
import GlobalPagination from "@/components/common/globle-pagination";
import ModalConfirm from "@/components/common/modal-confirm";
import SuccessModal from "@/components/common/success-modal";
import { PermissionData } from "@/types";
import { Input } from "@heroui/input";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import {
  useGetPermissions,
  useDeletePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { useAuth } from "@/routes/AuthContext";

export default function PermissionManagement() {
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
    onClose: onPendingClose,
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
        : selectedStatus === "ເປີດໃຊ້ງານ",
  });

  const deleteMutation = useDeletePermission();
  const updateMutation = useUpdatePermission();

  const permissions = permissionsData?.data || [];

  console.log("permissions", permissions);

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
          ຕັ້ງຄ່າກຳນົດສິດແອັດມິນ
        </h1>
      </div>

      {/* Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">
              ຕັ້ງຄ່າກຳນົດສິດແອັດມິນ
            </h2>
            <p className="text-sm text-default-500">
              ລາຍການແອັດມິນໃນການຕັ້ງຄ່າກຳນົດສິດແອັດມິນ
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 ">
            {/* Left side - Search */}
            <div className="w-[500px]">
              <Input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ຄົ້ນຫາ..."
                aria-label="Search permissions"
                startContent={<Search size={18} />}
              />
            </div>

            {/* Right side - Date, Status, Add Button */}
            <div className="flex items-center gap-5">
              <div className="w-[120px]">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between text-sm"
                      endContent={<ChevronDown size={16} />}
                    >
                      {selectedStatus || "ສະຖານະ"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Status selection"
                    onAction={(key) => setSelectedStatus(key as string)}
                  >
                    <DropdownItem key="all">ທັງໝົດ</DropdownItem>
                    <DropdownItem key="ເປີດໃຊ້ງານ">ເປີດໃຊ້ງານ</DropdownItem>
                    <DropdownItem key="ປິດໃຊ້ງານ">ປິດໃຊ້ງານ</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <Button
                variant="solid"
                color="primary"
                type="button"
                onPress={handleAddUser}
              >
                <PlusCircle size={14} />
                <span>ເພີ່ມສິດຜູ້ໃຊ້</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mt-4">
            <GlobalTableCustom
              isLoading={isLoading}
              emptyContent={<EmptyState />}
              header={[
                "ລຳດັບ",
                "ຊື່ສິດໃນການນຳໃຊ້",
                "ລາຍລະອຽດ",
                "ຈຳນວນຜູ້ໃຊ້",
                "ສະຖານະໃຊ້ງານ",
                <div
                  key="date"
                  className="flex items-center justify-center gap-1"
                >
                  ວັນທີສ້າງ{" "}
                  <ChevronsUpDown size={14} className="text-gray-600" />
                </div>,
                "ຈັດການ",
              ]}
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
                        size="sm"
                        isSelected={permission?.isActive}
                        onValueChange={() => {
                          toggleActive(permission);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Toggle ${permission?.name}`}
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
                        type="button"
                        onPress={() => {
                          navigate(`/permission/add/${permission?.id}`, {
                            state: permission,
                          });
                        }}
                        isIconOnly
                        variant="flat"
                        aria-label={`Edit ${permission?.name}`}
                      >
                        <SquarePen size={16} />
                      </Button>

                      <Button
                        type="button"
                        onPress={() => {
                          handleDeleteClick(permission);
                        }}
                        isIconOnly
                        color="danger"
                        variant="flat"
                        aria-label={`Delete ${permission?.name}`}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </GlobalTableCustom>
          </div>

          {/* Delete / Success Modals (render once) */}
          <ModalConfirm
            icon={<Trash2 size={32} color="red" />}
            title="ຢືນຢັນການລືບສິດ"
            content={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລືບສິດ ${selectedPermission?.name}?`}
            confirmColor="danger"
            confirmText="ລືບ"
            cancelText="ຍົກເລີກ"
            onConfirm={handleDeleteConfirm}
            isOpen={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
          />

          <SuccessModal
            isOpen={isSuccessModalOpen}
            onOpenChange={setIsSuccessModalOpen}
            title="ລືບສຳເລັດ!"
            message={`ສິດ ${selectedPermission?.name} ຖືກລືບອອກຈາກລະບົບແລ້ວ`}
            onClose={handleSuccessModalClose}
          />
        </CardBody>

        {/* Pending Status Modal */}
        <ConfirmModal
          isOpen={isPendingOpen}
          onOpenChange={onPendingOpenChange}
          title="ບໍ່ສາມາດເພີ່ມໄດ້"
          message="ທ່ານຍັງບໍ່ໄດ້ຍ້ອມຮັບຈາກເຈົ້າຂອງກະລູນาຕິດຕໍ່ຫາເບີ 2099999999"
          confirmText="ຕົກລົງ"
          onConfirm={onPendingClose}
          color="warning"
        />

        {/* Rejected Status Modal */}
        <ConfirmModal
          isOpen={isRejectedOpen}
          onOpenChange={onRejectedOpenChange}
          title="ບໍ່ສາມາດສ້າງໄດ້"
          message="ການສະໝັກຂອງທ່ານຖືກປະຕิເສດ"
          confirmText="ຕົກລົງ"
          onConfirm={onRejectedClose}
          color="danger"
        />

        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            ສະແດງ {permissions.length > 0 ? 1 : 0}-{permissions.length} ຈາກ{" "}
            {permissions.length}
          </div>
          <div className="flex justify-center items-center">
            <GlobalPagination
              totalPages={Math.ceil(permissions.length / 10)}
              totalItems={permissions.length}
              page={1}
              onChange={() => {}}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
