import { useState, useMemo, useRef, type ChangeEvent } from "react";
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
  Switch,
  Spinner,
  Image,
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, Landmark, Upload, X } from "lucide-react";

import { useAuth } from "@/routes/AuthContext";
import {
  useGetBanks,
  useCreateBank,
  useUpdateBank,
  useDeleteBank,
  Bank,
} from "@/services/bank/useBank";
import { useUploadImage } from "@/services/storage";
import { getDisplayImageUrl } from "@/lib/utils";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import PendingModal from "@/components/common/pending-modal";

export default function BankPage() {
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
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [qrCodePreview, setQrCodePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    qrCodeImage: "",
    isActive: true,
  });

  const { data: bankResponse, isLoading } = useGetBanks(user?.user?.storeId);
  const banks = bankResponse?.data || [];

  const createBankMutation = useCreateBank();
  const updateBankMutation = useUpdateBank();
  const deleteBankMutation = useDeleteBank(user?.user?.storeId);
  const uploadImageMutation = useUploadImage();

  const filteredItems = useMemo(() => {
    let filtered = [...banks];

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [banks, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createBankMutation.mutateAsync({
        ...formData,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create bank:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedBank) return;
    try {
      await updateBankMutation.mutateAsync({
        ...formData,
        id: selectedBank.id,
        storeId: user?.user?.storeId || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to update bank:", error);
    }
  };

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedBank) return;
    try {
      await deleteBankMutation.mutateAsync(selectedBank.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete bank:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logoUrl: "",
      qrCodeImage: "",
      isActive: true,
    });
    setPreviewImage("");
    setQrCodePreview("");
    setSelectedBank(null);
  };

  const handleEditOpen = (bank: Bank) => {
    setSelectedBank(bank);
    setFormData({
      name: bank.name,
      logoUrl: bank.logoUrl || "",
      qrCodeImage: bank.qrCodeImage || "",
      isActive: bank.isActive,
    });
    setPreviewImage(bank.logoUrl || "");
    setQrCodePreview(bank.qrCodeImage || "");
    onUpdateOpen();
  };

  const handleDeleteOpen = (bank: Bank) => {
    setSelectedBank(bank);
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

  const handleQrCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);

        setQrCodePreview(previewUrl);

        const imageName = await uploadImageMutation.mutateAsync(file);

        setFormData((prev) => ({ ...prev, qrCodeImage: imageName }));
      } catch (error) {
        console.error("Failed to upload QR code:", error);
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

  const removeQrCode = () => {
    setFormData((prev) => ({ ...prev, qrCodeImage: "" }));
    setQrCodePreview("");
  };

  const bankForm = (
    <div className="space-y-4 py-2">
      <div className="flex justify-center gap-8 mb-4">
        {/* Logo Upload */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-tiny text-default-500 font-medium">
            {t("settings.bank.logo")}
          </p>
          <div
            className={`
              relative group cursor-pointer
              w-24 h-24 rounded-full border-2 border-dashed 
              transition-all duration-200 ease-in-out
              flex items-center justify-center overflow-hidden
              ${previewImage || formData.logoUrl ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadImageMutation.isPending ? (
              <Spinner color="primary" />
            ) : previewImage || formData.logoUrl ? (
              <>
                <Image
                  alt="Preview"
                  className="w-full h-full object-cover"
                  src={getDisplayImageUrl(previewImage || formData.logoUrl)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit2 className="text-white" size={20} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-default-400">
                <Upload size={20} />
                <span className="text-tiny">{t("settings.common.upload")}</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleImageChange}
            />
          </div>
          {(previewImage || formData.logoUrl) && (
            <Button
              color="danger"
              size="sm"
              startContent={<X size={14} />}
              variant="light"
              onPress={removeImage}
            >
              {t("settings.common.remove")}
            </Button>
          )}
        </div>

        {/* QR Code Upload */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-tiny text-default-500 font-medium">
            {t("settings.bank.qr")}
          </p>
          <label className="cursor-pointer">
            <div
              className={`
                relative group
                w-24 h-24 rounded-2xl border-2 border-dashed 
                transition-all duration-200 ease-in-out
                flex items-center justify-center overflow-hidden
                ${qrCodePreview || formData.qrCodeImage ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
              `}
            >
              {uploadImageMutation.isPending ? (
                <Spinner color="primary" />
              ) : qrCodePreview || formData.qrCodeImage ? (
                <>
                  <Image
                    alt="QR Preview"
                    className="w-full h-full object-contain"
                    src={getDisplayImageUrl(
                      qrCodePreview || formData.qrCodeImage,
                    )}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit2 className="text-white" size={20} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-default-400">
                  <Upload size={20} />
                  <span className="text-tiny">
                    {t("settings.common.upload")} QR
                  </span>
                </div>
              )}
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleQrCodeChange}
              />
            </div>
          </label>
          {(qrCodePreview || formData.qrCodeImage) && (
            <Button
              color="danger"
              size="sm"
              startContent={<X size={14} />}
              variant="light"
              onPress={removeQrCode}
            >
              {t("settings.common.remove")} QR
            </Button>
          )}
        </div>
      </div>

      <Input
        isRequired
        label={t("settings.bank.bankName")}
        placeholder={t("settings.bank.bankNamePlaceholder")}
        value={formData.name}
        variant="bordered"
        onValueChange={(val) => setFormData({ ...formData, name: val })}
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-small font-medium">
          {t("settings.common.active")}
        </span>
        <Switch
          isSelected={formData.isActive}
          onValueChange={(val) => setFormData({ ...formData, isActive: val })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Landmark size={28} />
            {t("settings.bank.title")}
          </h1>
          <p className="text-default-500">{t("settings.bank.subtitle")}</p>
        </div>
        <Button
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
        >
          {t("settings.bank.addTitle")}
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
        aria-label="Bank table"
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
          <TableColumn>{t("settings.bank.logo")}</TableColumn>
          <TableColumn>{t("settings.bank.bankName")}</TableColumn>
          <TableColumn>{t("settings.common.status")}</TableColumn>
          <TableColumn className="text-center">
            {t("settings.common.actions")}
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyState />} isLoading={isLoading}>
          {items.map((bank) => (
            <TableRow key={bank.id}>
              <TableCell>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-divider bg-default-50">
                  {bank.logoUrl ? (
                    <Image
                      alt={bank.name}
                      className="w-full h-full object-cover"
                      src={getDisplayImageUrl(bank.logoUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-default-400">
                      <Landmark size={20} />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold">{bank.name}</TableCell>
              <TableCell>
                <Switch
                  isSelected={bank.isActive}
                  size="sm"
                  onValueChange={async (val) => {
                    try {
                      await updateBankMutation.mutateAsync({
                        id: bank.id,
                        isActive: val,
                        storeId: user?.user?.storeId,
                      });
                    } catch (error) {
                      console.error("Failed to update bank status:", error);
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    size="sm"
                    variant="light"
                    onPress={() => handleEditOpen(bank)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDeleteOpen(bank)}
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
                {t("settings.bank.addTitle")}
              </ModalHeader>
              <ModalBody>{bankForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name}
                  isLoading={
                    createBankMutation.isPending ||
                    uploadImageMutation.isPending
                  }
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
                {t("settings.bank.editTitle")}
              </ModalHeader>
              <ModalBody>{bankForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!formData.name}
                  isLoading={
                    updateBankMutation.isPending ||
                    uploadImageMutation.isPending
                  }
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
