import { useState, useMemo } from "react";
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
  Image,
  Chip,
} from "@heroui/react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  User,
} from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetEmployees,
  useDeleteEmployee,
  Employee,
} from "@/services/employee/useEmployee";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGetStoreDetail } from "@/services/store/useStore";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import AddAndEdit from "./AddAndEdit";

export default function EmployeePage() {
  const { user } = useAuth();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onClose: onPendingClose,
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const {
    data: storeResponse,
    isLoading: isStoreLoading,
    refetch: getStore,
  } = useGetStoreDetail(user?.user?.store?.id);
  const store = storeResponse?.data;

  const {
    data: employeeResponse,
    isLoading: isEmployeesLoading,
    refetch: getEmployees,
  } = useGetEmployees(user?.user?.storeId);
  const employees: Employee[] = employeeResponse?.data || [];

  const deleteEmployeeMutation = useDeleteEmployee(user?.user?.storeId);

  const combinedEmployees = useMemo(() => {
    if (!store?.users) return [];

    return store.users
      .map((u: any) => {
        // Find matching employee record if exists
        const emp = employees.find((e) => e.id === u.employeeId);
        return {
          id: u.id,
          employeeId: u.employeeId,
          name: emp?.name || u.userName,
          logoUrl: emp?.logoUrl || null,
          phone: u.phone,
          userName: u.userName,
          role: u.role,
          language: u.language,
          permissionId: emp?.permission?.id || null,
          businessType: emp?.businessType || null,
          originalEmployee: emp,
        };
      })
      .sort((a: any, b: any) => {
        if (a.role === "STORE_ADMIN" && b.role !== "STORE_ADMIN") return -1;
        if (a.role !== "STORE_ADMIN" && b.role === "STORE_ADMIN") return 1;
        return 0;
      });
  }, [store?.users, employees]);

  const isLoading = isStoreLoading || isEmployeesLoading;

  const filteredItems = useMemo(() => {
    let filtered = [...combinedEmployees];
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.phone?.includes(searchQuery),
      );
    }
    return filtered;
  }, [combinedEmployees, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);


  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedEmployee) return;
    try {
      await deleteEmployeeMutation.mutateAsync(selectedEmployee.id);
      onClose();
      getEmployees();
      getStore();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };


  const handleEditOpen = (item: any) => {
    setSelectedEmployee(item.originalEmployee || item);
    onFormOpen();
  };

  const handleCreateOpen = () => {
    // @ts-ignore
    if (user?.user?.store?.status === "PENDING") {
      onPendingOpen();
    } else {
      setSelectedEmployee(null);
      onFormOpen();
    }
  };

  const handleDeleteOpen = (item: any) => {
    if (item.originalEmployee) {
      setSelectedEmployee(item.originalEmployee);
      onDeleteOpen();
    }
  };



  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users size={28} />
            ຈັດການພະນັກງານ {store ? `(${store.name})` : ""}
          </h1>
          <p className="text-default-500">
            ຈັດການຂໍ້ມູນພະນັກງານ ແລະ ການເຂົ້າເຖິງລະບົບ
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
        >
          ເພີ່ມພະນັກງານໃໝ່
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          placeholder="ຄົ້ນຫາຊື່, Username ຫຼື ເບີໂທ..."
          startContent={<Search className="text-default-400" size={18} />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          variant="bordered"
        />
        <div className="text-default-400 text-sm">
          ທັງໝົດ {filteredItems.length} ລາຍການ
        </div>
      </div>

      <Table
        aria-label="Employee table"
        className="mt-4"
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
        bottomContent={
          filteredItems.length > rowsPerPage && (
            <div className="flex w-full justify-center p-4">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={Math.ceil(filteredItems.length / rowsPerPage)}
                onChange={setPage}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn>ພະນັກງານ</TableColumn>
          <TableColumn>ເບີໂທ</TableColumn>
          <TableColumn>Username</TableColumn>
          <TableColumn>ບົດບາດ</TableColumn>
          <TableColumn className="text-center">ຈັດການ</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={<EmptyState />}>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-divider bg-default-50">
                    {item.logoUrl ? (
                      <Image
                        src={getDisplayImageUrl(item.logoUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-default-400">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </div>
              </TableCell>
              <TableCell>{item.phone || "-"}</TableCell>
              <TableCell>{item.userName || "-"}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={item.role === "STORE_ADMIN" ? "warning" : "primary"}
                  variant="flat"
                >
                  {item.role === "STORE_ADMIN" ? "ເຈົ້າຂອງຮ້ານ" : "ພະນັກງານ"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => handleEditOpen(item)}
                    isDisabled={item.role === "STORE_ADMIN"}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleDeleteOpen(item)}
                    isDisabled={item.role === "STORE_ADMIN"}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddAndEdit
        isOpen={isFormOpen}
        onOpenChange={onFormOpenChange}
        selectedEmployee={selectedEmployee}
        storeId={user?.user?.storeId || ""}
        onSuccess={() => {
          getEmployees();
          getStore();
        }}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="ຢືນຢັນການລຶບ"
        message={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະນັກງານ ${selectedEmployee?.name}? ຂໍ້ມູນການເຂົ້າລະບົບຂອງພະນັກງານຄົນນີ້ຈະຖືກລຶບອອກເຊັ່ນກັນ.`}
        confirmText="ລຶບຂໍ້ມູນ"
        onConfirm={() => handleDeleteSubmit(onDeleteClose)}
        icon={<Trash2 size={24} />}
        color="danger"
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
    </div>
  );
}
