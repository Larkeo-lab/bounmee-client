import { useAuth } from "@/routes";
import {
  User,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import ModalConfirm from "./common/modal-confirm";
import { useTranslation } from "react-i18next";
import { Info, LogOut } from "lucide-react";
import { getDisplayImageUrl } from "@/lib/utils";

export default function ProfileDropdown() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { logout, user: userProfile } = useAuth();

  // Handle logout actions
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src:
                userProfile?.user?.role === "EMPLOYEE"
                  ? getDisplayImageUrl(userProfile?.user?.employee?.logoUrl)
                  : getDisplayImageUrl(userProfile?.user?.store?.logoUrl),
              size: "sm",
            }}
            className="transition-transform cursor-pointer"
            classNames={{
              name: "hidden sm:block",
              description: "hidden sm:block",
            }}
            description={userProfile?.user?.email}
            name={
              <p className="font-bold">
                {userProfile?.user?.userName || userProfile?.user?.email}
              </p>
            }
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User Actions"
          variant="flat"
          className="opacity-80 p-3"
        >
          <DropdownItem
            key="profile"
            className="h-14 gap-2"
            href="/settings/profile"
          >
            <p className="font-bold">
              {userProfile?.user?.userName || userProfile?.user?.email}
            </p>
            <p className="text-xs">{userProfile?.user?.email}</p>
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            onPress={() => setTimeout(onOpen, 100)}
            startContent={<LogOut size={18} />}
          >
            {t("navigation.logout")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Modal confirm logout */}
      <ModalConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={handleLogout}
        confirmText={t("auth.logoutConfirm")}
        cancelText={t("auth.logoutCancel")}
        content={t("auth.logoutConfirmMsg")}
        title={t("auth.logoutConfirmTitle")}
        icon={<Info size={28} />}
      />
    </>
  );
}
