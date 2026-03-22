import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDraggable,
} from "@heroui/react";

interface ModalConfirmProps {
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  onConfirm?: () => void;
  onCancel?: () => void;
  showTriggerButton?: boolean;
  triggerButtonText?: string;
  isDraggable?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  closeOnConfirm?: boolean;
}

export default function ModalConfirm({
  isOpen,
  onOpen,
  onOpenChange,
  title = "Modal Confirm Title",
  content,
  confirmText = "Action",
  cancelText = "Close",
  confirmColor = "primary",
  onConfirm,
  onCancel,
  showTriggerButton = false,
  triggerButtonText = "Open Modal",
  isDraggable = true,
  icon,
  isLoading = false,
  closeOnConfirm = true,
}: ModalConfirmProps) {
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen || !isDraggable });

  const handleConfirm = () => {
    onConfirm?.();
    if (closeOnConfirm) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <>
      {showTriggerButton && onOpen && (
        <Button onPress={onOpen}>{triggerButtonText}</Button>
      )}
      <Modal ref={targetRef} isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          <ModalHeader {...(isDraggable ? moveProps : {})} className="flex justify-start items-center gap-1">
            <div className="w-10 h-10 rounded-full flex justify-center items-center">{icon}</div>  ແຈ້ງເຕືອນ
          </ModalHeader>
          <ModalBody className="min-h-20">
            <h5 className="font-semibold ">{title}</h5>
            <p className="text-sm text-gray-500 -mt-2">{content}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={handleCancel} isDisabled={isLoading}>
              {cancelText}
            </Button>
            <Button color={confirmColor} onPress={handleConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

