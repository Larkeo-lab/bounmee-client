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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, LayoutGrid } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from "@/services/category/useCategory";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";

export default function CategoryPage() {
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const rowsPerPage = 30;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categoryResponse, isLoading } = useGetCategories(
    user?.user?.storeId,
  );
  const categories = categoryResponse?.data || [];

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory(user?.user?.storeId);

  const filteredItems = useMemo(() => {
    let filtered = [...categories];
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [categories, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createCategoryMutation.mutateAsync({
        ...formData,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedCategory) return;
    try {
      await updateCategoryMutation.mutateAsync({
        ...formData,
        id: selectedCategory.id,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setSelectedCategory(null);
  };

  const handleEditOpen = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    onUpdateOpen();
  };

  const handleDeleteOpen = (category: Category) => {
    setSelectedCategory(category);
    onDeleteOpen();
  };

  const handleCreateOpen = () => {
    // @ts-ignore
    if (user?.user?.store?.status === "PENDING") {
      onPendingOpen();
    } else {
      onCreateOpen();
    }
  };

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <LayoutGrid size={28} />
            ຈັດການປະເພດສິນຄ້າ
          </h1>
          <p className="text-default-500">
            ຈັດການໝວດໝູ່ສິນຄ້າທັງໝົດໃນຮ້ານຂອງທ່ານ
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
        >
          ເພີ່ມປະເພດສິນຄ້າໃໝ່
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          placeholder="ຄົ້ນຫາປະເພດສິນຄ້າ..."
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
        aria-label="Category table"
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
          <TableColumn>#</TableColumn>
          <TableColumn>ຊື່ປະເພດສິນຄ້າ</TableColumn>
          {/* <TableColumn>ຄຳອະທິບາຍ</TableColumn> */}
          <TableColumn className="text-center">ຈັດການ</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={<EmptyState />}>
          {items.map((category,index) => (
            <TableRow key={category.id}>
              <TableCell className="font-semibold">{index + 1}</TableCell>
              <TableCell className="font-semibold">{category.name}</TableCell>
              {/* <TableCell className="text-default-500 max-w-xs truncate">
                {category.description || "-"}
              </TableCell> */}
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => handleEditOpen(category)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleDeleteOpen(category)}
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ເພີ່ມປະເພດສິນຄ້າໃໝ່
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="ຊື່ປະເພດສິນຄ້າ"
                    placeholder="ລະບຸຊື່ປະເພດສິນຄ້າ"
                    variant="bordered"
                    value={formData.name}
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  {/* <Textarea
                    label="ຄຳອະທິບາຍ"
                    placeholder="ລະບຸຄຳອະທິບາຍເພີ່ມເຕີມ"
                    variant="bordered"
                    value={formData.description}
                    onValueChange={(val) =>
                      setFormData({ ...formData, description: val })
                    }
                  /> */}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateSubmit(onClose)}
                  isLoading={createCategoryMutation.isPending}
                  isDisabled={!formData.name}
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ແກ້ໄຂປະເພດສິນຄ້າ
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="ຊື່ປະເພດສິນຄ້າ"
                    placeholder="ລະບຸຊື່ປະເພດສິນຄ້າ"
                    variant="bordered"
                    value={formData.name}
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  {/* <Textarea
                    label="ຄຳອະທິບາຍ"
                    placeholder="ລະບຸຄຳອະທິບາຍເພີ່ມເຕີມ"
                    variant="bordered"
                    value={formData.description}
                    onValueChange={(val) =>
                      setFormData({ ...formData, description: val })
                    }
                  /> */}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleUpdateSubmit(onClose)}
                  isLoading={updateCategoryMutation.isPending}
                  isDisabled={!formData.name}
                >
                  ອັບເດດ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="ຢືນຢັນການລຶບ"
        message={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບປະເພດສິນຄ້າ ${selectedCategory?.name}? ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້.`}
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
