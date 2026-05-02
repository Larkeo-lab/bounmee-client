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
import PendingModal from "@/components/common/pending-modal";

export default function CategoryPage() {
  const { t } = useTranslation();
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
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRejectedOpen,
    onOpen: onRejectedOpen,
    onClose: onRejectedClose,
    onOpenChange: onRejectedOpenChange,
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
    const storeStatus = user?.user?.store?.status;

    if (storeStatus === "PENDING") {
      onPendingOpen();
    } else if (storeStatus === "REJECTED") {
      onRejectedOpen();
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
            {t("settings.category.title")}
          </h1>
          <p className="text-default-500">{t("settings.category.subtitle")}</p>
        </div>
        <Button
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
        >
          {t("settings.category.addTitle")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          placeholder={t("settings.common.search")}
          startContent={<Search className="text-default-400" size={18} />}
          value={searchQuery}
          variant="bordered"
          onValueChange={setSearchQuery}
        />
        <div className="text-default-400 text-sm">
          {t("settings.common.total", { count: filteredItems.length })}
        </div>
      </div>

      <Table
        aria-label="Category table"
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
        className="mt-4"
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
      >
        <TableHeader>
          <TableColumn>{t("settings.common.no")}</TableColumn>
          <TableColumn>{t("settings.common.nameLabel")}</TableColumn>
          <TableColumn className="text-center">
            {t("settings.common.actions")}
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyState />} isLoading={isLoading}>
          {items.map((category, index) => (
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
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => handleEditOpen(category)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
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
        placement="center"
        onClose={resetForm}
        onOpenChange={onCreateOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("settings.category.addTitle")}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label={t("settings.category.nameLabel")}
                    placeholder={t("settings.category.namePlaceholder")}
                    value={formData.name}
                    variant="bordered"
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
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name}
                  isLoading={createCategoryMutation.isPending}
                  onPress={() => handleCreateSubmit(onClose)}
                >
                  {t("settings.common.save")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={isUpdateOpen}
        placement="center"
        onClose={resetForm}
        onOpenChange={onUpdateOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("settings.category.editTitle")}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label={t("settings.common.nameLabel")}
                    placeholder={t("settings.common.namePlaceholder")}
                    value={formData.name}
                    variant="bordered"
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
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name}
                  isLoading={updateCategoryMutation.isPending}
                  onPress={() => handleUpdateSubmit(onClose)}
                >
                  {t("settings.common.update")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        color="danger"
        confirmText={t("settings.common.delete")}
        icon={<Trash2 size={24} />}
        isOpen={isDeleteOpen}
        message={t("settings.common.confirmDeleteMsg")}
        title={t("settings.common.confirmDelete")}
        onConfirm={() => handleDeleteSubmit(onDeleteClose)}
        onOpenChange={onDeleteOpenChange}
      />

      {/* Pending Status Modal */}
      <PendingModal isOpen={isPendingOpen} onOpenChange={onPendingOpenChange} />

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
    </div>
  );
}
