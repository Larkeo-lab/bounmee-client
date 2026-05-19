import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardBody,
} from "@heroui/react";
import { Filter, Calendar, Clock, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface FilterDateProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: (start: string, end: string) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilter,
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const presets = [
    { key: "today", label: t("order.today") || "ມື້ນີ້", color: "success" },
    { key: "yesterday", label: t("order.yesterday") || "ມື້ວານ", color: "primary" },
    { key: "3days", label: t("order.last3Days") || "3 ມື້ກ່ອນ", color: "warning" },
    { key: "7days", label: t("order.last7Days") || "7 ມື້ກ່ອນ", color: "danger" },
    { key: "1month", label: t("order.lastMonth") || "1 ເດືອນກ່ອນ", color: "secondary" },
    { key: "3month", label: t("order.last3Months") || "3 ເດືອນກ່ອນ", color: "secondary" },
    { key: "5month", label: t("order.last5Months") || "5 ເດືອນກ່ອນ", color: "secondary" },
    { key: "1year", label: t("order.lastYear") || "1 ປີກ່ອນ", color: "secondary" },
  ];

  const handlePresetClick = (key: string, onClose: () => void) => {
    const today = dayjs().format("YYYY-MM-DD");
    let start = today;
    let end = today;

    switch (key) {
      case "today":
        start = today;
        break;
      case "yesterday":
        start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        end = start;
        break;
      case "3days":
        start = dayjs().subtract(2, "day").format("YYYY-MM-DD");
        break;
      case "7days":
        start = dayjs().subtract(6, "day").format("YYYY-MM-DD");
        break;
      case "1month":
        start = dayjs().subtract(1, "month").format("YYYY-MM-DD");
        break;
      case "3month":
        start = dayjs().subtract(3, "month").format("YYYY-MM-DD");
        break;
      case "5month":
        start = dayjs().subtract(5, "month").format("YYYY-MM-DD");
        break;
      case "1year":
        start = dayjs().subtract(1, "year").format("YYYY-MM-DD");
        break;
    }
    onFilter(start, end);
    onClose();
  };

  return (
    <>
      <Button
        className="font-bold shadow-sm"
        color="primary"
        size="sm"
        startContent={<Filter size={18} />}
        variant="flat"
        onPress={onOpen}
      >
        {t("order.filterTime") || "ກັ່ນຕອງວັນທີ"}
      </Button>

      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary" size={20} />
                  <span className="text-lg font-black text-default-800">
                    {t("order.filterTime") || "ກັ່ນຕອງວັນທີ"}
                  </span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Custom Range Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-default-400 uppercase px-1">
                        {t("order.start") || "ເລີ່ມຕົ້ນ"}
                      </span>
                      <div className="flex items-center gap-2 bg-default-100 p-2.5 rounded-2xl border border-divider focus-within:border-primary transition-all">
                        <input
                          className="bg-transparent border-none text-sm font-bold outline-none w-full"
                          type="date"
                          value={startDate}
                          onChange={(e) => onStartDateChange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-default-400 uppercase px-1">
                        {t("order.end") || "ສິ້ນສຸດ"}
                      </span>
                      <div className="flex items-center gap-2 bg-default-100 p-2.5 rounded-2xl border border-divider focus-within:border-primary transition-all">
                        <input
                          className="bg-transparent border-none text-sm font-bold outline-none w-full"
                          type="date"
                          value={endDate}
                          onChange={(e) => onEndDateChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Presets Grid */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-default-400 uppercase px-1">
                      {t("order.quickFilter") || "ຕົວຕອງດ່ວນ"}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {presets.map((preset) => (
                        <Card
                          isPressable
                          key={preset.key}
                          className="border-none bg-default-50 hover:bg-primary/5 transition-all shadow-none"
                          onPress={() => handlePresetClick(preset.key, onClose)}
                        >
                          <CardBody className="py-2 px-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-xl bg-${preset.color}/10 text-${preset.color}`}
                              >
                                <Clock size={16} />
                              </div>
                              <span className="font-bold text-sm text-default-700 truncate max-w-[80px]">
                                {preset.label}
                              </span>
                            </div>
                            <ChevronRight
                              className="text-default-300 flex-shrink-0"
                              size={16}
                            />
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="w-full font-bold h-12 rounded-2xl"
                  color="primary"
                  onPress={() => {
                    onFilter(startDate, endDate);
                    onClose();
                  }}
                >
                  {t("common.apply") || "ນຳໃຊ້ຕົວຕອງ"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FilterDate;
