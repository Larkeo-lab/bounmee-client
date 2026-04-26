import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
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
  color = "primary",
}: ConfirmModalProps) {
  return (
    <Modal
      hideCloseButton
      backdrop="blur"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998] bg-black/30",
        base: "border-none shadow-2xl",
      }}
      isOpen={isOpen}
      placement="center"
      size="xs"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalBody className="py-6 flex flex-col items-center">
          {icon && (
            <div
              className={`w-14 h-14 rounded-full bg-${color}/10 flex items-center justify-center text-${color} mb-4 scale-110`}
            >
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
            className="font-bold h-11"
            variant="flat"
            onPress={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            fullWidth
            className={`font-bold h-11 shadow-lg shadow-${color}/20`}
            color={color}
            onPress={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
