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
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  JapaneseYen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import {
  useGetMoneyRates,
  useCreateMoneyRate,
  useUpdateMoneyRate,
  useDeleteMoneyRate,
  MoneyRate,
} from "@/services/moneyRate/useMoneyRate";
import { formatNumber, parseNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";

export default function MoneyRatePage() {
  const { t, i18n } = useTranslation();
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
  const {
    isOpen: isRejectedOpen,
    onOpen: onRejectedOpen,
    onClose: onRejectedClose,
    onOpenChange: onRejectedOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRate, setSelectedRate] = useState<MoneyRate | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    rateSell: "",
    rateBuy: "",
  });

  const {
    data: moneyRateResponse,
    isLoading: isRatesLoading,
    refetch: getRates,
  } = useGetMoneyRates(user?.user?.storeId);
  const moneyRates: MoneyRate[] = moneyRateResponse?.data || [];

  const createRateMutation = useCreateMoneyRate();
  const updateRateMutation = useUpdateMoneyRate();
  const deleteRateMutation = useDeleteMoneyRate(user?.user?.store?.id);

  const isLoading = isRatesLoading;

  const filteredItems = useMemo(() => {
    let filtered = [...moneyRates];
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [moneyRates, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createRateMutation.mutateAsync({
        name: formData.name,
        rateSell: parseNumber(formData.rateSell),
        rateBuy: parseNumber(formData.rateBuy),
        storeId: user?.user?.store?.id || "",
      });
      resetForm();
      onClose();
      getRates();
    } catch (error) {
      console.error("Failed to create money rate:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedRate) return;

    try {
      await updateRateMutation.mutateAsync({
        id: selectedRate.id,
        name: formData.name,
        rateSell: parseNumber(formData.rateSell),
        rateBuy: parseNumber(formData.rateBuy),
        storeId: user?.user?.store?.id,
      });
      resetForm();
      onClose();
      getRates();
    } catch (error) {
      console.error("Failed to update money rate:", error);
    }
  };

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedRate) return;
    try {
      await deleteRateMutation.mutateAsync(selectedRate.id);
      onClose();
      getRates();
    } catch (error) {
      console.error("Failed to delete money rate:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rateSell: "",
      rateBuy: "",
    });
    setSelectedRate(null);
  };

  const handleEditOpen = (item: MoneyRate) => {
    setSelectedRate(item);
    setFormData({
      name: item.name || "",
      rateSell: formatNumber(item.rateSell),
      rateBuy: formatNumber(item.rateBuy),
    });
    onUpdateOpen();
  };

  const handleDeleteOpen = (item: MoneyRate) => {
    setSelectedRate(item);
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

  const rateForm = (
    <div className="space-y-4 py-2">
      <Input
        label={`${t("settings.common.nameLabel")} (Name)`}
        placeholder={t("settings.moneyRate.title")}
        variant="bordered"
        value={formData.name}
        onValueChange={(val) => setFormData({ ...formData, name: val })}
        isRequired
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("settings.moneyRate.sellRate")}
          placeholder="0.00"
          variant="bordered"
          value={formData.rateSell}
          onValueChange={(val) =>
            setFormData({ ...formData, rateSell: formatNumber(val) })
          }
          isRequired
          startContent={<TrendingUp size={18} className="text-success" />}
        />
        <Input
          label="ອັດຕາຊື้ (Buy Rate)"
          placeholder="0.00"
          variant="bordered"
          value={formData.rateBuy}
          onValueChange={(val) =>
            setFormData({ ...formData, rateBuy: formatNumber(val) })
          }
          isRequired
          startContent={<TrendingDown size={18} className="text-danger" />}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <JapaneseYen size={28} />
            {t("settings.moneyRate.title")}
          </h1>
          <p className="text-default-500">{t("settings.moneyRate.subtitle")}</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={handleCreateOpen}
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
        >
          {t("settings.moneyRate.addTitle")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          placeholder={t("settings.common.search")}
          startContent={<Search className="text-default-400" size={18} />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          variant="bordered"
        />
        <div className="text-default-400 text-sm">
          {t("settings.common.total", { count: filteredItems.length })}
        </div>
      </div>

      <Table
        aria-label="Money Rate table"
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
          <TableColumn>{t("settings.common.nameLabel")}</TableColumn>
          <TableColumn>{t("settings.moneyRate.sellRate")} (Sell)</TableColumn>
          <TableColumn>{t("settings.moneyRate.buyRate")} (Buy)</TableColumn>
          <TableColumn>{t("settings.moneyRate.lastUpdated")}</TableColumn>
          <TableColumn className="text-center">{t("settings.common.actions")}</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={<EmptyState />}>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-divider bg-default-50">
                    <JapaneseYen size={20} className="text-default-400" />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-success font-bold">
                  {formatNumber(item.rateSell)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-danger font-bold">
                  {formatNumber(item.rateBuy)}
                </span>
              </TableCell>
              <TableCell>
                {new Date(item.updatedAt).toLocaleString(i18n.language === "en" ? "en-US" : i18n.language === "lo" ? "lo-LA" : "th-TH")}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => handleEditOpen(item)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleDeleteOpen(item)}
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
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ເພີ່ມອັດຕาແລກປ່ຽນໃໝ່
              </ModalHeader>
              <ModalBody>{rateForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateSubmit(onClose)}
                  isLoading={createRateMutation.isPending}
                  isDisabled={
                    !formData.name || !formData.rateSell || !formData.rateBuy
                  }
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
        onOpenChange={onUpdateOpenChange}
        placement="center"
        onClose={resetForm}
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("settings.moneyRate.editTitle")}
              </ModalHeader>
              <ModalBody>{rateForm}</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t("settings.common.cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleUpdateSubmit(onClose)}
                  isLoading={updateRateMutation.isPending}
                  isDisabled={
                    !formData.name || !formData.rateSell || !formData.rateBuy
                  }
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
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title={t("settings.common.confirmDelete")}
        message={t("settings.common.confirmDeleteMsg")}
        confirmText={t("settings.common.delete")}
        onConfirm={() => handleDeleteSubmit(onDeleteClose)}
        icon={<Trash2 size={24} />}
        color="danger"
      />

      {/* Pending Status Modal */}
      <ConfirmModal
        isOpen={isPendingOpen}
        onOpenChange={onPendingOpenChange}
        title={t("settings.common.pendingTitle")}
        message={t("settings.common.pendingMsg")}
        confirmText={t("settings.common.ok")}
        onConfirm={onPendingClose}
        color="warning"
      />

      {/* Rejected Status Modal */}
      <ConfirmModal
        isOpen={isRejectedOpen}
        onOpenChange={onRejectedOpenChange}
        title={t("settings.common.rejectedTitle")}
        message={t("settings.common.rejectedMsg")}
        confirmText={t("settings.common.ok")}
        onConfirm={onRejectedClose}
        color="danger"
      />
    </div>
  );
}
