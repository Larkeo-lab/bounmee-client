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
import { useCreateTable, useUpdateTable } from "@/services/table/useTable";
import { useCreateZone, useUpdateZone } from "@/services/table/useZone";
import { toast } from "react-hot-toast";

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
  const [formData, setFormData] = useState<any>({});

  const { mutateAsync: createTable, isPending: isCreatingTable } =
    useCreateTable();
  const { mutateAsync: updateTable, isPending: isUpdatingTable } =
    useUpdateTable();
  const { mutateAsync: createZone, isPending: isCreatingZone } = useCreateZone();
  const { mutateAsync: updateZone, isPending: isUpdatingZone } = useUpdateZone();

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
          toast.error("ກະລຸນາເລືອກໂຊນກ່ອນບັນທຶກ");
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-primary">
                {isEditing ? "ແກ້ໄຂ" : "ເພີ່ມ"}{" "}
                {modalType === "table" ? "ໂຕະອາຫານ" : "ໂຊນ"}
              </h2>
            </ModalHeader>
            <ModalBody className="gap-4 pb-8">
              {modalType === "table" ? (
                <>
                  <Input
                    label="ຊື່ໂຕະ"
                    placeholder="T-01"
                    variant="bordered"
                    labelPlacement="outside"
                    value={formData.name || ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                  <Input
                    label="ຈຳນວນບ່ອນນັ່ງ"
                    placeholder="4"
                    variant="bordered"
                    type="number"
                    labelPlacement="outside"
                    value={formData.capacity?.toString() || ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, capacity: val })
                    }
                  />
                  <Select
                    label="ໂຊນ"
                    placeholder="ເລືອກໂຊນ"
                    variant="bordered"
                    labelPlacement="outside"
                    selectedKeys={formData.zoneId ? [formData.zoneId] : []}
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
                    label="ຊື່ໂຊນ"
                    placeholder="VIP Zone"
                    variant="bordered"
                    labelPlacement="outside"
                    value={formData.name || ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, name: val })
                    }
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                ຍົກເລີກ
              </Button>
              <Button color="primary" isLoading={isPending} onPress={() => handleSave(onClose)}>
                ບັນທຶກ
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
