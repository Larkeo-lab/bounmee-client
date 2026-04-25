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

export default function BankPage() {
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
    if (user?.user?.store?.status === "PENDING") {
      onPendingOpen();
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
          <p className="text-tiny text-default-500 font-medium">ຮູບໂລໂກ້</p>
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
                <span className="text-tiny">ອັບໂຫລດ</span>
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
            >
              ລົບຮູບ
            </Button>
          )}
        </div>

        {/* QR Code Upload */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-tiny text-default-500 font-medium">QR Code ຮັບເງິນ</p>
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
                    src={getDisplayImageUrl(qrCodePreview || formData.qrCodeImage)}
                    alt="QR Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit2 size={20} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-default-400">
                  <Upload size={20} />
                  <span className="text-tiny">ອັບໂຫລດ QR</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleQrCodeChange}
              />
            </div>
          </label>
          {(qrCodePreview || formData.qrCodeImage) && (
            <Button
              size="sm"
              color="danger"
              variant="light"
              startContent={<X size={14} />}
              onPress={removeQrCode}
            >
              ລົບ QR
            </Button>
          )}
        </div>
      </div>

      <Input
        label="ຊື່ທະນາຄານ"
        placeholder="ລະບຸຊື່ທະນາຄານ"
        variant="bordered"
        value={formData.name}
        onValueChange={(val) => setFormData({ ...formData, name: val })}
        isRequired
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-small font-medium">ເປີດນຳໃຊ້</span>
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
            ຈັດການທະນາຄານ
          </h1>
          <p className="text-default-500">
            ຈັດການຂໍ້ມູນທະນາຄານສຳລັບຮັບຜ່ານ QR Code
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
        >
          ເພີ່ມທະນາຄານໃໝ່
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          placeholder="ຄົ້ນຫາທະນາຄານ..."
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
        aria-label="Bank table"
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
          <TableColumn>ຮູບໂລໂກ້</TableColumn>
          <TableColumn>ຊື່ທະນາຄານ</TableColumn>
          <TableColumn>ສະຖານະ</TableColumn>
          <TableColumn className="text-center">ຈັດການ</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={<EmptyState />}>
          {items.map((bank) => (
            <TableRow key={bank.id}>
              <TableCell>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-divider bg-default-50">
                  {bank.logoUrl ? (
                    <Image
                      src={getDisplayImageUrl(bank.logoUrl)}
                      alt={bank.name}
                      className="w-full h-full object-cover"
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
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => handleEditOpen(bank)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
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
        onOpenChange={onCreateOpenChange}
        placement="center"
        onClose={resetForm}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ເພີ່ມທະນາຄານໃໝ່
              </ModalHeader>
              <ModalBody>{bankForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateSubmit(onClose)}
                  isLoading={
                    createBankMutation.isPending ||
                    uploadImageMutation.isPending
                  }
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
                ແກ້ໄຂຂໍ້ມູນທະນາຄານ
              </ModalHeader>
              <ModalBody>{bankForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleUpdateSubmit(onClose)}
                  isLoading={
                    updateBankMutation.isPending ||
                    uploadImageMutation.isPending
                  }
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
        message={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບທະນາຄານ ${selectedBank?.name}? ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້.`}
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
