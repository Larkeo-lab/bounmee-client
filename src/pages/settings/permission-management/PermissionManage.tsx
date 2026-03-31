import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Eye,
  Trash2,
  ChevronsUpDown,
  PlusCircle,
  PenLine,
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
  Input,
} from "@heroui/react";
import DateRangePickerComponent from "@/components/common/date-range-picker";
import GlobalPagination from "@/components/common/globle-pagination";
import ModalConfirm from "@/components/common/modal-confirm";
import SuccessModal from "@/components/common/success-modal";
import { PermissionData, DateRange } from "@/types";
import EmptyState from "@/components/common/empty-state";
import {
  useGetPermissions,
  useDeletePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { useAuth } from "@/routes/AuthContext";

export default function PermissionManagement() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionData | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const storeId = user?.user?.store?.id || "";
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const {
    data: permissionsData,
    isLoading,
    isError,
  } = useGetPermissions({
    storeId,
    isActive:
      !selectedStatus || selectedStatus === "all"
        ? undefined
        : selectedStatus === "ເປີດໃຊ້ງານ",
  });

  const deleteMutation = useDeletePermission();
  const updateMutation = useUpdatePermission();

  const permissions = permissionsData?.data || [];
  const filteredPermissions = permissions.filter((p: PermissionData) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
  };

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

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="">
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
          {isError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນສິດ
              </p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-300">
            {/* Left side - Search */}
            <div className="w-full lg:w-[500px]">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ຄົ້ນຫາ..."
                aria-label="Search permissions"
                startContent={<Search size={18} />}
                disabled={isLoading}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-10",
                }}
              />
            </div>

            {/* Right side - Date, Status, Add Button */}
            <div className="flex items-center gap-5">
              <div className="w-[250px]">
                <DateRangePickerComponent
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  color="primary"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="w-[120px]">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-between text-sm"
                      endContent={<ChevronDown size={16} />}
                      disabled={isLoading}
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
                className="text-white hover:opacity-80 flex items-center justify-center px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#3554A1" }}
                type="button"
                onClick={() => navigate("/add/permission-user")}
                disabled={isLoading}
              >
                <PlusCircle size={14} />
                <span>ເພີ່ມສິດຜູ້ໃຊ້</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-6 ">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    ກຳລັງໂຫລດຂໍ້ມູນ...
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100 rounded-2xl">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        ໄອດີກະຊວງ{" "}
                        <ChevronsUpDown size={14} className="text-gray-600" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ຊື່ສິດໃນການນຳໃຊ້
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ສິດການນຳໃຊ້
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ຈຳນວນຜູ່ໃຊ້
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ສະຖານະໃຊ້ງານ
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        ວັນທີສ້າງ{" "}
                        <ChevronsUpDown size={14} className="text-gray-600" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ຈັດການ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions && filteredPermissions.length > 0 ? (
                    filteredPermissions.map((permission: PermissionData) => (
                      <tr
                        key={permission.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/View/User`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            navigate(`/settingPermission/${permission.id}`);
                        }}
                      >
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {permission.id}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {permission.name}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {permission.permissions
                            ? JSON.stringify(permission.permissions).substring(
                                0,
                                50,
                              )
                            : "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {permission?._count?.employees || 0}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActive(permission);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              permission.isActive ? "" : "bg-gray-300"
                            }`}
                            style={
                              permission.isActive
                                ? { backgroundColor: "#3554A1" }
                                : undefined
                            }
                            aria-pressed={permission.isActive}
                            aria-label={`Toggle ${permission.name}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                permission.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {new Date(
                            permission.createdAt || new Date(),
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/permission/detail", {
                                  state: { permission, edit: true },
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              aria-label={`Edit ${permission.name}`}
                            >
                              <PenLine size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/permission/detail", {
                                  state: { permission },
                                });
                              }}
                              className="text-gray-600 hover:text-blue-600 p-1 rounded"
                              aria-label={`View ${permission.name}`}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(permission);
                              }}
                              className="text-red-600 hover:text-red-700 p-1 rounded"
                              aria-label={`Delete ${permission.name}`}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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

        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center items-center">
            <GlobalPagination
              totalPages={Math.ceil(filteredPermissions.length / 10)}
              totalItems={filteredPermissions.length}
              showing={1}
              results={filteredPermissions.length}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
