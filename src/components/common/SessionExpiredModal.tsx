import React from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { LogIn } from "lucide-react";

import { useAuth } from "@/routes/AuthContext";
import { onSessionExpired, resetSessionExpired } from "@/lib/sessionExpired";

// Mounted once at the app root so it can pop up over any page when the API
// reports an expired/missing token (handled in the axios interceptor).
export default function SessionExpiredModal() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSessionExpired(() => setIsOpen(true));

    return unsubscribe;
  }, []);

  const handleRelogin = () => {
    setIsOpen(false);
    resetSessionExpired();
    logout(); // clears storage + redirects to landing/login
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop:
          "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled
      isOpen={isOpen}
      placement="center"
    >
      <ModalContent>
        <ModalBody className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <LogIn className="text-red-500" size={36} />
          </div>
          <h2 className="font-bold text-lg">ເຊດຊັນໝົດອາຍຸ / Session Expired</h2>
          <p className="text-sm text-gray-500 -mt-2 max-w-xs">
            ການເຂົ້າສູ່ລະບົບຂອງທ່ານໝົດອາຍຸແລ້ວ. ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່ອີກຄັ້ງ.
          </p>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            className="px-8 bg-[#075e3d] text-white font-bold"
            variant="solid"
            onPress={handleRelogin}
          >
            ເຂົ້າສູ່ລະບົບໃໝ່
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
