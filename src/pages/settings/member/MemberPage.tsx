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
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";

import { useAuth } from "@/routes/AuthContext";
import {
  useGetMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  Member,
} from "@/services/member/useMember";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import { formatNumber, parseNumber } from "@/utils/numberFormat";

export default function MemberPage() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 30;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    points: 0,
  });

  const { data: memberResponse, isLoading } = useGetMembers(
    user?.user?.storeId,
    searchQuery
  );
  const members = memberResponse?.data || [];

  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const deleteMemberMutation = useDeleteMember(user?.user?.storeId);

  // Pagination on frontend for now, although API supports search
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return members.slice(start, end);
  }, [page, members]);

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createMemberMutation.mutateAsync({
        ...formData,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create member:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedMember) return;
    try {
      await updateMemberMutation.mutateAsync({
        ...formData,
        id: selectedMember.id,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedMember) return;
    try {
      await deleteMemberMutation.mutateAsync(selectedMember.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      points: 0,
    });
    setSelectedMember(null);
  };

  const handleEditOpen = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      points: member.points,
    });
    onUpdateOpen();
  };

  const handleDeleteOpen = (member: Member) => {
    setSelectedMember(member);
    onDeleteOpen();
  };

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users size={28} />
            {t("settings.member.title")}
          </h1>
          <p className="text-default-500">{t("settings.member.subtitle")}</p>
        </div>
        <Button
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
          color="primary"
          startContent={<Plus size={20} />}
          onPress={onCreateOpen}
        >
          {t("settings.member.addTitle")}
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
          {t("settings.common.total", { count: members.length })}
        </div>
      </div>

      <Table
        aria-label="Member table"
        bottomContent={
          members.length > rowsPerPage && (
            <div className="flex w-full justify-center p-4">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={Math.ceil(members.length / rowsPerPage)}
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
          <TableColumn>{t("settings.member.nameLabel")}</TableColumn>
          <TableColumn>{t("settings.member.phoneLabel")}</TableColumn>
          <TableColumn>{t("settings.member.pointsLabel")}</TableColumn>
          <TableColumn className="text-center">
            {t("settings.common.actions")}
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyState />} isLoading={isLoading}>
          {items.map((member: Member, index: number) => (
            <TableRow key={member.id}>
              <TableCell className="font-semibold">
                {(page - 1) * rowsPerPage + index + 1}
              </TableCell>
              <TableCell className="font-semibold">{member.name}</TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell className="font-bold text-primary">
                {formatNumber(member.points)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => handleEditOpen(member)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDeleteOpen(member)}
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
        scrollBehavior="inside"
        size="lg"
        onClose={resetForm}
        onOpenChange={onCreateOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-primary">
                {t("settings.member.addTitle")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6 py-2">
                  <Input
                    isRequired
                    label={t("settings.member.nameLabel")}
                    labelPlacement="outside"
                    placeholder={t("settings.member.namePlaceholder")}
                    value={formData.name}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  <Input
                    isRequired
                    label={t("settings.member.phoneLabel")}
                    labelPlacement="outside"
                    placeholder={t("settings.member.phonePlaceholder")}
                    value={formData.phone}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, phone: val })
                    }
                  />
                  <Input
                    label={t("settings.member.pointsLabel")}
                    labelPlacement="outside"
                    placeholder="0"
                    type="text"
                    value={formatNumber(formData.points)}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, points: parseNumber(val) })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name || !formData.phone}
                  isLoading={createMemberMutation.isPending}
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
        scrollBehavior="inside"
        size="lg"
        onClose={resetForm}
        onOpenChange={onUpdateOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-primary">
                {t("settings.member.editTitle")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6 py-2">
                  <Input
                    isRequired
                    label={t("settings.member.nameLabel")}
                    labelPlacement="outside"
                    placeholder={t("settings.member.namePlaceholder")}
                    value={formData.name}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  <Input
                    isRequired
                    label={t("settings.member.phoneLabel")}
                    labelPlacement="outside"
                    placeholder={t("settings.member.phonePlaceholder")}
                    value={formData.phone}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, phone: val })
                    }
                  />
                  <Input
                    label={t("settings.member.pointsLabel")}
                    labelPlacement="outside"
                    placeholder="0"
                    type="text"
                    value={formatNumber(formData.points)}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, points: parseNumber(val) })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name || !formData.phone}
                  isLoading={updateMemberMutation.isPending}
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
    </div>
  );
}
