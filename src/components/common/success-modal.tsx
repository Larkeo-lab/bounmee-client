import React from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface SuccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  onClose?: () => void;
}

export default function SuccessModal({
  isOpen,
  onOpenChange,
  title = "ສຳເລັດ!",
  message = "ການດຳເນີນງານສຳເລັດແລ້ວ",
  onClose,
}: SuccessModalProps) {
  const handleClose = () => {
    onOpenChange(false);
    onClose?.();
  };

  return (
    <React.Fragment>
      <Modal
        backdrop="blur"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalBody className="flex flex-col items-center gap-4 py-8">
            {/* Animated Checkmark */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                    />
                  </svg>
                </div>
              </div>

              {/* Success particles animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                    style={{
                      top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 30}px`,
                      left: `${20 + Math.cos((i * 60 * Math.PI) / 180) * 30}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
            </div>
            <h2 className="font-bold">{title}</h2>
            <p className="text-center -mt-3">{message}</p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button
              className="px-8"
              color="success"
              variant="solid"
              onPress={handleClose}
            >
              ຕົກລົງ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
}
