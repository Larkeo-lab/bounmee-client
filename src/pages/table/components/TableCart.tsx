import { useUpdateTable } from "@/services/table/useTable";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Users, Table as TableIcon, CheckCircle2, Clock } from "lucide-react";
import { useCart } from "@/provider";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DIRTY";

export interface TableProps {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  orderId?: string;
  time?: string;
  storeId: string;
  qrCode?: string;
}

export const TableCart = ({
  table,
  onTableSelect,
}: {
  table: TableProps;
  onTableSelect?: (table: TableProps) => void;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const updateTable = useUpdateTable();
  const { carts } = useCart();

  const { t } = useTranslation();
  const tableCart = carts[table.id] || [];

  const pendingCount = (tableCart as any[])
    .filter((i) => i.status === "PENDING")
    .reduce((acc: number, i: any) => acc + i.quantity, 0);
  const cookingCount = (tableCart as any[])
    .filter((i) => i.status === "COOKING")
    .reduce((acc: number, i: any) => acc + i.quantity, 0);
  const servedCount = (tableCart as any[])
    .filter((i) => i.status === "SERVED")
    .reduce((acc: number, i: any) => acc + i.quantity, 0);

  const getStatusColors = (status: TableStatus) => {
    const colorMap = {
      AVAILABLE: {
        wrapper:
          "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200/60 hover:shadow-emerald-500/20 dark:from-emerald-900/20 dark:to-emerald-800/10 dark:border-emerald-800/50",
        indicator: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
        iconText: "text-emerald-600 dark:text-emerald-400",
        chipColor: "success" as const,
      },
      OCCUPIED: {
        wrapper:
          "bg-gradient-to-br from-rose-50 to-rose-100/60 border-rose-200/60 hover:shadow-rose-500/20 dark:from-rose-900/20 dark:to-rose-800/10 dark:border-rose-800/50",
        indicator: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
        iconText: "text-rose-600 dark:text-rose-400",
        chipColor: "danger" as const,
      },
      RESERVED: {
        wrapper:
          "bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-200/60 hover:shadow-amber-500/20 dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-800/50",
        indicator: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
        iconText: "text-amber-600 dark:text-amber-400",
        chipColor: "warning" as const,
      },
      DIRTY: {
        wrapper:
          "bg-gradient-to-br from-slate-50 to-slate-100/60 border-slate-200/60 hover:shadow-slate-500/20 dark:from-slate-900/20 dark:to-slate-800/10 dark:border-slate-800/50",
        indicator: "bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.6)]",
        iconText: "text-slate-600 dark:text-slate-400",
        chipColor: "default" as const,
      },
    };

    return colorMap[status] || colorMap.DIRTY;
  };

  const getStatusLabel = (status: TableStatus) => {
    switch (status) {
      case "AVAILABLE":
        return t("table.stats.available");
      case "OCCUPIED":
        return t("table.stats.occupied");
      case "RESERVED":
        return t("table.stats.reserved");
      case "DIRTY":
        return t("table.stats.dirty");
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle2 size={14} />;
      case "OCCUPIED":
        return <Clock size={14} />;
      case "RESERVED":
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  const colors = getStatusColors(table.status);

  const handleTableClick = () => {
    if (table.status === "AVAILABLE") {
      onOpen();
    } else {
      onTableSelect?.(table);
    }
  };

  return (
    <>
      <Card
        isPressable
        className={`group relative overflow-hidden min-h-[110px] md:min-h-[130px] lg:min-h-[150px] h-auto border-1 backdrop-blur-md transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl select-none touch-manipulation ${colors.wrapper}`}
        onClick={handleTableClick}
      >
        <CardBody className="p-0 flex flex-col h-full overflow-hidden">
          <div
            className={`h-1 !w-full md:h-1.5 shrink-0 ${colors.indicator}`}
          />

          <div className="p-2 md:p-3 flex flex-col flex-grow z-10 relative">
            <div className="flex justify-between items-start mb-1.5 md:mb-2 text-gray-800 dark:text-gray-100">
              <div className="flex flex-col text-left">
                <span className="text-xl md:text-2xl font-black tracking-tight leading-none mb-1">
                  {table.name}
                </span>
                <div
                  className={`flex items-center gap-1.5 ${colors.iconText} opacity-80`}
                >
                  <Users size={12} strokeWidth={2.5} />
                  <span className="text-[11px] font-bold tracking-wide">
                    {t("table.seats", { count: table.capacity })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modern Order Status Summary */}
            <div className="flex flex-col gap-0.5 md:gap-1 mb-2 md:mb-3 mt-1">
              <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/60 dark:border-white/10 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg md:rounded-xl shadow-sm">
                <span className="text-[9px] md:text-[10px] font-bold text-default-600 uppercase tracking-widest text-left">
                  {t("table.cart.total")}:
                </span>
                <span className="text-xs md:text-sm font-black text-primary">
                  {tableCart.reduce(
                    (acc: number, i: any) => acc + i.quantity,
                    0,
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-0.5 md:gap-1.5 px-1 mt-0.5">
                <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                  <span className="flex items-center gap-2 text-default-500 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-default-400" />
                    {t("table.cart.pending")}:
                  </span>
                  <span className="font-black text-default-700">
                    {pendingCount}{" "}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                  <span className="flex items-center gap-2 text-warning-600 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                    {t("table.cart.cooking")}:
                  </span>
                  <span className="font-black text-warning-700">
                    {cookingCount}{" "}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                  <span className="flex items-center gap-2 text-success-600 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    {t("table.cart.served")}:
                  </span>
                  <span className="font-black text-success-700">
                    {servedCount}{" "}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/5">
              <Chip
                startContent={getStatusIcon(table.status)}
                color={colors.chipColor}
                variant="flat"
                size="sm"
                className="font-bold border-none text-[10px] md:text-xs h-5 md:h-6"
              >
                {getStatusLabel(table.status)}
              </Chip>

              {table.time && (
                <span className="text-[10px] font-black text-default-400">
                  {table.time}
                </span>
              )}
            </div>
          </div>

          {/* Decorative Background Icon */}
          <div
            className={`absolute -right-4 -bottom-6 opacity-[0.03] ${colors.iconText} group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000 ease-out z-0`}
          >
            <TableIcon size={120} />
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-center">
            <span className="text-lg font-bold">{t("navigation.table")} {table.name}</span>
          </ModalHeader>
          <ModalBody className="flex flex-col items-center py-4 gap-4">
            <p className="text-center text-lg font-medium text-default-600">
              {t("table.modal.openTableConfirm")}
            </p>
            {table.qrCode && (
              <div className="flex flex-col items-center gap-2 p-4 bg-default-50 rounded-xl border border-default-200 w-full">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-default-100">
                  <QRCodeSVG
                    value={`${window.location.origin}/menu/${table.qrCode}`}
                    size={140}
                    level="M"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-default-400 font-medium block uppercase tracking-widest mb-0.5">
                    {t("table.modal.tableCode")}
                  </span>
                  <span className="text-xl font-black tracking-wider text-primary">
                    {table.qrCode}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              color="primary"
              isLoading={updateTable.isPending}
              onPress={() => {
                updateTable.mutate(
                  { id: table.id, storeId: table.storeId, status: "OCCUPIED" },
                  {
                    onSuccess: () => {
                      onOpenChange();
                      onTableSelect?.({ ...table, status: "OCCUPIED" });
                    },
                  },
                );
              }}
            >
              {t("table.modal.openTable")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
