import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import { useCreateTable, useUpdateTable } from "@/services/table/useTable";
import { useCreateZone, useUpdateZone } from "@/services/table/useZone";

interface CreateAndEditProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  modalType: "table" | "zone";
  item: any;
  zones: any[];
  storeId: string;
}

export default function CreateAndEdit({
  isOpen,
  onOpenChange,
  isEditing,
  modalType,
  item,
  zones,
  storeId,
}: CreateAndEditProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<any>({});

  const { mutateAsync: createTable, isPending: isCreatingTable } =
    useCreateTable();
  const { mutateAsync: updateTable, isPending: isUpdatingTable } =
    useUpdateTable();
  const { mutateAsync: createZone, isPending: isCreatingZone } =
    useCreateZone();
  const { mutateAsync: updateZone, isPending: isUpdatingZone } =
    useUpdateZone();

  const isPending =
    isCreatingTable || isUpdatingTable || isCreatingZone || isUpdatingZone;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData(item);
      } else {
        if (modalType === "table") {
          setFormData({ name: "", capacity: 4, zoneId: "" });
        } else {
          setFormData({ name: "", description: "" });
        }
      }
    }
  }, [isOpen, item, modalType]);

  const handleSave = async (onClose: () => void) => {
    try {
      if (modalType === "table") {
        if (!formData.zoneId) {
          toast.error(t("settings.table.selectZoneError"));

          return;
        }
        const payload = {
          storeId: storeId,
          name: formData.name,
          capacity: Number(formData.capacity) || 0,
          zoneId: formData.zoneId,
        };

        if (isEditing) {
          await updateTable({ id: formData.id, ...payload });
        } else {
          await createTable(payload);
        }
      } else {
        const payload = {
          storeId: storeId,
          name: formData.name,
          description: formData.description,
        };

        if (isEditing) {
          await updateZone({ id: formData.id, ...payload });
        } else {
          await createZone(payload);
        }
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-primary">
                {isEditing
                  ? t("settings.common.edit")
                  : t("settings.common.addNew")}{" "}
                {modalType === "table"
                  ? t("settings.table.title")
                  : t("settings.table.zone")}
              </h2>
            </ModalHeader>
            <ModalBody className="gap-4 pb-8">
              {modalType === "table" ? (
                <>
                  <Input
                    label={t("settings.table.tableName")}
                    labelPlacement="outside"
                    placeholder={t("settings.table.tableName")}
                    value={formData.name || ""}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  <Input
                    label={t("settings.table.seats")}
                    labelPlacement="outside"
                    placeholder="4"
                    type="number"
                    value={formData.capacity?.toString() || ""}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, capacity: val })
                    }
                  />
                  <Select
                    label={t("settings.table.zone")}
                    labelPlacement="outside"
                    placeholder={t("settings.table.zone")}
                    selectedKeys={formData.zoneId ? [formData.zoneId] : []}
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormData({
                        ...formData,
                        zoneId: Array.from(keys)[0] as string,
                      })
                    }
                  >
                    {zones.map((zone: any) => (
                      <SelectItem key={zone.id}>{zone.name}</SelectItem>
                    ))}
                  </Select>
                </>
              ) : (
                <>
                  <Input
                    label={t("settings.table.zoneName")}
                    labelPlacement="outside"
                    placeholder={t("settings.table.zoneName")}
                    value={formData.name || ""}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t("settings.common.cancel")}
              </Button>
              <Button
                color="primary"
                isLoading={isPending}
                onPress={() => handleSave(onClose)}
              >
                {t("settings.common.save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
