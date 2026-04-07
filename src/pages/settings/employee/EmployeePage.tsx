import { useState, useMemo, useRef, type ChangeEvent } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Image,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Upload,
  X,
  Phone,
  User,
  Lock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  Employee,
} from "@/services/employee/useEmployee";
import { useUploadImage } from "@/services/storage";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGetStoreDetail } from "@/services/store/useStore";
import { useGetPermissions } from "@/services/role-permission";
import EmptyState from "@/components/common/empty-state";

export default function EmployeePage() {
  const { user } = useAuth();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onOpenChange: onUpdateOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    phone: "",
    userName: "",
    password: "",
    language: "LA" as "LA" | "EN",
    permissionId: "",
    businessType: "RESTAURANT" as "RETAIL" | "RESTAURANT" | "ONLINE" | "CAFE",
  });

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

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee(user?.user?.storeId);
  const uploadImageMutation = useUploadImage();
  const { data: permissionResponse } = useGetPermissions();
  const permissionsData = permissionResponse?.data || [];

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

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createEmployeeMutation.mutateAsync({
        ...formData,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
      getEmployees();
      getStore();
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedEmployee) return;

    // Only send fields that have changed
    const employeeUser =
      (selectedEmployee as any).users?.[0] || selectedEmployee; // handle both types
    const updateData: any = {
      id: selectedEmployee.id,
      storeId: user?.user?.storeId,
    };

    if (formData.name !== selectedEmployee.name)
      updateData.name = formData.name;
    if (formData.logoUrl !== selectedEmployee.logoUrl)
      updateData.logoUrl = formData.logoUrl;
    if (formData.phone !== employeeUser?.phone)
      updateData.phone = formData.phone;
    if (formData.userName !== employeeUser?.userName)
      updateData.userName = formData.userName;
    if (formData.language !== employeeUser?.language)
      updateData.language = formData.language;
    if (formData.password) updateData.password = formData.password;
    if (formData.permissionId !== selectedEmployee.permissionId)
      updateData.permissionId = formData.permissionId;
    if (formData.businessType !== selectedEmployee.businessType)
      updateData.businessType = formData.businessType;

    if (Object.keys(updateData).length <= 2) {
      onClose();
      return;
    }

    try {
      await updateEmployeeMutation.mutateAsync(updateData);
      resetForm();
      onClose();
      getEmployees();
      getStore();
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

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

  const resetForm = () => {
    setFormData({
      name: "",
      logoUrl: "",
      phone: "",
      userName: "",
      password: "",
      language: "LA",
      permissionId: "",
      businessType: "RESTAURANT",
    });
    setPreviewImage("");
    setSelectedEmployee(null);
  };

  const handleEditOpen = (item: any) => {
    setSelectedEmployee(item.originalEmployee || item);
    setFormData({
      name: item.name,
      logoUrl: item.logoUrl || "",
      phone: item.phone || "",
      userName: item.userName || "",
      language: item.language || "LA",
      password: "",
      permissionId: item.permissionId || "",
      businessType: "RESTAURANT",
    });
    setPreviewImage(item.logoUrl || "");
    onUpdateOpen();
  };

  const handleDeleteOpen = (item: any) => {
    if (item.originalEmployee) {
      setSelectedEmployee(item.originalEmployee);
      onDeleteOpen();
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        const imageName = await uploadImageMutation.mutateAsync(file);
        setFormData((prev) => ({ ...prev, logoUrl: imageName }));
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const employeeForm = (
    <div className="space-y-4 py-2">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group cursor-pointer
            w-24 h-24 rounded-full border-2 border-dashed 
            transition-all duration-200 ease-in-out
            flex items-center justify-center overflow-hidden
            ${previewImage || formData.logoUrl ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
          `}
        >
          {uploadImageMutation.isPending ? (
            <Spinner color="primary" />
          ) : previewImage || formData.logoUrl ? (
            <>
              <Image
                src={getDisplayImageUrl(previewImage || formData.logoUrl)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit2 size={20} className="text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-default-400">
              <Upload size={20} />
              <span className="text-[10px]">ຮູບພາບ</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        {(previewImage || formData.logoUrl) && (
          <Button
            size="sm"
            color="danger"
            variant="light"
            startContent={<X size={14} />}
            onPress={removeImage}
            className="h-7 min-w-0"
          >
            ລົບຮູບ
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ຊື່ພະນັກງານ"
          placeholder="ລະບຸຊື່ພະນັກງານ"
          variant="bordered"
          value={formData.name}
          onValueChange={(val) => setFormData({ ...formData, name: val })}
          isRequired
          startContent={<User size={18} className="text-default-400" />}
        />
        <Input
          label="ເບີໂທລະສັບ"
          placeholder="20XXXXXXXX"
          variant="bordered"
          value={formData.phone}
          onValueChange={(val) => setFormData({ ...formData, phone: val })}
          isRequired
          startContent={<Phone size={18} className="text-default-400" />}
        />
        <Input
          label="ຊື່ຜູ້ໃຊ້ (Username)"
          placeholder="ລະບຸ Username"
          variant="bordered"
          value={formData.userName}
          onValueChange={(val) => setFormData({ ...formData, userName: val })}
          isRequired
          startContent={<User size={18} className="text-default-400" />}
        />
        {!selectedEmployee && (
          <Input
            label="ລະຫັດຜ່ານ"
            placeholder="ລະບຸລະຫັດຜ່ານ"
            type="password"
            variant="bordered"
            value={formData.password}
            onValueChange={(val) => setFormData({ ...formData, password: val })}
            isRequired
            startContent={<Lock size={18} className="text-default-400" />}
          />
        )}
        <Select
          label="ສິດທິການເຂົ້າເຖິງ"
          placeholder="ເລືອກສິດທິການເຂົ້າເຖິງ"
          variant="bordered"
          selectedKeys={formData.permissionId ? [formData.permissionId] : []}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string;
            setFormData({ ...formData, permissionId: val });
          }}
          startContent={<Shield size={18} className="text-default-400" />}
        >
          {permissionsData.map((perm: any) => (
            <SelectItem key={perm.id}>{perm.name}</SelectItem>
          ))}
        </Select>
        {/* <Select
          label="ຮູບແບບຮ້ານ (Business Type)"
          placeholder="ເລືອກຮູບແບບຮ້ານ"
          variant="bordered"
          selectedKeys={[formData.businessType]}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as any;
            if (val) setFormData({ ...formData, businessType: val });
          }}
          startContent={<StoreIcon size={18} className="text-default-400" />}
        >
          <SelectItem key="RETAIL">ຮ້ານຄ້າທົວໄປ</SelectItem>
          <SelectItem key="RESTAURANT">ຮ້ານອາຫານ (Restaurant)</SelectItem>
          <SelectItem key="CAFE">ຮ້ານກາເຟ (Cafe)</SelectItem>
          <SelectItem key="ONLINE">ອອນໄລນ໌ (Online)</SelectItem>
        </Select> */}
      </div>
    </div>
  );

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
          onPress={onCreateOpen}
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onOpenChange={onCreateOpenChange}
        placement="center"
        onClose={resetForm}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ເພີ່ມພະນັກງານໃໝ່
              </ModalHeader>
              <ModalBody>{employeeForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateSubmit(onClose)}
                  isLoading={
                    createEmployeeMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  isDisabled={
                    !formData.name ||
                    !formData.userName ||
                    (!selectedEmployee && !formData.password)
                  }
                >
                  ບັນທຶກ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={isUpdateOpen}
        onOpenChange={onUpdateOpenChange}
        placement="center"
        onClose={resetForm}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ແກ້ໄຂຂໍ້ມູນພະນັກງານ
              </ModalHeader>
              <ModalBody>{employeeForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleUpdateSubmit(onClose)}
                  isLoading={
                    updateEmployeeMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  isDisabled={!formData.name || !formData.userName}
                >
                  ອັບເດດ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ຢືນຢັນການລຶບ
              </ModalHeader>
              <ModalBody>
                <p>
                  ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະນັກງານ{" "}
                  <strong>{selectedEmployee?.name}</strong>?
                  ຂໍ້ມູນການເຂົ້າລະບົບຂອງພະນັກງານຄົນນີ້ຈະຖືກລຶບອອກເຊັ່ນກັນ.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleDeleteSubmit(onClose)}
                  isLoading={deleteEmployeeMutation.isPending}
                >
                  ລຶບຂໍ້ມູນ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
