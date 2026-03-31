import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Trash2 } from "lucide-react";

interface CloseTableConfirmProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export default function CloseTableConfirm({
  isOpen,
  onOpenChange,
  tableName,
  isLoading,
  onConfirm,
}: CloseTableConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 text-danger">
              <Trash2 size={20} />
              ຢືນຢັນການປິດໂຕະ
            </ModalHeader>
            <ModalBody>
              <p className="text-default-700">
                ທ່ານຕ້ອງການປິດ{" "}
                <span className="font-bold text-danger">ໂຕະ {tableName}</span>{" "}
                ແທ້ບໍ?
              </p>
              <p className="text-sm text-default-500">
                ການກະທຳນີ້ຈະລ້າງຂໍ້ມູນຕະກ້າສິນຄ້າທັງໝົດ ແລະ
                ປ່ຽນສະຖານະໂຕະເປັນຫວ່າງ.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                ຍົກເລີກ
              </Button>
              <Button
                color="danger"
                isLoading={isLoading}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                startContent={<Trash2 size={16} />}
              >
                ຢືນຢັນປິດໂຕະ
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
