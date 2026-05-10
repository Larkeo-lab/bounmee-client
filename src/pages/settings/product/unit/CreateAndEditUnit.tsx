import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useCreateUnit, useUpdateUnit } from "@/services/unit/useUnit";

interface CreateAndEditUnitProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isEditing: boolean;
  item: any;
  storeId: string;
}

export default function CreateAndEditUnit({
  isOpen,
  onOpenChange,
  isEditing,
  item,
  storeId,
}: CreateAndEditUnitProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();

  useEffect(() => {
    if (isEditing && item) {
      setName(item.name);
    } else {
      setName("");
    }
  }, [isEditing, item, isOpen]);

  const handleSubmit = async (onClose: () => void) => {
    try {
      if (isEditing && item) {
        await updateUnitMutation.mutateAsync({
          id: item.id,
          name,
          storeId,
        });
      } else {
        await createUnitMutation.mutateAsync({
          name,
          storeId,
          productId: null, // Global store units
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save unit:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isEditing ? t("settings.common.edit") : t("settings.common.addNew")}
            </ModalHeader>
            <ModalBody>
              <Input
                label={t("settings.common.nameLabel")}
                placeholder={t("settings.common.namePlaceholder")}
                value={name}
                variant="bordered"
                onValueChange={setName}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t("settings.common.cancel")}
              </Button>
              <Button
                color="primary"
                isLoading={createUnitMutation.isPending || updateUnitMutation.isPending}
                onPress={() => handleSubmit(onClose)}
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
