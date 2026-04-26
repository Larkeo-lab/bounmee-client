import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Phone,
  MessageSquareQuote,
} from "lucide-react";

import { useGetContacts } from "@/services/contact/useContact";

interface PendingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PendingModal({
  isOpen,
  onOpenChange,
}: PendingModalProps) {
  const { t } = useTranslation();
  const { data: contacts } = useGetContacts();

  const adminContact = contacts && contacts.length > 0 ? contacts[0] : null;

  const handleWhatsAppRedirect = () => {
    // 💡 Fallback number if none found in backend
    const phoneNumber = adminContact?.phoneNumber || "8562099999999";
    const message = encodeURIComponent(
      "Sabaidee, I would like to inquire about my store approval status.",
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank");
    onOpenChange(false);
  };

  return (
    <Modal
      hideCloseButton
      backdrop="blur"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998] bg-black/30",
        base: "border-none shadow-2xl rounded-[32px]",
      }}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalBody className="py-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-warning-50 flex items-center justify-center text-warning mb-4 shadow-inner">
            <Mail size={28} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-center text-default-800">
            {t("settings.common.pendingTitle")}
          </h3>
          <p className="text-default-500 text-sm text-center mt-2 px-4 leading-normal font-medium">
            {t("settings.common.pendingMsg")}
          </p>

          {adminContact && (
            <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="relative p-5 bg-gradient-to-br from-default-50 to-default-100 rounded-[24px] border border-divider/40 shadow-sm overflow-hidden">
                <div className="relative flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar
                      showFallback
                      className="w-14 h-14 border-2 border-white shadow-md bg-warning-50"
                      name={adminContact.name}
                      src={adminContact.profileImage}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-default-800 truncate">
                        {adminContact.name}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-warning">
                        {t("settings.common.administrator")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {adminContact.facebook && (
                        <a
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          href={adminContact.facebook}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Facebook size={14} />
                        </a>
                      )}
                      {adminContact.instagram && (
                        <a
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                          href={adminContact.instagram}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Instagram size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-default-600 bg-white/60 py-1.5 px-3 rounded-xl border border-divider/10 shadow-sm overflow-hidden">
                      <Mail className="text-warning flex-shrink-0" size={12} />
                      <span className="text-[11px] font-semibold truncate">
                        {adminContact.email}
                      </span>
                    </div>
                    {adminContact.phoneNumber && (
                      <div className="flex items-center gap-2 text-default-600 bg-white/60 py-1.5 px-3 rounded-xl border border-divider/10 shadow-sm">
                        <Phone className="text-warning" size={12} />
                        <span className="text-[11px] font-semibold">
                          {adminContact.phoneNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {adminContact.content && (
                    <div className="w-full bg-white/40 p-3 rounded-xl border border-divider/5 italic text-default-600 text-[11px] text-center relative leading-relaxed">
                      <MessageSquareQuote
                        className="absolute -top-1 -left-1 text-warning/20"
                        size={12}
                      />
                      "{adminContact.content}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex flex-col gap-3 p-6 pt-2 border-t border-divider/30 bg-default-50/30">
          <Button
            fullWidth
            className="font-bold h-12 rounded-2xl shadow-success/30"
            color="primary"
            startContent={<MessageCircle size={20} />}
            variant="solid"
            onPress={handleWhatsAppRedirect}
          >
            {t("settings.common.contactWhatsApp")}
          </Button>
          <Button
            fullWidth
            className="font-bold h-12 rounded-2xl"
            color="primary"
            variant="flat"
            onPress={() => onOpenChange(false)}
          >
            {t("settings.common.ok")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
