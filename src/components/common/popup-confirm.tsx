import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@heroui/react";
import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  icon?: ReactNode;
  color?: "danger" | "warning" | "primary" | "success" | "default";
}

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmText = "ຢືນຢັນ",
  cancelText = "ຍົກເລີກ",
  onConfirm,
  icon,
  color = "danger"
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xs"
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "border-none shadow-2xl",
        backdrop: "bg-black/30"
      }}
    >
      <ModalContent>
        <ModalBody className="py-6 flex flex-col items-center">
          {icon && (
            <div className={`w-14 h-14 rounded-full bg-${color}/10 flex items-center justify-center text-${color} mb-4 scale-110`}>
              {icon}
            </div>
          )}
          <h3 className="text-xl font-bold text-center">{title}</h3>
          <p className="text-default-500 text-sm text-center mt-2 px-4 leading-relaxed">
            {message}
          </p>
        </ModalBody>
        <ModalFooter className="flex gap-2 p-4 border-t border-divider/50 bg-default-50/50">
          <Button
            fullWidth
            variant="flat"
            onPress={() => onOpenChange(false)}
            className="font-bold h-11"
          >
            {cancelText}
          </Button>
          <Button
            fullWidth
            color={color}
            onPress={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`font-bold h-11 shadow-lg shadow-${color}/20`}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
